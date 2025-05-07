// Firebase config
const firebaseConfig = {
  databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const urlParams = new URLSearchParams(window.location.search);
const eventoId = urlParams.get("id");

let produtosInfo = {};
let totalVenda = 0;
let totalPerda = 0;
let totalLogistica = 0;
let totalEquipe = 0;

function carregarProdutos() {
  return database.ref("produtos").once("value").then(snapshot => {
    produtosInfo = snapshot.val() || {};
  });
}

function carregarEvento() {
  if (!eventoId) return;

  database.ref("eventos/" + eventoId).once("value").then(snapshot => {
    const evento = snapshot.val();
    if (!evento) return alert("Evento não encontrado.");

    document.getElementById("nomeEvento").textContent = evento.nome || "";
    document.getElementById("dataEvento").textContent = evento.data || "";
    document.getElementById("responsavelEvento").textContent = evento.responsavel || "";

    if (evento.analise && evento.analise.vendaPDV) {
      document.getElementById("vendaPDV").value = evento.analise.vendaPDV;
    }

    processarResumo(evento);
  });
}

function processarResumo(evento) {
  const tbody = document.querySelector("#tabelaProdutos tbody");
  tbody.innerHTML = "";

  totalVenda = 0;
  totalPerda = 0;
  totalLogistica = 0;
  totalEquipe = 0;

  if (evento.logistica) {
    totalLogistica = Object.values(evento.logistica).reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
  }

  if (evento.equipe) {
    totalEquipe = Object.values(evento.equipe).reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
  }

  if (evento.produtos) {
    Object.values(evento.produtos).forEach(prod => {
      const info = Object.values(produtosInfo).find(p =>
        (p.nome || "").trim().toLowerCase() === (prod.nome || "").trim().toLowerCase()
      );
      if (!info) return;

      const valorVenda = parseFloat(info.valorVenda || 0);
      const custo = parseFloat(info.custo || 0);
      const enviada = parseInt(prod.quantidade) || 0;
      const congelado = parseInt(prod.congelado) || 0;
      const assado = parseInt(prod.assado) || 0;
      const perda = parseInt(prod.perda) || 0;

      const vendidos = enviada - (congelado + assado + perda);
      const valorTotalVenda = vendidos * valorVenda;
      const custoTotalPerda = perda * custo;

      totalVenda += valorTotalVenda;
      totalPerda += custoTotalPerda;

      const linha = `
        <tr>
          <td>${prod.nome}</td>
          <td>${enviada}</td>
          <td>${congelado}</td>
          <td>${assado}</td>
          <td>${perda}</td>
          <td>R$ ${valorTotalVenda.toFixed(2)}</td>
          <td>R$ ${custoTotalPerda.toFixed(2)}</td>
        </tr>
      `;
      tbody.innerHTML += linha;
    });
  }

  atualizarCamposTotais();
}

function atualizarCamposTotais() {
  document.getElementById("custoLogistica").value = `R$ ${totalLogistica.toFixed(2)}`;
  document.getElementById("custoEquipe").value = `R$ ${totalEquipe.toFixed(2)}`;
  document.getElementById("valorVenda").value = `R$ ${totalVenda.toFixed(2)}`;
  document.getElementById("valorPerda").value = `R$ ${totalPerda.toFixed(2)}`;
}

function salvarAnalise() {
  const vendaPDV = document.getElementById("vendaPDV").value || "";
  const dadosAnalise = {
    vendaPDV,
    valorVenda: totalVenda,
    valorPerda: totalPerda,
    custoLogistica: totalLogistica,
    custoEquipe: totalEquipe
  };

  database.ref("eventos/" + eventoId + "/analise").set(dadosAnalise)
    .then(() => {
      alert("Análise salva com sucesso!");
    })
    .catch(error => {
      console.error("Erro ao salvar análise:", error);
      alert("Erro ao salvar análise.");
    });
}

carregarProdutos().then(carregarEvento);
