import { db } from './firebase-config.js';
import { ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

function criarEvento() {
  const eventosRef = ref(db, 'eventos');
  const novoRef = push(eventosRef);
  const id = novoRef.key;

  // Prompt para coletar nome, data e responsável do evento
  const nome = prompt("Nome do evento:");
  const data = prompt("Data do evento (YYYY-MM-DD):");
  const responsavel = prompt("Responsável pelo evento:");

  const itens = [];
  let adicionarMaisItens = true;

  // Adicionar itens até o usuário dizer que não quer mais
  while (adicionarMaisItens) {
    const nomeItem = prompt("Nome do item:");
    const quantidadeEnviada = parseInt(prompt("Quantidade enviada do item:"), 10);
    itens.push({ nomeItem, quantidadeEnviada });

    // Pergunta se o usuário quer adicionar outro item
    adicionarMaisItens = confirm("Deseja adicionar mais itens?");
  }

  set(novoRef, {
    nome: nome || "Novo Evento",
    data: data || new Date().toISOString().split('T')[0],
    responsavel: responsavel || "Não informado",
    status: "aberto",
    itens: itens
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
      Responsável: ${evento.responsavel} <br>
      Data: ${evento.data} <br>
      <a href="form.html?id=${id}" target="_blank">Link do Formulário</a>
    `;
    div.appendChild(p);
  }
});
