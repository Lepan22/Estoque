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
  document.getElementById("totaisEvento").innerHTML = "<p>ID do evento não fornecido.</p>";
  throw new Error("ID do evento não encontrado na URL.");
}

const refEvento = ref(db, `eventos/${id}`);

get(refEvento).then(snapshot => {
  if (!snapshot.exists()) {
    document.getElementById("totaisEvento").innerHTML = "<p>Evento não encontrado.</p>";
    return;
  }

  const evento = snapshot.val();
  const logistica = evento.logistica || 0;
  const equipe = evento.equipe || 0;

  document.getElementById("totaisEvento").innerHTML = `
    <h2>Totais do Evento</h2>
    <p><strong>Logística:</strong> R$ ${logistica.toFixed(2)}</p>
    <p><strong>Equipe:</strong> R$ ${equipe.toFixed(2)}</p>
  `;
}).catch(error => {
  console.error("Erro ao buscar evento:", error);
  document.getElementById("totaisEvento").innerHTML = "<p>Erro ao carregar os dados.</p>";
});
