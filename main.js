
// main.js – komplett med spillere, grupper, kamper og Firebase-lytting
const app = document.getElementById('app');
let players = [];
let groups = [];
let matches = [];

function render() {
  app.innerHTML = `
    <h2>Registrer spiller</h2>
    <form id="playerForm">
      <input type="text" id="name" placeholder="Navn" required />
      <input type="number" id="age" placeholder="Alder" required />
      <select id="gender" required>
        <option value="">Velg kjønn</option>
        <option value="Mann">Mann</option>
        <option value="Kvinne">Kvinne</option>
        <option value="Annet">Annet</option>
      </select>
      <input type="text" id="phone" placeholder="Telefonnummer" required />
      <input type="number" step="0.1" id="utr" placeholder="UTR" required />
      <button type="submit">Legg til</button>
    </form>

    <h3>Registrerte spillere:</h3>
    <ul>
      ${players.sort((a, b) => a.utr - b.utr).map(p => `
        <li>${p.name} (${p.age} år, ${p.gender}, Tlf: ${p.phone}) – UTR: ${p.utr}</li>
      `).join('')}
    </ul>

    ${players.length >= 3 ? '<button onclick="autoDistributeGroups()">Autofordel grupper</button>' : ''}
    ${groups.length > 0 ? renderGroups() : ''}
  `;

  document.getElementById('playerForm').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const age = parseInt(document.getElementById('age').value.trim());
    const gender = document.getElementById('gender').value;
    const phone = document.getElementById('phone').value.trim();
    const utr = parseFloat(document.getElementById('utr').value.trim());
    if (name && age && gender && phone && utr >= 0) {
      const newRef = db.ref('players').push();  // Ensures unique key
      newRef.set({ name, age, gender, phone, utr });
      e.target.reset();
    }
  };
}

function autoDistributeGroups() {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  groups = [];
  const size = 4;
  for (let i = 0; i < shuffled.length; i += size) {
    groups.push(shuffled.slice(i, i + size));
  }
  db.ref('groups').set(groups);
  generateGroupMatches(groups);
}

function renderGroups() {
  return `
    <h3>Gruppeoppsett og kamper</h3>
    ${groups.map((group, i) => `
      <div class="group-card">
        <h4>Gruppe ${String.fromCharCode(65 + i)}</h4>
        <ul>
          ${group.map(p => `<li>${p.name} (UTR: ${p.utr}) – ${p.gender}</li>`).join('')}
        </ul>
        ${renderGroupMatches(i)}
      </div>
    `).join('')}
  `;
}

function generateGroupMatches(groupList) {
  let allMatches = [];
  groupList.forEach(group => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        allMatches.push({
          p1: group[i].name,
          p2: group[j].name,
          sets: ["", "", ""],
          winner: ""
        });
      }
    }
  });
  db.ref('matches').set(allMatches);
}

function renderGroupMatches(groupIndex) {
  const group = groups[groupIndex];
  if (!group || group.length < 2) return "";
  let html = "<ul>";
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const match = matches.find(m =>
        (m.p1 === group[i].name && m.p2 === group[j].name) ||
        (m.p1 === group[j].name && m.p2 === group[i].name));
      if (!match) continue;
      html += `
        <li>
          ${match.p1} vs ${match.p2} ${match.winner ? `– <strong>Vinner: ${match.winner}</strong>` : ""}
          <div>
            Sett 1: <input size="2" onchange="updateSet('${match.p1}','${match.p2}',0,this.value)">
            - <input size="2" onchange="updateSet('${match.p2}','${match.p1}',0,this.value)">
            <br>Sett 2: <input size="2" onchange="updateSet('${match.p1}','${match.p2}',1,this.value)">
            - <input size="2" onchange="updateSet('${match.p2}','${match.p1}',1,this.value)">
            <br>Sett 3: <input size="2" onchange="updateSet('${match.p1}','${match.p2}',2,this.value)">
            - <input size="2" onchange="updateSet('${match.p2}','${match.p1}',2,this.value)">
          </div>
        </li>
      `;
    }
  }
  html += "</ul>";
  return html;
}

function updateSet(p1, p2, setIndex, score) {
  db.ref('matches').once('value', snapshot => {
    snapshot.forEach(child => {
      const m = child.val();
      if (
        (m.p1 === p1 && m.p2 === p2) ||
        (m.p1 === p2 && m.p2 === p1)
      ) {
        const sets = m.sets || ["", "", ""];
        if (m.p1 === p1) {
          sets[setIndex] = `${score}-${sets[setIndex]?.split("-")[1] || ""}`;
        } else {
          sets[setIndex] = `${sets[setIndex]?.split("-")[0] || ""}-${score}`;
        }
        const winner = computeWinner(sets, m.p1, m.p2);
        db.ref('matches/' + child.key).update({ sets, winner });
      }
    });
  });
}

function computeWinner(sets, p1, p2) {
  let w1 = 0, w2 = 0;
  for (let s of sets) {
    const [a, b] = s.split("-").map(n => parseInt(n));
    if (isNaN(a) || isNaN(b)) continue;
    if (a > b) w1++; else if (b > a) w2++;
  }
  if (w1 >= 2) return p1;
  if (w2 >= 2) return p2;
  return "";
}

function listenToData() {
  db.ref('players').on('value', snapshot => {
    players = [];
    snapshot.forEach(child => players.push(child.val()));
    render();
  });
  db.ref('groups').on('value', snapshot => {
    groups = [];
    snapshot.forEach(child => groups.push(child.val()));
    render();
  });
  db.ref('matches').on('value', snapshot => {
    matches = [];
    snapshot.forEach(child => matches.push(child.val()));
    render();
  });
}

listenToData();
