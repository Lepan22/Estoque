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

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const dataInicio = new Date(document.getElementById("data-inicio").value);
  const dataFim = new Date(document.getElementById("data-fim").value);
  dataFim.setHours(23, 59, 59);

  const eventosSnap = await get(ref(db, "eventos"));
  if (!eventosSnap.exists()) {
    container.innerHTML = "<p>Nenhum evento encontrado.</p>";
    return;
  }

  const eventos = eventosSnap.val();
  const eventosFiltrados = Object.entries(eventos)
    .map(([id, ev]) => ({ id, ...ev }))
    .filter(ev => {
      const dataEv = new Date(ev.data);
      return dataEv >= dataInicio && dataEv <= dataFim;
    });

  if (eventosFiltrados.length === 0) {
    container.innerHTML = "<p>Nenhum evento no período selecionado.</p>";
    return;
  }

  const produtoEventoMap = {};

  eventosFiltrados.forEach(ev => {
    (ev.itens || []).forEach(item => {
      const nome = item.nomeItem || item.nome || "Sem nome";
      const qtd = parseFloat(item.quantidade || 0);
      if (!produtoEventoMap[nome]) produtoEventoMap[nome] = {};
      produtoEventoMap[nome][ev.nome] = (produtoEventoMap[nome][ev.nome] || 0) + qtd;
    });
  });

  const eventosNomes = eventosFiltrados.map(e => e.nome);
  const tabela = document.createElement("table");
  tabela.border = "1";
  tabela.innerHTML = `
    <thead>
      <tr>
        <th>Produto</th>
        ${eventosNomes.map(nome => `<th>${nome}</th>`).join("")}
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(produtoEventoMap).map(([produto, eventoQtds]) => {
        const total = eventosNomes.reduce((soma, evNome) => soma + (eventoQtds[evNome] || 0), 0);
        return `
          <tr>
            <td>${produto}</td>
            ${eventosNomes.map(ev => `<td>${eventoQtds[ev] || ""}</td>`).join("")}
            <td><strong>${total}</strong></td>
          </tr>
        `;
      }).join("")}
    </tbody>
  `;

  container.innerHTML = "";
  container.appendChild(tabela);
});
