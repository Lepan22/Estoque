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
  return "R$ " + parseFloat(valor || 0).toFixed(2).replace('.', ',');
}

function parseFloatSafe(v) {
  return parseFloat(String(v).replace(",", ".")) || 0;
}

function atualizarTotaisEquipeLogistica() {
  let totalEquipe = 0;
  document.querySelectorAll(".equipe-linha").forEach(div => {
    const valor = parseFloatSafe(div.querySelector('[name="equipe-valor"]').value);
    totalEquipe += valor;
  });
  document.getElementById("custoEquipe").textContent = formatar(totalEquipe);

  let totalLogistica = 0;
  document.querySelectorAll(".logistica-linha").forEach(div => {
    const valor = parseFloatSafe(div.querySelector('[name="logistica-valor"]').value);
    totalLogistica += valor;
  });
  document.getElementById("custoLogistica").textContent = formatar(totalLogistica);
}

function criarLinha(containerId, tipo, dados = {}) {
  const div = document.createElement("div");
  div.className = `${tipo}-linha d-flex gap-2 mb-2`;

  const input1 = document.createElement("input");
  input1.className = "form-control";
  input1.name = `${tipo}-nome`;
  input1.placeholder = tipo === "equipe" ? "Nome do Membro" : "Descritivo";
  input1.value = dados.nome || "";

  const input2 = document.createElement("input");
  input2.className = "form-control";
  input2.name = `${tipo}-valor`;
  input2.placeholder = tipo === "equipe" ? "Valor por dia" : "Valor";
  input2.value = dados.valor || "";
  input2.addEventListener("input", atualizarTotaisEquipeLogistica);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-danger btn-sm";
  btn.textContent = "❌";
  btn.onclick = () => {
    div.remove();
    atualizarTotaisEquipeLogistica();
  };

  div.append(input1, input2, btn);
  document.getElementById(containerId).appendChild(div);
}

async function carregarDados() {
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
  const analise = evento.analise || {};

  document.getElementById("nomeEvento").value = evento.nome || "";
  document.getElementById("dataEvento").value = evento.data || "";
  document.getElementById("responsavelEvento").value = evento.responsavel || "";
  document.getElementById("vendaPDV").value = analise.vendaPDV || "";

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
    
    const cmv = vendidos * custoUnit;
    linha.innerHTML += `<td>${vendidos}</td><td>${formatar(cmv)}</td>`;

    tabela.appendChild(linha);
  });

  document.getElementById("valorVenda").value = formatar(totalVenda);
  document.getElementById("valorPerda").value = formatar(totalPerda);

  (analise.equipe || []).forEach(eq => criarLinha("equipe-container", "equipe", eq));
  (analise.logistica || []).forEach(lg => criarLinha("logistica-container", "logistica", lg));
  atualizarTotaisEquipeLogistica();
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDados();

  document.getElementById("addEquipeBtn").addEventListener("click", () => {
    criarLinha("equipe-container", "equipe");
  });

  document.getElementById("addLogisticaBtn").addEventListener("click", () => {
    criarLinha("logistica-container", "logistica");
  });

  document.getElementById("btnSalvar").addEventListener("click", async () => {
    const vendaPDV = parseFloat(document.getElementById("vendaPDV").value || 0);
    const valorVenda = parseFloatSafe(document.getElementById("valorVenda").value.replace(/[^\d,.-]/g, ""));
    const valorPerda = parseFloatSafe(document.getElementById("valorPerda").value.replace(/[^\d,.-]/g, ""));

    const equipe = Array.from(document.querySelectorAll(".equipe-linha")).map(div => ({
      nome: div.querySelector('[name="equipe-nome"]').value,
      valor: parseFloatSafe(div.querySelector('[name="equipe-valor"]').value)
    }));

    const logistica = Array.from(document.querySelectorAll(".logistica-linha")).map(div => ({
      nome: div.querySelector('[name="logistica-nome"]').value,
      valor: parseFloatSafe(div.querySelector('[name="logistica-valor"]').value)
    }));

    const custoEquipe = equipe.reduce((s, e) => s + e.valor, 0);
    const custoLogistica = logistica.reduce((s, l) => s + l.valor, 0);

    await db.ref(`eventos/${id}/analise`).update({
      vendaPDV,
      valorVenda,
      valorPerda,
      equipe,
      logistica,
      custoEquipe,
      custoLogistica
    });

    alert("Dados salvos com sucesso!");
  });
});
