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
    throw new Error("Evento não encontrado.");
  }

  const evento = snapshot.val();

  // ----- Calcular total de Logística
  let totalLogistica = 0;
  if (Array.isArray(evento.logistica)) {
    totalLogistica = evento.logistica.reduce((soma, item) => {
      return soma + parseFloat(item.valor || 0);
    }, 0);
  }

  // ----- Calcular total de Equipe
  let totalEquipe = 0;
  if (Array.isArray(evento.equipe)) {
    totalEquipe = evento.equipe.reduce((soma, item) => {
      return soma + parseFloat(item.valor || 0);
    }, 0);
  }

  // ----- Mostrar na tela
  const custosDiv = document.getElementById("custosEvento");
  custosDiv.innerHTML = `
    <p><strong>Total Logística:</strong> R$ ${totalLogistica.toFixed(2)}</p>
    <p><strong>Total Equipe:</strong> R$ ${totalEquipe.toFixed(2)}</p>
  `;

}).catch(error => {
  const custosDiv = document.getElementById("custosEvento");
  custosDiv.innerHTML = `<p style="color:red;">Erro ao carregar os dados: ${error.message}</p>`;
});
