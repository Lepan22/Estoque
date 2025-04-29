import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBN-bmzgrlzjmrKMmuClZ8LVll-vJyx-aE",
  authDomain: "controleestoquelepan.firebaseapp.com",
  databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com",
  projectId: "controleestoquelepan",
  storageBucket: "controleestoquelepan.firebasestorage.app",
  messagingSenderId: "779860276544",
  appId: "1:779860276544:web:f45844571a8c0bab1576a5",
  measurementId: "G-EDKYH7TKMG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Function to fetch event data from Firebase
function getEvento(eventoId) {
  const eventoRef = ref(db, 'eventos/' + eventoId);
  
  get(eventoRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const evento = snapshot.val();
        console.log("Evento:", evento);  // Verifique o objeto completo
        
        // Show the event information
        document.getElementById("eventoNome").innerText = evento.nome;
        document.getElementById("eventoData").innerText = evento.data;
        document.getElementById("eventoResponsavel").innerText = evento.responsavel;

        // Verifique se 'itens' é um array válido
        if (Array.isArray(evento.itens)) {
          const divItens = document.getElementById("itens");
          evento.itens.forEach((item, index) => {
            const div = document.createElement("div");
            div.innerHTML = `
              <p><strong>${item.nomeItem}</strong> - Enviado: ${item.quantidadeEnviada}</p>
              <label>Congelado: <input type="number" min="0" name="congelado-${index}"></label>
              <label>Assado: <input type="number" min="0" name="assado-${index}"></label>
              <label>Perdido: <input type="number" min="0" name="perdido-${index}"></label>
              <hr>
            `;
            divItens.appendChild(div);
          });
        } else {
          console.error("Itens não são um array válido.");
        }
      } else {
        console.log("Evento não encontrado");
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar evento:", error);
    });
}

// Get the 'id' parameter from the URL
const urlParams = new URLSearchParams(window.location.search);
const eventoId = urlParams.get('id');

if (eventoId) {
  getEvento(eventoId);
} else {
  console.log("ID do evento não fornecido.");
}

