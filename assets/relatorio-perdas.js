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
document.getElementById("data-inicio").value = inicioMes.toISOString().split("T")[0];
document.getElementById("data-fim").value = hoje.toISOString().split("T")[0];

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const dataInicio = new Date(document.getElementById("data-inicio").value);
  const dataFim = new Date(document.getElementById("data-fim").value);
  dataFim.setHours(23, 59, 59);

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

  const eventosFiltrados = Object.values(eventos).filter(ev => {
    const dataEv = new Date(ev.data);
    return ev.status === "finalizado" && dataEv >= dataInicio && dataEv <= dataFim;
  });

  if (eventosFiltrados.length === 0) {
    container.innerHTML = "<p>Nenhum evento finalizado no período selecionado.</p>";
    return;
  }

  const perdas = {};

  eventosFiltrados.forEach(ev => {
    (ev.itens || []).forEach(item => {
      const nome = item.nomeItem || item.nome || "Sem nome";
      const qtd = parseFloat(item.perdido || item.perda || 0);
      if (qtd > 0) {
        if (!perdas[nome]) perdas[nome] = { perda: 0, custo: 0 };
        perdas[nome].perda += qtd;

        const produto = Object.values(produtos).find(p => p.nome === nome);
        if (produto && produto.custo) {
          perdas[nome].custo = parseFloat(produto.custo);
        }
      }
    });
  });

  if (Object.keys(perdas).length === 0) {
    container.innerHTML = "<p>Não foram encontradas perdas nos eventos finalizados.</p>";
    return;
  }

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
      ${Object.entries(perdas).map(([produto, dados]) => {
        const total = (dados.perda * dados.custo).toFixed(2);
        return `
          <tr>
            <td>${produto}</td>
            <td>${dados.perda}</td>
            <td>R$ ${dados.custo.toFixed(2)}</td>
            <td><strong>R$ ${total}</strong></td>
          </tr>
        `;
      }).join("")}
    </tbody>
  `;

  container.innerHTML = "";
  container.appendChild(tabela);
  exportBtn.style.display = "inline-block";

  exportBtn.onclick = () => {
    const data = Object.entries(perdas).map(([produto, dados]) => ({
      Produto: produto,
      "Quantidade Perdida": dados.perda,
      "Custo Unitário": dados.custo,
      "Custo Total": (dados.perda * dados.custo).toFixed(2)
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório de Perdas");
    XLSX.writeFile(wb, "relatorio_perdas.xlsx");
  };
});
