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
    <strong>Status:</strong> ${evento.status ? evento.status.toUpperCase() : "ABERTO"}<br><br>
  `;

  const isFinalizado = evento.status === "finalizado";

  if (!evento.itens || evento.itens.length === 0) {
    form.innerHTML = "<p>Nenhum item foi adicionado ao evento.</p>";
    salvarBtn.disabled = true;
    return;
  }

  evento.itens.forEach((item, index) => {
    const nome = item.nomeItem;
    const enviado = item.quantidadeEnviada || 0;
    const congelado = item.congelado || 0;
    const assado = item.assado || 0;
    const perdido = item.perdido || 0;
    const vendido = enviado - (congelado + assado + perdido);

    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${nome}</strong><br>
      Enviado: ${enviado}<br>
      <label>Congelado: <input type="number" name="${index}-congelado" value="${congelado}" ${isFinalizado ? 'disabled' : ''}></label><br>
      <label>Assado: <input type="number" name="${index}-assado" value="${assado}" ${isFinalizado ? 'disabled' : ''}></label><br>
      <label>Perdido: <input type="number" name="${index}-perdido" value="${perdido}" ${isFinalizado ? 'disabled' : ''}></label><br>
      <strong>Venda:</strong> ${vendido}<br><br>
    `;
    form.appendChild(div);
  });

  salvarBtn.disabled = isFinalizado;
});

salvarBtn.addEventListener("click", async () => {
  const inputs = form.querySelectorAll("input");
  const eventoRef = ref(db, `eventos/${eventoId}`);

  onValue(eventoRef, (snapshot) => {
    const evento = snapshot.val();
    if (!evento || !evento.itens) return;

    const atualizados = evento.itens.map((item, index) => {
      return {
        ...item,
        congelado: parseInt(document.querySelector(`[name="${index}-congelado"]`)?.value) || 0,
        assado: parseInt(document.querySelector(`[name="${index}-assado"]`)?.value) || 0,
        perdido: parseInt(document.querySelector(`[name="${index}-perdido"]`)?.value) || 0
      };
    });

    update(ref(db), {
      [`eventos/${eventoId}/itens`]: atualizados,
      [`eventos/${eventoId}/status`]: "finalizado"
    }).then(() => {
      alert("Evento salvo e finalizado.");
      location.reload();
    }).catch((err) => {
      console.error(err);
      alert("Erro ao salvar.");
    });
  }, { onlyOnce: true });
});
