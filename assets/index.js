import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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

const container = document.getElementById('eventos-container');
const eventosRef = ref(db, 'eventos/');
onValue(eventosRef, (snapshot) => {
  container.innerHTML = '';
  const data = snapshot.val();
  if (!data) {
    container.innerHTML = '<p>Nenhum evento criado ainda.</p>';
    return;
  }
  Object.entries(data).forEach(([id, evento]) => {
    const div = document.createElement('div');
    div.style.marginBottom = '20px';
    div.style.border = '1px solid #ccc';
    div.style.padding = '10px';
    div.style.borderRadius = '8px';
    div.style.backgroundColor = '#f9f9f9';
    div.innerHTML = `
      <strong>Evento:</strong> ${evento.nome || '(sem nome)'}<br>
      <strong>Data:</strong> ${evento.data || '-'}<br>
      <strong>Responsável:</strong> ${evento.responsavel || '-'}<br>
      <strong>Status:</strong> ${evento.status || 'aberto'}<br>
      <a href="form.html?id=${id}">📄 Acessar Evento</a>
    `;
    container.appendChild(div);
  });
});
