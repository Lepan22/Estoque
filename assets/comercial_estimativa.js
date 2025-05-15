import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBN-bmzgrlzjmrKMmuClZ8LVll-vJyx-aE",
  authDomain: "controleestoquelepan.firebaseapp.com",
  databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com",
  projectId: "controleestoquelepan",
  storageBucket: "controleestoquelepan.appspot.com",
  messagingSenderId: "779860276544",
  appId: "1:779860276544:web:f45844571a8c0bab1576a5"
};

// Inicia Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Referências
const form = document.getElementById('estimativa-form');
const tabela = document.getElementById('corpo-tabela');
let idEditando = null;

// Envio do formulário
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const data = form.data.value;
  const categoria = form.categoria.value;
  const valor = parseFloat(form.valor.value);

  if (!data || !categoria || isNaN(valor)) return;

  if (idEditando) {
    update(ref(db, 'comercial_estimativa/' + idEditando), { data, categoria, valor });
    idEditando = null;
  } else {
    push(ref(db, 'comercial_estimativa'), { data, categoria, valor });
  }

  form.reset();
});

// Carrega dados
function carregarEstimativas() {
  const estimativaRef = ref(db, 'comercial_estimativa');

  onValue(estimativaRef, (snapshot) => {
    tabela.innerHTML = '';
    let alternar = false;

    snapshot.forEach(child => {
      const item = child.val();
      const id = child.key;
      const row = document.createElement('tr');
      row.style.backgroundColor = alternar ? '#f9f9f9' : '#ffffff';
      alternar = !alternar;

      row.innerHTML = `
        <td style="padding: 8px;">${item.data}</td>
        <td>${item.categoria}</td>
        <td>R$ ${parseFloat(item.valor).toFixed(2)}</td>
        <td>
          <button onclick="editar('${id}', '${item.data}', '${item.categoria}', ${item.valor})">Editar</button>
          <button onclick="excluir('${id}')">Excluir</button>
        </td>
      `;
      tabela.appendChild(row);
    });
  }, {
    onlyOnce: false // Mantém ouvindo atualizações
  });
}

window.editar = function(id, data, categoria, valor) {
  form.data.value = data;
  form.categoria.value = categoria;
  form.valor.value = valor;
  idEditando = id;
}

window.excluir = function(id) {
  if (confirm("Deseja excluir esta estimativa?")) {
    remove(ref(db, 'comercial_estimativa/' + id));
  }
}

carregarEstimativas();
