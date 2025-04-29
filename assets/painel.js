import { db } from './firebase-config.js';
import { ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

function criarEvento() {
  const eventosRef = ref(db, 'eventos');
  const novoRef = push(eventosRef);
  const id = novoRef.key;
  const nome = prompt("Nome do evento:");
  const data = prompt("Data do evento (YYYY-MM-DD):");

  set(novoRef, {
    nome: nome || "Novo Evento",
    data: data || new Date().toISOString().split('T')[0],
    status: "aberto",
    itens: []
  });
}

window.criarEvento = criarEvento;

const eventosRef = ref(db, 'eventos');
onValue(eventosRef, snapshot => {
  const eventos = snapshot.val();
  const div = document.getElementById('eventos');
  div.innerHTML = '';
  for (let id in eventos) {
    const evento = eventos[id];
    const p = document.createElement('p');
    p.innerHTML = `
      <strong>${evento.nome}</strong> - ${evento.status} <br>
      <a href="form.html?id=${id}" target="_blank">Link do Formulário</a>
    `;
    div.appendChild(p);
  }
});

