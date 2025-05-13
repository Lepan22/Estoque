
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
const nomenclaturaInput = document.getElementById("nomenclatura");
const valorVendaInput = document.getElementById("valorVenda");
const custoInput = document.getElementById("custo");
const quantidadePorCaixaInput = document.getElementById("quantidadePorCaixa");
const container = document.getElementById("produtosContainer");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const nomenclatura = nomenclaturaInput.value.trim();
  const valorVenda = parseFloat(valorVendaInput.value) || 0;
  const custo = parseFloat(custoInput.value) || 0;
  const quantidadePorCaixa = parseInt(quantidadePorCaixaInput.value) || 0;

  if (!nome) {
    alert("Informe o nome do produto.");
    return;
  }

  const id = idInput.value;
  const produtoData = { nome, nomenclatura, valorVenda, custo, quantidadePorCaixa };

  if (id) {
    await update(ref(db, `produtos/${id}`), produtoData);
  } else {
    const novoRef = push(ref(db, "produtos"));
    await set(novoRef, produtoData);
  }

  form.reset();
  idInput.value = "";
  carregarProdutos();
});

function carregarProdutos() {
  const produtosRef = ref(db, "produtos");

  onValue(produtosRef, (snapshot) => {
    container.innerHTML = "";

    if (!snapshot.exists()) {
      container.innerHTML = "<tr><td colspan='6'>Nenhum produto cadastrado.</td></tr>";
      return;
    }

    const produtos = snapshot.val();

    Object.entries(produtos).forEach(([id, produto]) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${produto.nome}</td>
        <td>${produto.nomenclatura || ""}</td>
        <td>R$ ${produto.valorVenda?.toFixed(2) || "0,00"}</td>
        <td>R$ ${produto.custo?.toFixed(2) || "0,00"}</td>
        <td>${produto.quantidadePorCaixa || ""}</td>
        <td><button class="edit-button" data-id="${id}">Editar</button></td>
      `;
      container.appendChild(row);
    });

    document.querySelectorAll(".edit-button").forEach(botao => {
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
      nomenclaturaInput.value = produto.nomenclatura || "";
      valorVendaInput.value = produto.valorVenda || "";
      custoInput.value = produto.custo || "";
      quantidadePorCaixaInput.value = produto.quantidadePorCaixa || "";
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

carregarProdutos();

// XLS - Exportar
document.getElementById("exportarXLS").addEventListener("click", async () => {
  const produtosSnap = await get(ref(db, "produtos"));
  if (!produtosSnap.exists()) return;

  const produtos = Object.values(produtosSnap.val());
  const ws = XLSX.utils.json_to_sheet(produtos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Produtos");
  XLSX.writeFile(wb, "produtos.xlsx");
});

// XLS - Importar
document.getElementById("importarXLS").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const produtos = XLSX.utils.sheet_to_json(sheet);

    for (const prod of produtos) {
      const novoRef = push(ref(db, "produtos"));
      await set(novoRef, {
        nome: prod.nome || "",
        nomenclatura: prod.nomenclatura || "",
        valorVenda: parseFloat(prod.valorVenda) || 0,
        custo: parseFloat(prod.custo) || 0,
        quantidadePorCaixa: parseInt(prod.quantidadePorCaixa) || 0
      });
    }

    carregarProdutos();
  };
  reader.readAsArrayBuffer(file);
});
