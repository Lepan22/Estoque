
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const db = firebase.database();

function normalizar(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
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

function criarLinhaProduto(item = {}) {
  const tabela = document.querySelector("#tabelaProdutos tbody");
  const linha = document.createElement("tr");

  linha.innerHTML = \`
    <td><input type="text" class="nome-item" value="\${item.nome || ''}"/></td>
    <td><input type="number" class="enviado" value="\${item.quantidade || 0}"/></td>
    <td><input type="number" class="congelado" value="\${item.congelado || 0}"/></td>
    <td><input type="number" class="assado" value="\${item.assado || 0}"/></td>
    <td><input type="number" class="perdido" value="\${item.perdido || 0}"/></td>
    <td class="valor-venda">R$ 0,00</td>
    <td class="custo-perda">R$ 0,00</td>
    <td class="vendido">0</td>
    <td class="cmv">R$ 0,00</td>
    <td class="estimativa">R$ 0,00</td>
    <td>
      <button type="button" class="mover-cima">▲</button>
      <button type="button" class="mover-baixo">▼</button>
      <button type="button" class="remover">❌</button>
    </td>
  \`;

  linha.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", recalcularTabela);
  });

  linha.querySelector(".remover").addEventListener("click", () => {
    linha.remove();
    recalcularTabela();
  });

  linha.querySelector(".mover-cima").addEventListener("click", () => {
    if (linha.previousElementSibling) {
      linha.parentNode.insertBefore(linha, linha.previousElementSibling);
    }
  });

  linha.querySelector(".mover-baixo").addEventListener("click", () => {
    if (linha.nextElementSibling) {
      linha.parentNode.insertBefore(linha.nextElementSibling, linha);
    }
  });

  tabela.appendChild(linha);
}

function recalcularTabela() {
  const linhas = document.querySelectorAll("#tabelaProdutos tbody tr");
  let totalVenda = 0, totalPerda = 0, totalCMV = 0, totalEstimativa = 0;

  linhas.forEach(linha => {
    const nome = linha.querySelector(".nome-item").value;
    const enviado = parseInt(linha.querySelector(".enviado").value || 0);
    const congelado = parseInt(linha.querySelector(".congelado").value || 0);
    const assado = parseInt(linha.querySelector(".assado").value || 0);
    const perdido = parseInt(linha.querySelector(".perdido").value || 0);
    const vendidos = enviado - (congelado + assado + perdido);

    const produto = window.produtosCache.find(p => normalizar(p.nome) === normalizar(nome));
    const valorVenda = parseFloat(produto?.valorVenda || 0);
    const custo = parseFloat(produto?.custo || 0);

    const estimativa = enviado * valorVenda;
    const valorVendido = vendidos * valorVenda;
    const custoPerda = perdido * custo;
    const cmv = vendidos * custo;

    totalVenda += valorVendido;
    totalPerda += custoPerda;
    totalCMV += cmv;
    totalEstimativa += estimativa;

    linha.querySelector(".valor-venda").textContent = formatar(valorVendido);
    linha.querySelector(".custo-perda").textContent = formatar(custoPerda);
    linha.querySelector(".vendido").textContent = vendidos;
    linha.querySelector(".cmv").textContent = formatar(cmv);
    linha.querySelector(".estimativa").textContent = formatar(estimativa);
  });

  document.getElementById("valorVenda").value = formatar(totalVenda);
  document.getElementById("valorPerda").value = formatar(totalPerda);
  document.getElementById("estimativaTotal").value = formatar(totalEstimativa);
  window.totalCMVCalculado = totalCMV;
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
  window.produtosCache = Object.values(produtos);
  const itens = evento.itens || [];
  const analise = evento.analise || {};

  document.getElementById("nomeEvento").value = evento.nome || "";
  document.getElementById("dataEvento").value = evento.data || "";
  document.getElementById("responsavelEvento").value = evento.responsavel || "";
  document.getElementById("vendaPDV").value = analise.vendaPDV || "";

  const tabela = document.querySelector("#tabelaProdutos tbody");
  tabela.innerHTML = "";
  itens.forEach(item => criarLinhaProduto(item));
  recalcularTabela();

  (analise.equipe || []).forEach(eq => criarLinha("equipe-container", "equipe", eq));
  (analise.logistica || []).forEach(lg => criarLinha("logistica-container", "logistica", lg));
  atualizarTotaisEquipeLogistica();
}

function criarLinha(containerId, tipo, dados = {}) {
  const div = document.createElement("div");
  div.className = tipo + "-linha d-flex gap-2 mb-2";

  const input1 = document.createElement("input");
  input1.className = "form-control";
  input1.name = tipo + "-nome";
  input1.placeholder = tipo === "equipe" ? "Nome do Membro" : "Descritivo";
  input1.value = dados.nome || "";

  const input2 = document.createElement("input");
  input2.className = "form-control";
  input2.name = tipo + "-valor";
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
    const estimativaTotal = parseFloatSafe(document.getElementById("estimativaTotal").value.replace(/[^\d,.-]/g, ""));

    const equipe = Array.from(document.querySelectorAll(".equipe-linha")).map(div => ({
      nome: div.querySelector('[name="equipe-nome"]').value,
      valor: parseFloatSafe(div.querySelector('[name="equipe-valor"]').value)
    }));

    const logistica = Array.from(document.querySelectorAll(".logistica-linha")).map(div => ({
      nome: div.querySelector('[name="logistica-nome"]').value,
      valor: parseFloatSafe(div.querySelector('[name="logistica-valor"]').value)
    }));

    const itens = Array.from(document.querySelectorAll("#tabelaProdutos tbody tr")).map(tr => ({
      nome: tr.querySelector(".nome-item").value,
      quantidade: parseInt(tr.querySelector(".enviado").value || 0),
      congelado: parseInt(tr.querySelector(".congelado").value || 0),
      assado: parseInt(tr.querySelector(".assado").value || 0),
      perdido: parseInt(tr.querySelector(".perdido").value || 0)
    }));

    const custoEquipe = equipe.reduce((s, e) => s + e.valor, 0);
    const custoLogistica = logistica.reduce((s, l) => s + l.valor, 0);

    await db.ref(`eventos/${id}`).update({ itens });

    await db.ref(`eventos/${id}/analise`).update({
      vendaPDV,
      valorVenda,
      valorPerda,
      estimativaTotal,
      equipe,
      logistica,
      custoEquipe,
      custoLogistica,
      cmvTotal: window.totalCMVCalculado || 0
    });

    alert("Dados salvos com sucesso!");
  });

  // botão adicionar produto
  const addBtn = document.createElement("button");
  addBtn.textContent = "➕ Adicionar Produto";
  addBtn.className = "botao";
  addBtn.style.marginTop = "10px";
  addBtn.onclick = () => criarLinhaProduto();
  document.querySelector(".button-container").prepend(addBtn);
});
