import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBN-bmzgrlzjmrKMmuClZ8LVll-vJyx-aE",
  authDomain: "controleestoquelepan.firebaseapp.com",
  databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com",
  projectId: "controleestoquelepan",
  storageBucket: "controleestoquelepan.appspot.com",
  messagingSenderId: "779860276544",
  appId: "1:779860276544:web:f45844571a8c0bab1576a5",
  measurementId: "G-EDKYH7TKMG"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Formulário
const form = document.getElementById('form-criar-evento');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const data = document.getElementById('data').value;
  const responsavel = document.getElementById('responsavel').value.trim();

  if (!nome || !data || !responsavel) {
    alert("Preencha todos os campos.");
    return;
  }

  const novoEvento = {
    nome,
    data,
    responsavel,
    status: "aberto",
    itens: {}
  };

  try {
    const eventosRef = ref(db, 'eventos');
    await push(eventosRef, novoEvento);

    alert("Evento criado com sucesso!");
    window.location.href = "../index.html"; // Redireciona corretamente
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    alert("Erro ao criar evento. Tente novamente.");
  }
});

