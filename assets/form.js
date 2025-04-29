import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Configuração Firebase
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

// Pega o ID do evento pela URL
const id = new URLSearchParams(window.location.search).get("id");

if (!id) {
  alert("Evento não encontrado.");
  window.location.href = "index.html";
}

const refEvento = ref(db, `eventos/${id}`);

// Carrega dados do evento
get(refEvento).then(snapshot => {
  if (!snapshot.exists()) {
    alert("Evento não encontrado.");
    return;
  }

  const evento = snapshot.val();

  document.getElementById("eventoInfo").innerHTML = `
    <p><strong>Nome:</strong> ${evento.nome || "N/A"}</p>
    <p><strong>Data:</strong> ${evento.data || "N/A"}</p>
    <p><strong>Responsável:</strong> ${evento.responsavel || "N/A"}</p>
  `;

  const container = document.getElementById("itens");
  container.innerHTML = "";

  // Suporte a arrays ou objetos
  const itensArray = Array.isArray(evento.itens)
    ? evento.itens
    : Object.values(evento.itens || {});

  if (itensArray.length === 0) {
    container.innerHTML = "<p>Nenhum item registrado.</p>";
    return;
  }

  itensArray.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <h4>${item.nomeItem || "Item sem nome"}</h4>
      <p><strong>Enviado:</strong> ${item.quantidadeEnviada ?? 0}</p>
      <label>Assado: <input type="number" id="assado-${index}" value="${item.assado ?? 0}"></label><br>
      <label>Congelado: <input type="number" id="congelado-${index}" value="${item.congelado ?? 0}"></label><br>
      <label>Perdido: <input type="number" id="perdido-${index}" value="${item.perdido ?? 0}"></label>
      <hr>
    `;
    container.appendChild(div);
  });

  // Botão para salvar retorno
  const botaoSalvar = document.createElement("button");
  botaoSalvar.textContent = "Finalizar Evento";
  botaoSalvar.onclick = () => {
    const novosItens = itensArray.map((item, index) => ({
      ...item,
      assado: parseInt(document.getElementById(`assado-${index}`).value) || 0,
      congelado: parseInt(document.getElementById(`congelado-${index}`).value) || 0,
      perdido: parseInt(document.getElementById(`perdido-${index}`).value) || 0,
    }));

    update(refEvento, {
      itens: novosItens,
      status: "finalizado"
    }).then(() => {
      alert("Evento finalizado com sucesso!");
      window.location.href = `resumo.html?id=${id}`;
    }).catch(err => {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar o evento.");
    });
  };

  document.body.appendChild(botaoSalvar);
}).catch(error => {
  console.error("Erro ao buscar evento:", error);
});
