// Firebase config
const firebaseConfig = {
  databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Obter ID do evento via URL
const urlParams = new URLSearchParams(window.location.search);
const eventoId = urlParams.get("id");

// Dados de produtos (poderia ser carregado dinamicamente também)
let produtosInfo = {};
let totalVenda = 0;
let totalPerda = 0;
let totalLogistica = 0;
let totalEquipe = 0;
let totalPDV = 0;

// Carregar produtos da base
function carregarProdutos() {
  return database.ref("produtos").once("value").then(snapshot => {
    produtosInfo = snapshot.val() || {};
  });
}

// Carregar evento
function carregarEvento() {
  if (!eventoId) return;

  database.ref("eventos/" + eventoId).once("value").then(snapshot => {
    const evento = snapshot.val();
    if (!evento) return alert("Evento não encontrado.");

    document.getElementById("nomeEvento").textContent = evento.nome || "";
    document.getElementById("dataEvento").textContent = evento.data || "";
    document.getElementById("responsavelEvento").textContent = evento.responsavel || "";

    processarResumo(evento);
  });
}

// Processar todos os resumos
function processarResumo(evento) {
  const tbody = document.querySelector("#tabelaProdutos tbody");
  tbody.innerHTML = "";

  // Custo Logística
  if (evento.logistica) {
    totalLogistica = Object.values(evento.logistica).reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
  }

  // Custo Equipe
  if (evento.equipe) {
    totalEquipe = Object.values(evento.equipe).reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
  }

  // Venda PDV
  if (evento.vendaPDV) {
    totalPDV = Object.values(evento.vendaPDV).reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
  }

  // Produtos
  if (evento.produtos) {
    Object.values(evento.produtos).forEach(prod => {
      const info = Object.values(produtosInfo).find(p => p.nome === prod.nome);
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

// Atualizar os campos de totais
function atualizarCamposTotais() {
  document.getElementById("custoLogistica").value = `R$ ${totalLogistica.toFixed(2)}`;
  document.getElementById("custoEquipe").value = `R$ ${totalEquipe.toFixed(2)}`;
  document.getElementById("vendaPDV").value = `R$ ${totalPDV.toFixed(2)}`;
  document.getElementById("valorVenda").value = `R$ ${totalVenda.toFixed(2)}`;
  document.getElementById("valorPerda").value = `R$ ${totalPerda.toFixed(2)}`;
}

// Placeholder para salvar
function salvarAnalise() {
  alert("Análise salva com sucesso (simulação).");
}

// Inicialização
carregarProdutos().then(carregarEvento);
