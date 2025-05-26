
// main.js – med UTR og grupper
const app = document.getElementById('app');
let players = [];
let groups = [];

function render() {
  app.innerHTML = `
    <h2>Registrer spiller</h2>
    <form id="playerForm">
      <input type="text" id="name" placeholder="Navn" required />
      <input type="number" id="age" placeholder="Alder" required />
      <input type="number" step="0.1" id="utr" placeholder="UTR" required />
      <button type="submit">Legg til</button>
    </form>

    <h3>Registrerte spillere (sortert etter UTR):</h3>
    <ul>
      ${players
        .sort((a, b) => a.utr - b.utr)
        .map(p => `<li>${p.name}, ${p.age} år, UTR: ${p.utr}</li>`)
        .join('')}
    </ul>

    ${players.length >= 3 ? '<button onclick="autoDistributeGroups()">Autofordel grupper</button>' : ''}
    ${groups.length > 0 ? renderGroups() : ''}
  `;

  document.getElementById('playerForm').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const age = parseInt(document.getElementById('age').value.trim());
    const utr = parseFloat(document.getElementById('utr').value.trim());
    if (name && age && utr >= 0) {
      const newPlayerRef = db.ref('players').push();
      newPlayerRef.set({ name, age, utr });
      document.getElementById('name').value = '';
      document.getElementById('age').value = '';
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
}

function renderGroups() {
  return `
    <h3>Gruppeoppsett</h3>
    ${groups.map((group, i) => `
      <h4>Gruppe ${String.fromCharCode(65 + i)}</h4>
      <ul>
        ${group.map(p => `<li>${p.name} (UTR: ${p.utr})</li>`).join('')}
      </ul>
    `).join('')}
  `;
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
}

listenToData();
