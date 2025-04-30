import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Firebase config
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

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = form.nome.value.trim();
  const valorVenda = parseFloat(form.valorVenda.value) || 0;
  const custo = parseFloat(form.custo.value) || 0;

  if (!nome) {
    alert("O nome do produto é obrigatório.");
    return;
  }

  const novoProduto = {
    nome,
    valorVenda,
    custo
  };

  try {
    await push(ref(db, "produtos"), novoProduto);
    alert("Produto salvo com sucesso!");
    form.reset();
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    alert("Erro ao salvar produto.");
  }
});
