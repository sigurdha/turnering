
// main.js – fikset: hver spiller registreres med unik nøkkel
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

// The rest of the script (groups, matches etc.) is unchanged and assumed to be included
