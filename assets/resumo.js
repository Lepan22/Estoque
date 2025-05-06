import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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

get(refEvento).then(snapshot => {
  if (!snapshot.exists()) {
    alert("Evento não encontrado.");
    return;
  }

  const evento = snapshot.val();

  document.getElementById("eventoResumo").innerHTML = `
    <h2>Resumo do Evento</h2>
    <p><strong>Nome:</strong> ${evento.nome}</p>
    <p><strong>Data:</strong> ${evento.data}</p>
    <p><strong>Responsável:</strong> ${evento.responsavel}</p>
    <p><strong>Status:</strong> ${evento.status || "pendente"}</p>
    <h3>Itens:</h3>
  `;

  const container = document.getElementById("resumoItens");

  if (Array.isArray(evento.itens) && evento.itens.length > 0) {
    evento.itens.forEach(item => {
      const div = document.createElement("div");
      div.className = "item-resumo";
      div.innerHTML = `
        <p><strong>Nome:</strong> ${item.nomeItem || "N/A"}</p>
        <p><strong>Quantidade Enviada:</strong> ${item.quantidadeEnviada || 0}</p>
        <p><strong>Assado:</strong> ${item.assado || 0}</p>
        <p><strong>Congelado:</strong> ${item.congelado || 0}</p>
        <p><strong>Perdido:</strong> ${item.perdido || 0}</p>
        <hr>
      `;
      container.appendChild(div);
    });
  } else {
    container.innerHTML = "<p>Nenhum item registrado.</p>";
  }

  // Exibir os valores de Logística e Equipe
  const valorLogistica = evento.logistica || 0;
  const valorEquipe = evento.equipe || 0;

  const custosDiv = document.getElementById("custosEvento");
  if (custosDiv) {
    custosDiv.innerHTML = `
      <p><strong>Valor de Logística:</strong> R$ ${valorLogistica.toFixed(2)}</p>
      <p><strong>Valor de Equipe:</strong> R$ ${valorEquipe.toFixed(2)}</p>
    `;
  }

}).catch(error => {
  console.error("Erro ao buscar dados:", error);
});
