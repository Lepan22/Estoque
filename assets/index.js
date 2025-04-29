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

const container = document.getElementById("eventos-container");

const eventosRef = ref(db, "eventos");
get(eventosRef).then(snapshot => {
  container.innerHTML = ""; // limpa o "carregando..."
  if (snapshot.exists()) {
    const eventos = snapshot.val();
    Object.entries(eventos).forEach(([id, evento]) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <strong>${evento.nome}</strong><br/>
        Data: ${evento.data}<br/>
        Responsável: ${evento.responsavel}<br/>
        <a href="form.html?id=${id}">📋 Ver Detalhes</a>
        <hr/>
      `;
      container.appendChild(div);
    });
  } else {
    container.innerHTML = "<p>Nenhum evento encontrado.</p>";
  }
}).catch(error => {
  container.innerHTML = "<p>Erro ao carregar eventos.</p>";
  console.error(error);
});
