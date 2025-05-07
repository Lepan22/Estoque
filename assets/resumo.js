const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

const db = firebase.database();

function formatarValor(valor) {
  return `R$ ${parseFloat(valor || 0).toFixed(2).replace('.', ',')}`;
}

function normalizarTexto(texto) {
  return (texto || "").trim().toLowerCase();
}

async function carregarDados() {
  const snapshotEvento = await db.ref(`eventos/${id}`).get();
  const evento = snapshotEvento.val();

  if (!evento) return;

  document.getElementById("nomeEvento").value = evento.nome || "";
  document.getElementById("dataEvento").value = evento.data || "";
  document.getElementById("responsavelEvento").value = evento.responsavel || "";
  document.getElementById("vendaPDV").value = evento.analise?.vendaPDV || "";

  // Custos
  const itens = evento.itens || [];
  const custoLog = itens.filter(i => normalizarTexto(i.categoria) === "logistica")
                        .reduce((soma, i) => soma + parseFloat(i.valor || 0), 0);
  const custoEqp = itens.filter(i => normalizarTexto(i.categoria) === "equipe")
                        .reduce((soma, i) => soma + parseFloat(i.valor || 0), 0);

  document.getElementById("custoLogistica").value = formatarValor(custoLog);
  document.getElementById("custoEquipe").value = formatarValor(custoEqp);

  // Totais do evento
  document.getElementById("valorVenda").value = formatarValor(evento.totalVendasEvento || 0);
  document.getElementById("valorPerda").value = formatarValor(evento.totalPerdaEvento || 0);

  // Produtos
  const snapshotProdutos = await db.ref("produtos").get();
  const produtosRef = snapshotProdutos.val() || {};

  const tabela = document.querySelector("#tabelaProdutos tbody");
  tabela.innerHTML = "";

  const produtosEvento = evento.produtos || {};

  for (const [nomeProduto, dados] of Object.entries(produtosEvento)) {
    const nomeNormalizado = normalizarTexto(nomeProduto);

    const produto = Object.values(produtosRef).find(
      p => normalizarTexto(p.nome) === nomeNormalizado
    );

    const enviado = parseFloat(dados.enviado || 0);
    const congelado = parseFloat(dados.congelado || 0);
    const assado = parseFloat(dados.assado || 0);
    const perda = parseFloat(dados.perda || 0);

    const valorVenda = parseFloat(produto?.valorVenda || 0);
    const custoUnitario = parseFloat(produto?.custo || 0);
    const custoPerda = perda * custoUnitario;

    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${nomeProduto}</td>
      <td>${enviado}</td>
      <td>${congelado}</td>
      <td>${assado}</td>
      <td>${perda}</td>
      <td>${formatarValor(valorVenda)}</td>
      <td>${formatarValor(custoPerda)}</td>
    `;
    tabela.appendChild(linha);
  }
}

document.getElementById("btnSalvar").addEventListener("click", async () => {
  const vendaPDV = parseFloat(document.getElementById("vendaPDV").value || 0);
  await db.ref(`eventos/${id}/analise`).update({ vendaPDV });
  alert("Venda PDV salva com sucesso!");
});

carregarDados();
