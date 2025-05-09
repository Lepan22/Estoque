import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase, ref, get
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBN-bmzgrlzjmrKMmuClZ8LVll-vJyx-aE",
  authDomain: "controleestoquelepan.firebaseapp.com",
  databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com",
  projectId: "controleestoquelepan",
  storageBucket: "controleestoquelepan.appspot.com",
  messagingSenderId: "779860276544",
  appId: "1:779860276544:web:f45844571a8c0bab1576a5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const form = document.getElementById("filtro-form");
const container = document.getElementById("relatorio-container");
const exportBtn = document.getElementById("exportarXLS");

const hoje = new Date();
const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

document.getElementById("data-inicio").value = inicioMes.toISOString().split("T")[0];
document.getElementById("data-fim").value = fimMes.toISOString().split("T")[0];

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dataInicio = new Date(document.getElementById("data-inicio").value);
  const dataFim = new Date(document.getElementById("data-fim").value);
  dataFim.setHours(23, 59, 59);

  container.innerHTML = "Carregando...";

  const [eventosSnap, produtosSnap] = await Promise.all([
    get(ref(db, "eventos")),
    get(ref(db, "produtos"))
  ]);

  if (!eventosSnap.exists()) {
    container.innerHTML = "<p>Nenhum evento encontrado.</p>";
    return;
  }

  const eventos = eventosSnap.val();
  const produtos = produtosSnap.exists() ? produtosSnap.val() : {};

  const perdas = {};

  Object.values(eventos).forEach(ev => {
    const dataEv = new Date(ev.data);
    if (ev.status !== "finalizado" || dataEv < dataInicio || dataEv > dataFim) return;

    (ev.itens || []).forEach(item => {
      const nomeItem = item.nomeItem || item.nome;
      const qtdPerdida = parseFloat(item.perdido);
      if (!nomeItem || isNaN(qtdPerdida) || qtdPerdida <= 0) return;

      const chave = nomeItem.trim().toLowerCase();

      if (!perdas[chave]) {
        perdas[chave] = {
          nomeOriginal: nomeItem.trim(),
          perda: 0,
          custo: 0
        };
      }

      perdas[chave].perda += qtdPerdida;

      const produto = Object.values(produtos).find(p =>
        (p.nome || "").trim().toLowerCase() === chave
      );

      if (produto && produto.custo) {
        perdas[chave].custo = parseFloat(produto.custo);
      }
    });
  });

  if (Object.keys(perdas).length === 0) {
    container.innerHTML = "<p>Não foram encontradas perdas nos eventos finalizados.</p>";
    return;
  }

  const totalGeral = Object.values(perdas).reduce((soma, dados) => {
    return soma + (dados.custo ? dados.perda * dados.custo : 0);
  }, 0);

  const tabela = document.createElement("table");
  tabela.border = "1";
  tabela.innerHTML = `
    <thead>
      <tr>
        <th>Produto</th>
        <th>Quantidade Perdida</th>
        <th>Custo Unitário</th>
        <th>Custo Total</th>
      </tr>
    </thead>
    <tbody>
      ${Object.values(perdas).map(dados => {
        const total = (dados.perda * dados.custo).toFixed(2);
        const custoFormatado = dados.custo ? `R$ ${dados.custo.toFixed(2)}` : `<span style="color:red">–</span>`;
        const totalFormatado = dados.custo ? `<strong>R$ ${total}</strong>` : `<span style="color:red">Sem custo</span>`;
        return `
          <tr>
            <td>${dados.nomeOriginal}</td>
            <td>${dados.perda}</td>
            <td>${custoFormatado}</td>
            <td>${totalFormatado}</td>
          </tr>
        `;
      }).join("")}
      <tr style="font-weight: bold; background: #f0f0f0;">
        <td colspan="3" style="text-align: right;">Total Geral:</td>
        <td>R$ ${totalGeral.toFixed(2)}</td>
      </tr>
    </tbody>
  `;

  container.innerHTML = "";
  container.appendChild(tabela);
  exportBtn.style.display = "inline-block";

  exportBtn.onclick = () => {
    const data = Object.values(perdas).map(dados => ({
      Produto: dados.nomeOriginal,
      "Quantidade Perdida": dados.perda,
      "Custo Unitário": dados.custo || "–",
      "Custo Total": dados.custo ? (dados.perda * dados.custo).toFixed(2) : "Sem custo"
    }));

    data.push({
      Produto: "TOTAL",
      "Quantidade Perdida": "",
      "Custo Unitário": "",
      "Custo Total": totalGeral.toFixed(2)
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório de Perdas");
    XLSX.writeFile(wb, "relatorio_perdas.xlsx");
  };
});
