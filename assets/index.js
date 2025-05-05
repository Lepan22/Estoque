import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  onValue
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
const eventosContainer = document.getElementById("eventos-container");

function carregarEventos() {
  const eventosRef = ref(db, "eventos");

  onValue(eventosRef, (snapshot) => {
    eventosContainer.innerHTML = "";

    if (!snapshot.exists()) {
      eventosContainer.innerHTML = "<tr><td colspan='5'>Nenhum evento cadastrado.</td></tr>";
      return;
    }

    const eventos = snapshot.val();

    Object.entries(eventos).forEach(([id, evento]) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${evento.nome}</td>
        <td>${evento.data}</td>
        <td>${evento.status || "aberto"}</td>
        <td>${evento.responsavel || ""}</td>
        <td>
          <button class="edit-btn" data-id="${id}">Editar</button>
          <button class="duplicate-btn" data-id="${id}">Duplicar</button>
        </td>
      `;
      eventosContainer.appendChild(row);
    });

    document.querySelectorAll('.edit-btn').forEach(botao => {
      botao.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        window.location.href = `criar-evento.html?id=${id}`;
      });
    });

    document.querySelectorAll('.duplicate-btn').forEach(botao => {
      botao.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const snapshot = await get(ref(db, `eventos/${id}`));
        if (!snapshot.exists()) return alert("Evento não encontrado.");
        const eventoOriginal = snapshot.val();

        const duplicado = {
          ...eventoOriginal,
          status: "aberto"
        };

        localStorage.setItem("eventoDuplicado", JSON.stringify(duplicado));
        window.location.href = "criar-evento.html";
      });
    });
  });
}

carregarEventos();
