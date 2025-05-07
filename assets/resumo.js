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

    if (!Array.isArray(itens) || itens.length === 0) {
      alert("Este evento não possui itens cadastrados.");
      return;
    }

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

      const vendidos = enviado - (congelado + assado + perdido);
      const valorVendaUnit = parseFloat(produto?.valorVenda || 0);
      const custoUnit = parseFloat(produto?.custo || 0);

      const valorVendaTotal = vendidos * valorVendaUnit;
      const custoPerda = perdido * custoUnit;

      totalVenda += valorVendaTotal;
      totalPerda += custoPerda;

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

    document.getElementById("valorVenda").value = formatar(totalVenda);
    document.getElementById("valorPerda").value = formatar(totalPerda);

    await db.ref(`eventos/${id}/analise`).update({
      valorVenda: totalVenda,
      valorPerda: totalPerda
    });

  } catch (err) {
    console.error("Erro ao carregar dados do evento:", err);
    alert("Erro ao carregar dados.");
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
