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
const tabelaEventosTemp = document.getElementById("tabelaEventosTemp");
const listaEventosAdicionados = document.getElementById("listaEventosAdicionados");
const adicionarEventoBtn = document.getElementById("adicionarEvento");

let eventosDisponiveis = {};
let eventosSelecionados = {}; // nomeEvento: valor

async function carregarEventos() {
  const eventosSnap = await get(ref(db, "eventos"));
  const eventos = eventosSnap.val();
  eventoSelect.innerHTML = "";

  if (!eventos) return;

  eventosDisponiveis = eventos;

  Object.entries(eventos).forEach(([id, evento]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = evento.nome || `Evento ${id}`;
    eventoSelect.appendChild(option);
  });
}

function atualizarTabelaEventosTemp() {
  tabelaEventosTemp.innerHTML = "";

  const nomes = Object.keys(eventosSelecionados);
  if (nomes.length === 0) {
    listaEventosAdicionados.style.display = "none";
    return;
  }

  listaEventosAdicionados.style.display = "block";

  nomes.forEach((nomeEvento) => {
    const valor = eventosSelecionados[nomeEvento].toFixed(2).replace('.', ',');

    const linha = document.createElement("tr");
    linha.innerHTML = `<td>${nomeEvento}</td><td>R$ ${valor}</td>`;
    tabelaEventosTemp.appendChild(linha);
  });
}

adicionarEventoBtn.addEventListener("click", (e) => {
  e.preventDefault(); // evita submit
  const eventoId = eventoSelect.value;
  const nomeEvento = eventosDisponiveis[eventoId]?.nome;
  const valor = parseFloat(document.getElementById("valorEvento").value || 0);

  if (!nomeEvento || isNaN(valor) || valor <= 0) return;

  eventosSelecionados[nomeEvento] = valor;
  atualizarTabelaEventosTemp();

  document.getElementById("valorEvento").value = "";
});

logisticaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("logisticaId").value || null;
  const classificacao = document.querySelector("input[name='classificacao']:checked")?.value || "";

  const data = {
    nome: document.getElementById("nome").value,
    prestador: document.getElementById("prestador").value,
    tipo: document.getElementById("tipo").value,
    documento: document.getElementById("documento").value,
    classificacao,
    observacao: document.getElementById("observacao").value,
    valores: { ...eventosSelecionados }
  };

  const refBase = ref(db, "logistica");

  if (id) {
    await update(child(refBase, id), data);
  } else {
    await push(refBase, data);
  }

  alert("Cadastro salvo com sucesso!");
  logisticaForm.reset();
  eventosSelecionados = {};
  atualizarTabelaEventosTemp();
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

  eventosSelecionados = { ...(item.valores || {}) };
  atualizarTabelaEventosTemp();
};

carregarEventos();
carregarLogistica();
