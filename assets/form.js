import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  update
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const form = document.getElementById("form-itens");
const info = document.getElementById("info-evento");
const salvarBtn = document.getElementById("btn-salvar");

const params = new URLSearchParams(window.location.search);
const eventoId = params.get("id");

if (!eventoId) {
  alert("Evento não encontrado.");
}

const eventoRef = ref(db, `eventos/${eventoId}`);

onValue(eventoRef, (snapshot) => {
  const evento = snapshot.val();
  if (!evento) return;

  form.innerHTML = "";
  info.innerHTML = `
    <strong>Evento:</strong> ${evento.nome}<br>
    <strong>Data:</strong> ${evento.data}<br>
    <strong>Responsável:</strong> ${evento.responsavel}<br>
    <strong>Status:</strong> ${evento.status.toUpperCase()}<br><br>
  `;

  const isFinalizado = evento.status === "finalizado";

  if (!evento.itens || Object.keys(evento.itens).length === 0) {
    form.innerHTML = "<p>Nenhum item foi adicionado ao evento.</p>";
    salvarBtn.disabled = true;
    return;
  }

  for (const [nomeItem, dados] of Object.entries(evento.itens)) {
    const congelado = dados.congelado || 0;
    const assado = dados.assado || 0;
    const perdido = dados.perdido || 0;
    const enviado = dados.enviado || 0;
    const vendido = enviado - (congelado + assado + perdido);

    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${nomeItem}</strong><br>
      Enviado: ${enviado}<br>
      <label>Congelado: <input type="number" name="${nomeItem}-congelado" value="${congelado}" ${isFinalizado ? 'disabled' : ''}></label><br>
      <label>Assado: <input type="number" name="${nomeItem}-assado" value="${assado}" ${isFinalizado ? 'disabled' : ''}></label><br>
      <label>Perdido: <input type="number" name="${nomeItem}-perdido" value="${perdido}" ${isFinalizado ? 'disabled' : ''}></label><br>
      <strong>Venda:</strong> ${vendido}<br><br>
    `;
    form.appendChild(div);
  }

  salvarBtn.disabled = isFinalizado;
});

salvarBtn.addEventListener("click", async () => {
  const data = {};
  const inputs = form.querySelectorAll("input");

  inputs.forEach(input => {
    const [item, tipo] = input.name.split("-");
    if (!data[item]) data[item] = {};
    data[item][tipo] = parseInt(input.value) || 0;
  });

  const updates = {};
  for (const item in data) {
    updates[`eventos/${eventoId}/itens/${item}/congelado`] = data[item].congelado;
    updates[`eventos/${eventoId}/itens/${item}/assado`] = data[item].assado;
    updates[`eventos/${eventoId}/itens/${item}/perdido`] = data[item].perdido;
  }
  updates[`eventos/${eventoId}/status`] = "finalizado";

  try {
    await update(ref(db), updates);
    alert("Evento salvo e finalizado.");
    location.reload();
  } catch (e) {
    console.error(e);
    alert("Erro ao salvar.");
  }
});

