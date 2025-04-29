import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBN-bmzgrlzjmrKMmuClZ8LVll-vJyx-aE",
  authDomain: "controleestoquelepan.firebaseapp.com",
  databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com",
  projectId: "controleestoquelepan",
  storageBucket: "controleestoquelepan.appspot.com",
  messagingSenderId: "779860276544",
  appId: "1:779860276544:web:f45844571a8c0bab1576a5",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const id = new URLSearchParams(window.location.search).get("id");

if (!id) {
  alert("Evento não encontrado.");
  window.location.href = "index.html";
}

const refEvento = ref(db, `eventos/${id}`);

get(refEvento).then(snapshot => {
  if (!snapshot.exists()) {
    alert("Evento não existe.");
    return;
  }

  const evento = snapshot.val();

  document.getElementById("eventoInfo").innerHTML = `
    <p><strong>Nome:</strong> ${evento.nome}</p>
    <p><strong>Data:</strong> ${evento.data}</p>
    <p><strong>Responsável:</strong> ${evento.responsavel}</p>
    <h3>Itens:</h3>
  `;

  const container = document.getElementById("itens");
  if (Array.isArray(evento.itens) && evento.itens.length > 0) {
    evento.itens.forEach(item => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `<span>${item.nomeItem}:</span> ${item.quantidadeEnviada}`;
      container.appendChild(div);
    });
  } else {
    container.innerHTML = "<p>Nenhum item registrado.</p>";
  }

  // Adicionar ação ao botão de "Finalizar Evento"
  const finalizarBtn = document.getElementById("finalizarBtn");
  finalizarBtn.addEventListener("click", () => {
    // Atualizar o status do evento para "finalizado"
    update(refEvento, { status: "finalizado" }).then(() => {
      alert("Evento finalizado com sucesso!");
      window.location.href = `resumo.html?id=${id}`; // Redireciona para a página de resumo
    }).catch((error) => {
      console.error("Erro ao finalizar evento:", error);
      alert("Houve um erro ao finalizar o evento.");
    });
  });
}).catch(err => {
  console.error("Erro ao buscar evento:", err);
});
