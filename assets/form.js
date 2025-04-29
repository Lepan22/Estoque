import { db } from './firebase-config.js';
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

const eventoRef = ref(db, 'eventos/' + id);
get(eventoRef).then(snapshot => {
  const evento = snapshot.val();
  document.getElementById('evento-info').textContent = "Evento: " + evento.nome + " | Responsável: " + evento.responsavel;

  // Exibir os itens do evento
  const itensContainer = document.getElementById('itens');
  evento.itens.forEach(item => {
    const divItem = document.createElement('div');
    divItem.innerHTML = `
      <strong>${item.nomeItem}</strong> - Enviado: ${item.quantidadeEnviada} <br>
      Congelado: <input type="number" id="congelado_${item.nomeItem}" placeholder="Quantidade congelado"><br>
      Assado: <input type="number" id="assado_${item.nomeItem}" placeholder="Quantidade assado"><br>
      Perdido: <input type="number" id="perdido_${item.nomeItem}" placeholder="Quantidade perdido"><br><br>
    `;
    itensContainer.appendChild(divItem);
  });

  // Ocultar formulário caso o evento tenha sido finalizado
  if (evento.status === 'finalizado') {
    document.getElementById('formRetorno').style.display = 'none';
  }
});

document.getElementById('formRetorno').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const retorno = {};
  const eventoRef = ref(db, 'eventos/' + id);
  
  // Para cada item, coletar as quantidades de retorno
  const evento = snapshot.val();
  evento.itens.forEach(item => {
    const congelado = parseInt(document.getElementById(`congelado_${item.nomeItem}`).value) || 0;
    const assado = parseInt(document.getElementById(`assado_${item.nomeItem}`).value) || 0;
    const perdido = parseInt(document.getElementById(`perdido_${item.nomeItem}`).value) || 0;
    
    retorno[item.nomeItem] = { congelado, assado, perdido };
  });

  update(eventoRef, {
    status: 'finalizado',
    retorno
  }).then(() => alert("Dados enviados com sucesso!"));
});
