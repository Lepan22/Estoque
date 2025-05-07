const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const db = firebase.database();

function normalizar(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatar(valor) {
  return `R$ ${parseFloat(valor || 0).toFixed(2).replace('.', ',')}`;
}

async function carregarDados() {
  try {
    const [eventoSnap, produtosSnap] = await Promise.all([
      db.ref(`eventos/${id}`).get(),
      db.ref("produtos").get()
    ]);

    if (!eventoSnap.exists()) {
      alert("Evento não encontrado.");
      return;
    }

    const evento = eventoSnap.val();
    const produtos = produtosSnap.val() || {};
    const itens = evento.itens || [];

    document.getElementById("nomeEvento").value = evento.nome || "";
    document.getElementById("dataEvento").value = evento.data || "";
    document.getElementById("responsavelEvento").value = evento.responsavel || "";
    document.getElementById("vendaPDV").value = evento.analise?.vendaPDV || "";

    // Se não houver itens, mostrar alerta e parar
    if (!Array.isArray(itens) || itens.length === 0) {
      alert("Este evento não possui itens cadastrados. Nenhum cálculo pode ser realizado.");
      document.getElementById("custoLogistica").value = "R$ 0,00";
      document.getElementById("custoEquipe").value = "R$ 0,00";
      document.getElementById("valorVenda").value = "R$ 0,00";
      document.getElementById("valorPerda").value = "R$ 0,00";
      return;
    }

    // Cálculos
    let custoLogistica = 0;
    let custoEquipe = 0;
    let totalVenda = 0;
    let totalPerda = 0;

    const tabela = document.querySelector("#tabelaProdutos tbody");
    tabela.innerHTML = "";

    itens.forEach(item => {
      const nomeItem = item.nomeItem || item.nome || "";
      const nomeNorm = normalizar(nomeItem);
      const produto = Object.values(produtos).find(p => normalizar(p.nome) === nomeNorm);

      const enviado = parseInt(item.quantidade || item.qtd || 0);
      const assado = parseInt(item.assado || 0);
      const congelado = parseInt(item.congelado || 0);
      const perdido = parseInt(item.perdido || 0);

      const valorVendaUnit = parseFloat(produto?.valorVenda || 0);
      const custoUnit = parseFloat(produto?.custo || 0);

      const vendidos = enviado - (assado + congelado + perdido);
      const valorVendaTotal = vendidos * valorVendaUnit;
      const custoPerda = perdido * custoUnit;

      totalVenda += valorVendaTotal;
      totalPerda += custoPerda;

      custoLogistica += parseFloat(item.logistica || 0);
      custoEquipe += parseFloat(item.equipe || 0);

      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${nomeItem}</td>
        <td>${enviado}</td>
        <td>${congelado}</td>
        <td>${assado}</td>
        <td>${perdido}</td>
        <td>${formatar(valorVendaTotal)}</td>
        <td>${formatar(custoPerda)}</td>
      `;
      tabela.appendChild(linha);
    });

    // Preencher campos
    document.getElementById("custoLogistica").value = formatar(custoLogistica);
    document.getElementById("custoEquipe").value = formatar(custoEquipe);
    document.getElementById("valorVenda").value = formatar(totalVenda);
    document.getElementById("valorPerda").value = formatar(totalPerda);

    // Salvar os totais na análise
    await db.ref(`eventos/${id}/analise`).update({
      custoLogistica,
      custoEquipe,
      valorVenda: totalVenda,
      valorPerda: totalPerda
    });

  } catch (err) {
    console.error("Erro ao carregar dados do evento:", err);
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
