
// main.js – med visning av kjønn i grupper
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

    <h3>Registrerte spillere (lav UTR er best):</h3>
    <ul>
      ${players
        .sort((a, b) => a.utr - b.utr)
        .map(p => `<li>${p.name} (${p.age} år, ${p.gender}, Tlf: ${p.phone}) – UTR: ${p.utr}</li>`)
        .join('')}
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
      const newPlayerRef = db.ref('players').push();
      newPlayerRef.set({ name, age, gender, phone, utr });
      document.getElementById('name').value = '';
      document.getElementById('age').value = '';
      document.getElementById('gender').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('utr').value = '';
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
          result: ''
        });
      }
    }
  });
  db.ref('matches').set(allMatches);
}

function renderGroupMatches(groupIndex) {
  const letter = String.fromCharCode(65 + groupIndex);
  const group = groups[groupIndex];
  let html = "<ul>";
  if (!group || group.length < 2) return "";
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const id = `${letter}_${i}_${j}`;
      const match = matches.find(m =>
        (m.p1 === group[i].name && m.p2 === group[j].name) ||
        (m.p1 === group[j].name && m.p2 === group[i].name));
      html += `<li>${group[i].name} vs ${group[j].name}
        <input type="text" onchange="updateResult('${id}', this.value)" 
        value="${match ? match.result : ''}" /></li>`;
    }
  }
  html += "</ul>";
  return html;
}

function updateResult(matchId, result) {
  if (!result) return;
  db.ref('matches').once('value', snapshot => {
    const updates = [];
    snapshot.forEach(child => {
      const match = child.val();
      if (
        `${match.p1}_${match.p2}` === matchId ||
        `${match.p2}_${match.p1}` === matchId
      ) {
        updates.push({ key: child.key, match });
      }
    });
    updates.forEach(entry => {
      db.ref('matches/' + entry.key + '/result').set(result);
    });
  });
}

function listenToData() {
  db.ref('players').on('value', snapshot => {
    players = [];
    snapshot.forEach(child => {
      players.push(child.val());
    });
    render();
  });
  db.ref('groups').on('value', snapshot => {
    groups = [];
    snapshot.forEach(child => {
      groups.push(child.val());
    });
    render();
  });
  db.ref('matches').on('value', snapshot => {
    matches = [];
    snapshot.forEach(child => {
      matches.push(child.val());
    });
    render();
  });
}

listenToData();
