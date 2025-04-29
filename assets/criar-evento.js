import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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

const form = document.getElementById("form-evento");
const addItemBtn = document.getElementById("add-item");
const itensContainer = document.getElementById("itens-container");

addItemBtn.addEventListener("click", () => {
  const div = document.createElement("div");
  div.classList.add("item-line");
  div.style.marginBottom = "10px"; // Adiciona um espaço entre as linhas de item

  const nomeInput = document.createElement("input");
  nomeInput.type = "text";
  nomeInput.name = "item-nome";
  nomeInput.required = true;
  nomeInput.placeholder = "Nome do item";
  nomeInput.style.marginRight = "5px";

  const qtdInput = document.createElement("input");
  qtdInput.type = "number";
  qtdInput.name = "item-quantidade";
  qtdInput.required = true;
  qtdInput.min = 1;
  qtdInput.placeholder = "Quantidade Enviada";
  qtdInput.style.marginRight = "5px";

  const removerBtn = document.createElement("button");
  removerBtn.type = "button";
  removerBtn.textContent = "Remover";
  removerBtn.addEventListener("click", () => {
    itensContainer.removeChild(div);
  });

  div.appendChild(nomeInput);
  div.appendChild(qtdInput);
  div.appendChild(removerBtn);

  itensContainer.appendChild(div);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  const nome = data.get("nome");
  const dataEvento = data.get("data");
  const responsavel = data.get("responsavel");

  const inputs = itensContainer.querySelectorAll(".item-line");
  // --- MUDANÇA AQUI: Inicializa 'itens' como um ARRAY --- 
  const itens = []; 

  inputs.forEach(div => {
    const nomeInput = div.querySelector("input[name='item-nome']");
    const qtdInput = div.querySelector("input[name='item-quantidade']");
    const nomeItem = nomeInput.value.trim();
    const quantidade = parseInt(qtdInput.value.trim());
    
    if (nomeItem && quantidade > 0) {
      // --- MUDANÇA AQUI: Adiciona um OBJETO ao ARRAY 'itens' --- 
      itens.push({
        nomeItem: nomeItem,       // Salva o nome do item
        enviado: quantidade,      // Salva a quantidade enviada
        assado: 0,              // Inicializa os outros campos como 0
        congelado: 0,
        perdido: 0
      });
    }
  });

  // Verifica se pelo menos um item foi adicionado
  if (itens.length === 0) {
    alert("Por favor, adicione pelo menos um item ao evento.");
    return; // Impede o envio do formulário se não houver itens
  }

  const novoEvento = {
    nome,
    data: dataEvento,
    responsavel,
    status: "aberto",
    itens // Agora 'itens' é um array de objetos
  };

  try {
    await push(ref(db, "eventos"), novoEvento);
    alert("Evento criado com sucesso!");
    // Limpa o formulário após o sucesso (opcional)
    form.reset();
    itensContainer.innerHTML = ''; // Limpa os itens adicionados dinamicamente
    // Redireciona para a página inicial
    window.location.href = "../index.html"; 
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    alert("Erro ao criar evento. Verifique o console para mais detalhes.");
  }
});
