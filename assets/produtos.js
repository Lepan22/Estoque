import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  get,
  onValue
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBN-bmzgrlzjmrKMmuClZ8LVll-vJyx-aE",
  authDomain: "controleestoquelepan.firebaseapp.com",
  databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com",
  projectId: "controleestoquelepan",
  storageBucket: "controleestoquelepan.appspot.com",
  messagingSenderId: "779860276544",
  appId: "1:779860276544:web:f45844571a8c0bab1576a5",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const form = document.getElementById("produtoForm");
const idInput = document.getElementById("produtoId");
const nomeInput = document.getElementById("nome");
const valorVendaInput = document.getElementById("valorVenda");
const custoInput = document.getElementById("custo");
const container = document.getElementById("produtosContainer");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const valorVenda = parseFloat(valorVendaInput.value) || 0;
  const custo = parseFloat(custoInput.value) || 0;

  if (!nome) {
    alert("Informe o nome do produto.");
    return;
  }

  const id = idInput.value;

  if (id) {
    await update(ref(db, `produtos/${id}`), { nome, valorVenda, custo });
  } else {
    const novoRef = push(ref(db, "produtos"));
    await set(novoRef, { nome, valorVenda, custo });
  }

  form.reset();
  idInput.value = "";
  carregarProdutos();
});

function carregarProdutos() {
  const produtosRef = ref(db, "produtos");

  onValue(produtosRef, (snapshot) => {
    if (!snapshot.exists()) {
      container.innerHTML = "<p>Nenhum produto cadastrado.</p>";
      return;
    }

    const produtos = snapshot.val();
    container.innerHTML = "";

    Object.entries(produtos).forEach(([id, produto]) => {
      const div = document.createElement("div");
      div.className = "produto";
      div.innerHTML = `
        <p><strong>Nome:</strong> ${produto.nome}</p>
        <p><strong>Valor Venda:</strong> R$ ${produto.valorVenda?.toFixed(2) || "0,00"}</p>
        <p><strong>Custo:</strong> R$ ${produto.custo?.toFixed(2) || "0,00"}</p>
        <button class="botao-editar" data-id="${id}">Editar</button>
      `;
      container.appendChild(div);
    });

    document.querySelectorAll(".botao-editar").forEach(botao => {
      botao.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        preencherFormulario(id);
      });
    });
  });
}

function preencherFormulario(id) {
  get(ref(db, `produtos/${id}`)).then(snapshot => {
    if (snapshot.exists()) {
      const produto = snapshot.val();
      idInput.value = id;
      nomeInput.value = produto.nome || "";
      valorVendaInput.value = produto.valorVenda || "";
      custoInput.value = produto.custo || "";
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

carregarProdutos();
