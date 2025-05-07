import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js";

const firebaseConfig = {
  // sua configuração está no firebase-init.js, que já está incluída no HTML
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

function formatarValor(valor) {
  return `R$ ${parseFloat(valor || 0).toFixed(2).replace('.', ',')}`;
}

async function carregarDados() {
  const snapshot = await get(ref(db, `eventos/${id}`));
  const evento = snapshot.val();

  if (!evento) return;

  document.getElementById("nomeEvento").value = evento.nome || "";
  document.getElementById("dataEvento").value = evento.data || "";
  document.getElementById("responsavelEvento").value = evento.responsavel || "";

  document.getElementById("vendaPDV").value = evento.analise?.vendaPDV || "";

  document.getElementById("custoLogistica").value = formatarValor(
    (evento.itens || [])
      .filter(item => item.categoria?.toLowerCase() === "logistica")
      .reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0)
  );

  document.getElementById("custoEquipe").value = formatarValor(
    (evento.itens || [])
      .filter(item => item.categoria?.toLowerCase() === "equipe")
      .reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0)
  );

  document.getElementById("valorVenda").value = formatarValor(evento.totalVendasEvento || 0);
  document.getElementById("valorPerda").value = formatarValor(evento.totalPerdaEvento || 0);

  const produtosSnap = await get(ref(db, "produtos"));
  const todosProdutos = produtosSnap.val() || {};

  const corpoTabela = document.querySelector("#tabelaProdutos tbody");
  corpoTabela.innerHTML = "";

  const listaProdutos = evento.produtos || {};

  Object.entries(listaProdutos).forEach(([nomeProduto, dados]) => {
    const produtoBase = Object.values(todosProdutos).find(
      p => (p.nome || "").trim().toLowerCase() === nomeProduto.trim().toLowerCase()
    );

    const enviado = parseFloat(dados.enviado || 0);
    const congelado = parseFloat(dados.congelado || 0);
    const assado = parseFloat(dados.assado || 0);
    const perda = parseFloat(dados.perda || 0);

    const valorVenda = parseFloat(produtoBase?.valorVenda || 0);
    const custoProduto = parseFloat(produtoBase?.custo || 0);

    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${nomeProduto}</td>
      <td>${enviado}</td>
      <td>${congelado}</td>
      <td>${assado}</td>
      <td>${perda}</td>
      <td>${formatarValor(valorVenda)}</td>
      <td>${formatarValor(perda * custoProduto)}</td>
    `;
    corpoTabela.appendChild(linha);
  });
}

document.getElementById("btnSalvar").addEventListener("click", async () => {
  const vendaPDV = parseFloat(document.getElementById("vendaPDV").value || 0);

  await update(ref(db, `eventos/${id}/analise`), {
    vendaPDV: vendaPDV
  });

  alert("Venda PDV salva com sucesso!");
});

carregarDados();
