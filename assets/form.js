import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Configuração do Firebase
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

// Obter ID da URL
const urlParams = new URLSearchParams(window.location.search);
const eventoId = urlParams.get('id');
const eventoRef = ref(db, 'eventos/' + eventoId);

const eventoInfoDiv = document.getElementById('eventoInfo');
const itensDiv = document.getElementById('itens');

async function carregarEvento() {
  try {
    const snapshot = await get(eventoRef);
    if (!snapshot.exists()) {
      eventoInfoDiv.innerHTML = "<p>Evento não encontrado.</p>";
      return;
    }

    const evento = snapshot.val();
    eventoInfoDiv.innerHTML = `
      <p><strong>Nome:</strong> ${evento.nome}</p>
      <p><strong>Data:</strong> ${evento.data}</p>
      <p><strong>Responsável:</strong> ${evento.responsavel}</p>
      <h3>Itens:</h3>
    `;

    const itens = Array.isArray(evento.itens)
      ? evento.itens
      : Object.values(evento.itens || {});

    if (!itens.length) {
      itensDiv.innerHTML = "<p>Nenhum item registrado.</p>";
      return;
    }

    itensDiv.innerHTML = `<form id="retornoForm"></form>`;
    const form = document.getElementById("retornoForm");

    itens.forEach((item, index) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "item";
      itemDiv.innerHTML = `
        <p><strong>${item.nomeItem}</strong> (Enviado: ${item.quantidadeEnviada})</p>
        <label>Congelado: <input type="number" name="congelado_${index}" min="0" value="${item.congelado || 0}" /></label><br/>
        <label>Assado: <input type="number" name="assado_${index}" min="0" value="${item.assado || 0}" /></label><br/>
        <label>Perdido: <input type="number" name="perdido_${index}" min="0" value="${item.perdido || 0}" /></label>
        <hr/>
      `;
      form.appendChild(itemDiv);
    });

    const salvarBtn = document.createElement("button");
    salvarBtn.textContent = "💾 Salvar Evento";
    salvarBtn.style.padding = "10px 20px";
    salvarBtn.style.marginTop = "20px";
    salvarBtn.style.backgroundColor = "#28a745";
    salvarBtn.style.color = "#fff";
    salvarBtn.style.border = "none";
    salvarBtn.style.borderRadius = "5px";
    salvarBtn.style.cursor = "pointer";

    salvarBtn.onclick = async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const novosItens = itens.map((item, index) => ({
        ...item,
        congelado: parseInt(formData.get(`congelado_${index}`)) || 0,
        assado: parseInt(formData.get(`assado_${index}`)) || 0,
        perdido: parseInt(formData.get(`perdido_${index}`)) || 0
      }));

      await set(eventoRef, {
        ...evento,
        itens: novosItens,
        status: "finalizado"
      });

      alert("Evento salvo com sucesso!");
    };

    form.appendChild(salvarBtn);
  } catch (error) {
    console.error("Erro ao carregar evento:", error);
    itensDiv.innerHTML = "<p>Erro ao carregar os itens.</p>";
  }
}

carregarEvento();

