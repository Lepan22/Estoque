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
});

// Quando usuário sair do campo Apelido, atualiza os cálculos
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

async function calcularIndicadores(apelido) {
  const eventosRef = ref(db, "eventos");
  const snapshot = await get(eventosRef);
  const eventos = snapshot.val();

  if (!eventos) return;

  let qtd = 0;
  let totalPDV = 0;
  let totalDiferenca = 0;
  let totalPerda = 0;

  Object.values(eventos).forEach(evento => {
    const analise = evento.analise || {};
    const equipe = analise.equipe || [];

    const encontrou = Array.isArray(equipe)
      ? equipe.some(e => e.apelido === apelido)
      : false;

    if (encontrou) {
      qtd += 1;
      const pdv = parseFloat(analise.vendaPDV) || 0;
      const venda = parseFloat(analise.valorVenda) || 0;
      const perda = parseFloat(analise.valorPerda) || 0;

      totalPDV += pdv;
      totalDiferenca += (pdv - venda);
      totalPerda += perda;
    }
  });

  document.getElementById("qtdEventos").value = qtd;
  document.getElementById("mediaPDV").value = qtd ? (totalPDV / qtd).toFixed(2) : "0.00";
  document.getElementById("mediaDiferenca").value = qtd ? (totalDiferenca / qtd).toFixed(2) : "0.00";
  document.getElementById("mediaPerda").value = qtd ? (totalPerda / qtd).toFixed(2) : "0.00";
}
