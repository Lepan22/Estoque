import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, set, update, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBN-bmzgrlzjmrKMmuClZ8LVll-vJyx-aE",
  authDomain: "controleestoquelepan.firebaseapp.com",
  databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com",
  projectId: "controleestoquelepan",
  storageBucket: "controleestoquelepan.appspot.com",
  messagingSenderId: "779860276544",
  appId: "1:779860276544:web:f45844571a8c0bab1576a5",
};

// Inicializando Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Capturando o ID do evento da URL
const id = new URLSearchParams(window.location.search).get("id");

if (!id) {
  alert("Evento não encontrado.");
  window.location.href = "index.html";
}

// Referência do evento no banco de dados
const refEvento = ref(db, `eventos/${id}`);

// Função para carregar os detalhes do evento
get(refEvento).then(snapshot => {
  if (!snapshot.exists()) {
    alert("Evento não encontrado.");
    return;
  }

  const evento = snapshot.val();

  // Exibe as informações do evento
  document.getElementById("eventoInfo").innerHTML = `
    <p><strong>Nome:</strong> ${evento.nome}</p>
    <p><strong>Data:</strong> ${evento.data}</p>
    <p><strong>Responsável:</strong> ${evento.responsavel}</p>
    <h3>Itens:</h3>
  `;

  // Exibe os itens do evento
  const container = document.getElementById("itens");
  if (Array.isArray(evento.itens) && evento.itens.length > 0) {
    evento.itens.forEach(item => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <span>${item.nomeItem}:</span> ${item.quantidadeEnviada}
        <input type="number" placeholder="Quantidade a Retornar" id="retorno-${item.nomeItem}" />
      `;
      container.appendChild(div);
    });
  } else {
    container.innerHTML = "<p>Nenhum item registrado.</p>";
  }
}).catch(err => {
  console.error("Erro ao buscar evento:", err);
});

// Função para salvar o retorno
function salvarRetorno() {
  const eventoRef = ref(db, 'eventos/' + id);

  // Criando um objeto para salvar os dados do retorno
  const retorno = {};
  const items = document.querySelectorAll("[id^='retorno-']");
  items.forEach(item => {
    const nomeItem = item.id.replace('retorno-', '');
    const quantidadeRetornada = item.value ? parseInt(item.value) : 0;
    retorno[nomeItem] = quantidadeRetornada;
  });

  // Atualizando a referência do evento
  update(eventoRef, {
    status: 'finalizado', // Alterando o status para 'finalizado'
    retorno: retorno // Salvando o retorno dos itens
  }).then(() => {
    alert("Evento finalizado com sucesso!");
    window.location.href = "index.html"; // Redireciona para a página principal
  }).catch(error => {
    console.error("Erro ao salvar retorno:", error);
    alert("Erro ao salvar retorno.");
  });
}

// Event listener para o botão de salvar
document.getElementById("salvarRetorno").addEventListener("click", salvarRetorno);

