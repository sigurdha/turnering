
const app = document.getElementById('app');

let players = [];
let matches = [];

function render() {
  app.innerHTML = `
    <h2>Registrer spiller</h2>
    <form id="playerForm">
      <input type="text" id="name" placeholder="Navn" required />
      <input type="number" id="age" placeholder="Alder" required />
      <button type="submit">Legg til</button>
    </form>
    <h3>Registrerte spillere:</h3>
    <ul>${players.map(p => `<li>${p.name} (${p.age} år)</li>`).join('')}</ul>
    ${players.length >= 2 ? '<button onclick="generateMatches()">Lag spilleplan</button>' : ''}
    ${matches.length > 0 ? renderMatches() : ''}
  `;

  document.getElementById('playerForm').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const age = parseInt(document.getElementById('age').value.trim());
    if (name && age) {
      players.push({ name, age });
      matches = [];
      render();
    }
  };
}

function generateMatches() {
  matches = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        p1: players[i].name,
        p2: players[j].name,
        result: ''
      });
    }
  }
  render();
}

function renderMatches() {
  return `
    <h3>Spilleplan</h3>
    <ul>
      ${matches.map((m, i) => `
        <li>
          ${m.p1} vs ${m.p2}
          <input type="text" placeholder="Resultat" value="${m.result}" 
            onchange="updateResult(${i}, this.value)" />
        </li>`).join('')}
    </ul>
  `;
}

function updateResult(index, result) {
  matches[index].result = result;
}

render();
