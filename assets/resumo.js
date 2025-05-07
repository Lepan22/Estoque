const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const db = firebase.database();

function normalizar(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, " ") // remove múltiplos espaços
    .trim();
}

function formatar(valor) {
  return `R$ ${parseFloat(valor || 0).toFixed(2).replace('.', ',')}`;
}

async function carregarDados() {
  try {
    const eventoSnap = await db.ref(`eventos/${id}`).get();
    const produtosSnap = await db.ref(`produtos`).get();

    const evento = eventoSnap.val();
    const produtos = produtosSnap.val();

    if (!evento) {
      alert("Evento não encontrado.");
      return;
    }

    document.getElementById("nomeEvento").value = evento.nome || "";
    document.getElementById("dataEvento").value = evento.data || "";
    document.getElementById("responsavelEvento").value = evento.responsavel || "";
    document.getElementById("vendaPDV").value = evento.analise?.vendaPDV || "";

    // Calcular custo logistica e equipe
    let custoLog = 0;
    let custoEquipe = 0;

    const itens = evento.itens || [];
    for (const item of itens) {
      const cat = normalizar(item.categoria);
      const valor = parseFloat(item.valor || 0);
      if (cat === "logistica") custoLog += valor;
      if (cat === "equipe") custoEquipe += valor;
    }

    document.getElementById("custoLogistica").value = formatar(custoLog);
    document.getElementById("custoEquipe").value = formatar(custoEquipe);

    // Calcular produtos
    let totalVenda = 0;
    let totalPerda = 0;
    const produtosEvento = evento.produtos || {};
    const tabela = document.querySelector("#tabelaProdutos tbody");
    tabela.innerHTML = "";

    for (const [nome, dados] of Object.entries(produtosEvento)) {
      const nomeNorm = normalizar(nome);
      const produto = Object.values(produtos).find(p => normalizar(p.nome) === nomeNorm);

      const enviada = parseFloat(dados.enviado || 0);
      const congelado = parseFloat(dados.congelado || 0);
      const assado = parseFloat(dados.assado || 0);
      const perda = parseFloat(dados.perda || 0);

      const valorVenda = parseFloat(produto?.valorVenda || 0);
      const custoUnitario = parseFloat(produto?.custo || 0);

      const vendidos = enviada - (congelado + assado + perda);
      const valorTotalVenda = vendidos * valorVenda;
      const custoPerda = perda * custoUnitario;

      totalVenda += valorTotalVenda;
      totalPerda += custoPerda;

      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${nome}</td>
        <td>${enviada}</td>
        <td>${congelado}</td>
        <td>${assado}</td>
        <td>${perda}</td>
        <td>${formatar(valorTotalVenda)}</td>
        <td>${formatar(custoPerda)}</td>
      `;
      tabela.appendChild(linha);
    }

    document.getElementById("valorVenda").value = formatar(totalVenda);
    document.getElementById("valorPerda").value = formatar(totalPerda);

    // Salvar os totais calculados no Firebase
    await db.ref(`eventos/${id}/analise`).update({
      custoLogistica: custoLog,
      custoEquipe: custoEquipe,
      valorVenda: totalVenda,
      valorPerda: totalPerda
    });

  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    alert("Erro ao carregar dados do evento.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDados();

  document.getElementById("btnSalvar").addEventListener("click", async () => {
    const vendaPDV = parseFloat(document.getElementById("vendaPDV").value || 0);
    await db.ref(`eventos/${id}/analise`).update({ vendaPDV });
    alert("Venda PDV salva com sucesso!");
  });
});
