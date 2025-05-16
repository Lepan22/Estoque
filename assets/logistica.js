import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  update,
  child
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const logisticaForm = document.getElementById("logisticaForm");
const tabelaLogistica = document.getElementById("tabelaLogistica");
const eventoSelect = document.getElementById("evento");

async function carregarEventos() {
  const eventosSnap = await get(ref(db, "eventos"));
  const eventos = eventosSnap.val();
  eventoSelect.innerHTML = "";

  if (!eventos) return;

  Object.entries(eventos).forEach(([id, evento]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = evento.nome || `Evento ${id}`;
    eventoSelect.appendChild(option);
  });
}

logisticaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("logisticaId").value || null;
  const classificacao = document.querySelector("input[name='classificacao']:checked")?.value || "";
  const prestador = document.getElementById("prestador").value;

  const data = {
    nome: document.getElementById("nome").value,
    prestador,
    tipo: document.getElementById("tipo").value,
    documento: document.getElementById("documento").value,
    classificacao,
    observacao: document.getElementById("observacao").value,
    valores: {
      [eventoSelect.value]: parseFloat(document.getElementById("valorEvento").value || 0)
    }
  };

  const refBase = ref(db, "logistica");
  if (id) {
    const atual = await get(child(refBase, id));
    const dadosAntigos = atual.val() || {};
    const novosValores = {
      ...dadosAntigos.valores,
      ...data.valores
    };
    data.valores = novosValores;
    await update(child(refBase, id), data);
  } else {
    await push(refBase, data);
  }

  alert("Cadastro salvo com sucesso!");
  logisticaForm.reset();
  carregarLogistica();
});

async function carregarLogistica() {
  const snap = await get(ref(db, "logistica"));
  const dados = snap.val();
  tabelaLogistica.innerHTML = "";

  if (!dados) return;

  for (const [id, item] of Object.entries(dados)) {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${item.prestador}</td>
      <td>${item.tipo}</td>
      <td><button onclick="editarLogistica('${id}')">✏️</button></td>
    `;
    tabelaLogistica.appendChild(linha);
  }
}

window.editarLogistica = async function(id) {
  const snap = await get(child(ref(db), `logistica/${id}`));
  const item = snap.val();

  document.getElementById("logisticaId").value = id;
  document.getElementById("nome").value = item.nome || "";
  document.getElementById("prestador").value = item.prestador || "";
  document.getElementById("tipo").value = item.tipo || "";
  document.getElementById("documento").value = item.documento || "";
  document.getElementById("observacao").value = item.observacao || "";

  if (item.classificacao) {
    const estrela = document.getElementById(`estrela${item.classificacao}`);
    if (estrela) estrela.checked = true;
  }

  const eventoId = eventoSelect.value;
  const valor = item.valores?.[eventoId] || 0;
  document.getElementById("valorEvento").value = valor;
};

carregarEventos();
carregarLogistica();
