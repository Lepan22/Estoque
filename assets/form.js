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

get(refEvento).then(snapshot => {
  if (!snapshot.exists()) {
    alert("Evento não existe.");
    return;
  }

  const evento = snapshot.val();

  document.getElementById("eventoInfo").innerHTML = `
    <p><strong>Nome:</strong> ${evento.nome}</p>
    <p><strong>Data:</strong> ${evento.data}</p>
    <p><strong>Responsável:</strong> ${evento.responsavel}</p>
    <h3>Itens:</h3>
  `;

  const container = document.getElementById("itens");
  const successMessage = document.getElementById("successMessage");

  const itensRaw = evento.itens || {};
  const itens = Array.isArray(itensRaw)
    ? itensRaw
    : Object.keys(itensRaw).sort().map(k => itensRaw[k]);

  if (itens.length > 0) {
    itens.forEach(item => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <span>Nome: ${item.nomeItem}</span><br>
        <span>Quantidade Enviada: ${item.quantidadeEnviada}</span><br>
        <span>Assado: ${item.assado}</span><br>
        <span>Congelado: ${item.congelado}</span><br>
        <span>Perdido: ${item.perdido}</span><br>
      `;
      container.appendChild(div);
    });
  } else {
    container.innerHTML = "<p>Nenhum item registrado.</p>";
  }

  // Exibir mensagem de sucesso ao final do evento
  if (evento.status === "finalizado") {
    successMessage.style.display = "block";
  }

}).catch(err => {
  console.error("Erro ao buscar evento:", err);
});


