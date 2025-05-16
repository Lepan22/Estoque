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

const equipeForm = document.getElementById("equipeForm");
const apelidoInput = document.getElementById("apelido");
const tabelaEquipe = document.getElementById("tabelaEquipe");

function formatarMoeda(valor) {
  return `R$ ${parseFloat(valor).toFixed(2).replace(".", ",")}`;
}

equipeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const equipeId = document.getElementById("equipeId").value || null;
  const data = {
    nome: document.getElementById("nome").value,
    apelido: apelidoInput.value,
    documento: document.getElementById("documento").value,
    valor: parseFloat(document.getElementById("valor").value || 0),
    classificacao: document.getElementById("classificacao").value,
    observacao: document.getElementById("observacao").value
  };

  const equipeRef = ref(db, "equipe");
  if (equipeId) {
    await update(child(equipeRef, equipeId), data);
  } else {
    await push(equipeRef, data);
  }

  alert("Dados salvos com sucesso!");
  equipeForm.reset();
  carregarEquipe();
});

async function calcularIndicadores(nomeOuApelido) {
  const eventosRef = ref(db, "eventos");
  const snapshot = await get(eventosRef);
  const eventos = snapshot.val();

  let qtd = 0, totalPDV = 0, totalDiferenca = 0, totalPerda = 0;

  if (eventos) {
    Object.values(eventos).forEach(evento => {
      const analise = evento.analise || {};
      const equipe = analise.equipe || {};

      const encontrou = Object.values(equipe).some(e =>
        (e.apelido && e.apelido.trim().toLowerCase() === nomeOuApelido.trim().toLowerCase()) ||
        (e.nome && e.nome.trim().toLowerCase() === nomeOuApelido.trim().toLowerCase())
      );

      if (encontrou) {
        qtd++;
        const pdv = parseFloat(analise.vendaPDV) || 0;
        const venda = parseFloat(analise.valorVenda) || 0;
        const perda = parseFloat(analise.valorPerda) || 0;

        totalPDV += pdv;
        totalDiferenca += (pdv - venda);
        totalPerda += perda;
      }
    });
  }

  return {
    qtd,
    mediaPDV: qtd ? (totalPDV / qtd).toFixed(2) : "0.00",
    mediaDif: qtd ? (totalDiferenca / qtd).toFixed(2) : "0.00",
    mediaPerda: qtd ? (totalPerda / qtd).toFixed(2) : "0.00"
  };
}

async function carregarEquipe() {
  const equipeSnap = await get(ref(db, "equipe"));
  const equipe = equipeSnap.val();
  tabelaEquipe.innerHTML = "";

  if (!equipe) return;

  for (const [id, dados] of Object.entries(equipe)) {
    const apelido = dados.apelido || "-";
    const { qtd, mediaPDV, mediaDif, mediaPerda } = await calcularIndicadores(apelido);

    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${apelido}</td>
      <td>${qtd}</td>
      <td>${formatarMoeda(mediaPDV)}</td>
      <td>${formatarMoeda(mediaDif)}</td>
      <td>${formatarMoeda(mediaPerda)}</td>
      <td><button onclick="editarEquipe('${id}')">✏️</button></td>
    `;
    tabelaEquipe.appendChild(linha);
  }
}

window.editarEquipe = async function(id) {
  const snap = await get(child(ref(db), `equipe/${id}`));
  const dados = snap.val();

  document.getElementById("equipeId").value = id;
  document.getElementById("nome").value = dados.nome || "";
  document.getElementById("apelido").value = dados.apelido || "";
  document.getElementById("documento").value = dados.documento || "";
  document.getElementById("valor").value = dados.valor || "";
  document.getElementById("classificacao").value = dados.classificacao || "";
  document.getElementById("observacao").value = dados.observacao || "";
};

carregarEquipe();
