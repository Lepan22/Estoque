
import { db } from './firebase-config.js';
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

const eventoRef = ref(db, 'eventos/' + id);
get(eventoRef).then(snapshot => {
  const evento = snapshot.val();
  document.getElementById('evento-info').textContent = "Evento: " + evento.nome;
  if (evento.status === 'finalizado') {
    document.getElementById('formRetorno').style.display = 'none';
  }
});

document.getElementById('formRetorno').addEventListener('submit', (e) => {
  e.preventDefault();
  const congelado = parseInt(document.getElementById('congelado').value) || 0;
  const assado = parseInt(document.getElementById('assado').value) || 0;
  const perdido = parseInt(document.getElementById('perdido').value) || 0;
  update(eventoRef, {
    congelado,
    assado,
    perdido,
    status: 'finalizado'
  }).then(() => alert("Dados enviados com sucesso!"));
});
