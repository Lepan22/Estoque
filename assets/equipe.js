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
  limparCamposCalculados();
  carregarEquipe();
});

// Atualiza indicadores ao sair do campo Apelido
apelidoInput.addEventListener("blur", () => {
  const apelido = apelidoInput.value.trim();
  if (apelido !== "") {
    calcularIndicadores(apelido);
  }
});

function limparCamposCalculados() {
  document.getElementById("qtdEventos").value = "";
  document.getElementById("mediaPDV").value = "";
  document.getElementById("mediaDiferenca").value = "";
  document.getElementById("mediaPerda").value = "";
}

// Calcula os indicadores para 1 apelido
async function calcularIndicadores(apelido) {
  const eventosRef = ref(db, "eventos");
  const snapshot = await get(eventosRef);
  const eventos = snapshot.val();

  let qtd = 0, totalPDV = 0, totalDiferenca = 0, totalPerda = 0;

  if (eventos) {
    Object.values(eventos).forEach(evento => {
      const analise = evento.analise || {};
      const equipe = analise.equipe || [];

      const encontrou = Array.isArray(equipe)
        ? equipe.some(e => e.apelido === apelido)
        : false;

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

  const mediaPDV = qtd ? (totalPDV / qtd).toFixed(2) : "0.00";
  const mediaDif = qtd ? (totalDiferenca / qtd).toFixed(2) : "0.00";
  const mediaPerda = qtd ? (totalPerda / qtd).toFixed(2) : "0.00";

  document.getElementById("qtdEventos").value = qtd;
  document.getElementById("mediaPDV").value = mediaPDV;
  document.getElementById("mediaDiferenca").value = mediaDif;
  document.getElementById("mediaPerda").value = mediaPerda;

  return { qtd, mediaPDV, mediaDif, mediaPerda };
}

// Carrega equipe e exibe na tabela
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
      <td>${mediaPDV}</td>
      <td>${mediaDif}</td>
      <td>${mediaPerda}</td>
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

  calcularIndicadores(dados.apelido);
};

carregarEquipe();
