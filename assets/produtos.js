import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  update
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
const produtosRef = ref(db, "produtos");

const form = document.getElementById("produto-form");
const lista = document.getElementById("lista-produtos");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("produto-id").value;
  const nome = document.getElementById("nome").value.trim();
  const valorVenda = parseFloat(document.getElementById("valorVenda").value || 0);
  const custo = parseFloat(document.getElementById("custo").value || 0);

  if (!nome) return;

  const produtoData = { nome, valorVenda, custo };

  if (id) {
    // Atualiza produto existente
    const updateRef = ref(db, `produtos/${id}`);
    update(updateRef, produtoData);
  } else {
    // Cria novo produto
    const novoRef = push(produtosRef);
    set(novoRef, produtoData);
  }

  form.reset();
  document.getElementById("produto-id").value = "";
});

onValue(produtosRef, (snapshot) => {
  lista.innerHTML = "";
  if (snapshot.exists()) {
    const produtos = snapshot.val();
    Object.entries(produtos).forEach(([id, produto]) => {
      const li = document.createElement("li");

      const formatarMoeda = (valor) =>
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(valor || 0);

      li.innerHTML = `
        <strong>${produto.nome}</strong><br>
        Venda: ${formatarMoeda(produto.valorVenda)} /
        Custo: ${formatarMoeda(produto.custo)}
        <br><button data-id="${id}">Editar</button>
      `;
      li.querySelector("button").onclick = () => editarProduto(id, produto);
      lista.appendChild(li);
    });
  } else {
    lista.innerHTML = "<p>Nenhum produto cadastrado.</p>";
  }
});

function editarProduto(id, produto) {
  document.getElementById("produto-id").value = id;
  document.getElementById("nome").value = produto.nome;
  document.getElementById("valorVenda").value = produto.valorVenda || "";
  document.getElementById("custo").value = produto.custo || "";
}
