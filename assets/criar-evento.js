import { db } from './firebase-config.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

document.getElementById('formCriarEvento').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const nome = document.getElementById('nome').value;
  const data = document.getElementById('data').value;
  const responsavel = document.getElementById('responsavel').value;

  const itens = [];
  const itemElements = document.querySelectorAll('.item');

  itemElements.forEach(item => {
    const nomeItem = item.querySelector('.item-nome').value;
    const quantidadeEnviada = parseInt(item.querySelector('.item-quantidade').value, 10);
    itens.push({ nomeItem, quantidadeEnviada });
  });

  // Criando evento no Firebase
  const eventosRef = ref(db, 'eventos');
  const novoRef = push(eventosRef);
  const id = novoRef.key;

  set(novoRef, {
    nome: nome || "Novo Evento",
    data: data || new Date().toISOString().split('T')[0],
    responsavel: responsavel || "Não informado",
    status: "aberto",
    itens: itens
  }).then(() => {
    alert("Evento criado com sucesso!");
    window.location.href = '../index.html'; // Redireciona de volta ao painel
  }).catch((error) => {
    alert("Erro ao criar evento: " + error.message);
  });
});

document.getElementById('adicionar-item').addEventListener('click', () => {
  const itensContainer = document.getElementById('itens-container');
  const novoItem = document.createElement('div');
  novoItem.classList.add('item');
  novoItem.innerHTML = `
    <label for="item">Nome do Item:</label>
    <input type="text" class="item-nome" placeholder="Nome do item" required><br><br>
    <label for="quantidade">Quantidade Enviada:</label>
    <input type="number" class="item-quantidade" placeholder="Quantidade enviada" required><br><br>
  `;
  itensContainer.appendChild(novoItem);
});
