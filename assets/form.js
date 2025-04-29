import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBN-bmzgrlzjmrKMmuClZ8LVll-vJyx-aE",
  authDomain: "controleestoquelepan.firebaseapp.com",
  databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com",
  projectId: "controleestoquelepan",
  storageBucket: "controleestoquelepan.appspot.com",
  messagingSenderId: "779860276544",
  appId: "1:779860276544:web:f45844571a8c0bab1576a5",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const id = new URLSearchParams(window.location.search).get("id");

if (!id) {
  alert("Evento não encontrado.");
  window.location.href = "index.html";
}

const refEvento = ref(db, `eventos/${id}`);

async function carregarEvento() {
  try {
    const snapshot = await get(refEvento);
    if (!snapshot.exists()) {
      alert("Evento não existe.");
      return;
    }

    const evento = snapshot.val();

    document.getElementById("eventoInfo").innerHTML = `
      <p><strong>Nome:</strong> ${evento.nome}</p>
      <p><strong>Data:</strong> ${evento.data}</p>
      <p><strong>Responsável:</strong> ${evento.responsavel}</p>
      <p><strong>Status:</strong> ${evento.status}</p>
      <h3>Itens:</h3>
    `;

    const container = document.getElementById("itens");
    container.innerHTML = "";

    const itens = Array.isArray(evento.itens)
      ? evento.itens
      : Object.values(evento.itens);

    if (itens.length === 0) {
      container.innerHTML = "<p>Nenhum item registrado.</p>";
      return;
    }

    itens.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <p><strong>${item.nomeItem}</strong></p>
        <p>Quantidade enviada: ${item.quantidadeEnviada}</p>
        <label>Assado: <input type="number" min="0" value="${item.assado || 0}" data-index="${index}" data-field="assado"></label><br>
        <label>Congelado: <input type="number" min="0" value="${item.congelado || 0}" data-index="${index}" data-field="congelado"></label><br>
        <label>Perdido: <input type="number" min="0" value="${item.perdido || 0}" data-index="${index}" data-field="perdido"></label><hr>
      `;
      container.appendChild(div);
    });

    const salvarBtn = document.createElement("button");
    salvarBtn.textContent = "Salvar Evento";
    salvarBtn.style.marginTop = "20px";
    salvarBtn.onclick = () => salvarRetorno(itens);
    container.appendChild(salvarBtn);

  } catch (error) {
    console.error("Erro ao carregar evento:", error);
    alert("Erro ao carregar dados do evento.");
  }
}

function salvarRetorno(itens) {
  const inputs = document.querySelectorAll("input[type=number]");

  inputs.forEach(input => {
    const index = input.dataset.index;
    const field = input.dataset.field;
    const value = parseInt(input.value) || 0;
    itens[index][field] = value;
  });

  update(refEvento, {
    itens: itens,
    status: "finalizado"
  }).then(() => {
    alert("Evento finalizado com sucesso!");
    window.location.href = "resumo.html?id=" + id;
  }).catch(err => {
    console.error("Erro ao salvar:", err);
    alert("Erro ao salvar o evento.");
  });
}

carregarEvento();
