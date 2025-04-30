// importar Firebase (se ainda não importado via bundler)
/* <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
   <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js"></script>
   ou via npm/yarn */

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, push, get, child } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// Configuração do Firebase (substitua pelos seus dados reais)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "controleestoquelepan.firebaseapp.com",
  databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com",
  projectId: "controleestoquelepan",
  storageBucket: "controleestoquelepan.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 1) Buscar produtos e popular o datalist
const listaProdutos = document.getElementById('lista-produtos');
const dbRef = ref(db);
get(child(dbRef, `produtos`))
  .then((snapshot) => {
    if (snapshot.exists()) {
      const produtos = snapshot.val();
      Object.values(produtos).forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.nome; 
        listaProdutos.appendChild(option);
      });
    }
  })
  .catch((error) => {
    console.error("Erro ao carregar produtos:", error);
  });

// 2) Lógica de adicionar linhas de item
const itensContainer = document.getElementById('itens-container');
const addItemBtn = document.getElementById('add-item');

addItemBtn.addEventListener('click', () => {
  const div = document.createElement('div');
  div.className = 'item-line';

  // campo de nome do item com datalist
  const nomeInput = document.createElement('input');
  nomeInput.type = 'text';
  nomeInput.name = 'item-nome';
  nomeInput.setAttribute('list', 'lista-produtos');
  nomeInput.placeholder = 'Escolha o produto';
  nomeInput.required = true;

  // campo de quantidade
  const qtdInput = document.createElement('input');
  qtdInput.type = 'number';
  qtdInput.name = 'item-quantidade';
  qtdInput.placeholder = 'Qtd';
  qtdInput.required = true;
  qtdInput.min = '1';

  // botão remover
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '❌';
  removeBtn.addEventListener('click', () => div.remove());

  div.append(nomeInput, qtdInput, removeBtn);
  itensContainer.appendChild(div);
});

// 3) Salvar evento
const form = document.getElementById('form-evento');
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nomeEvento = form.nome.value;
  const data = form.data.value;
  const responsavel = form.responsavel.value;

  // coleta itens
  const itens = Array.from(document.querySelectorAll('.item-line')).map(line => ({
    nome: line.querySelector('input[name="item-nome"]').value,
    quantidade: line.querySelector('input[name="item-quantidade"]').value
  }));

  // montar objeto
  const evento = { nome: nomeEvento, data, responsavel, itens };

  // enviar ao Firebase
  push(ref(db, 'eventos'), evento)
    .then(() => {
      alert('Evento cadastrado com sucesso!');
      form.reset();
      itensContainer.innerHTML = '';
    })
    .catch(err => {
      console.error('Erro ao salvar evento:', err);
      alert('Ocorreu um erro. Veja o console.');
    });
});
