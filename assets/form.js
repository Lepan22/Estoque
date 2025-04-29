// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

// Firebase App Initialization
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

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const eventoId = urlParams.get('id');

// Get the evento data from Firebase
const eventoRef = ref(db, 'eventos/' + eventoId);
get(eventoRef)
  .then((snapshot) => {
    if (snapshot.exists()) {
      const evento = snapshot.val();
      console.log(evento);

      // Show the event information
      document.getElementById("eventoNome").innerText = evento.nome;
      document.getElementById("eventoData").innerText = evento.data;
      document.getElementById("eventoResponsavel").innerText = evento.responsavel;

      // If 'itens' exists and is an array, display them
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

// Event listener for the save button
document.getElementById("salvarEvento").addEventListener("click", function() {
  const evento = {
    congelado: [],
    assado: [],
    perdido: []
  };

  // Collect values for each item
  document.querySelectorAll("[name^='congelado-']").forEach((input, index) => {
    evento.congelado[index] = input.value;
  });

  document.querySelectorAll("[name^='assado-']").forEach((input, index) => {
    evento.assado[index] = input.value;
  });

  document.querySelectorAll("[name^='perdido-']").forEach((input, index) => {
    evento.perdido[index] = input.value;
  });

  console.log("Evento atualizado:", evento);
  alert("Evento salvo com sucesso!");

  // Add save logic here if needed (e.g., save back to Firebase)
});

