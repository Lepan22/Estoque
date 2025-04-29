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

  const nomeInput = document.createElement("input");
  nomeInput.type = "text";
  nomeInput.name = "item-nome";
  nomeInput.required = true;
  nomeInput.placeholder = "Nome do item";

  const qtdInput = document.createElement("input");
  qtdInput.type = "number";
  qtdInput.name = "item-quantidade";
  qtdInput.required = true;
  qtdInput.min = 1;
  qtdInput.placeholder = "Quantidade";

  const removerBtn = document.createElement("button");
  removerBtn.type = "button";
  removerBtn.textContent = "Remover";
  removerBtn.addEventListener("click", () => {
    itensContainer.removeChild(div);
  });

  div.appendChild(nomeInput);
  div.appendChild(qtdInput);
  div.appendChild(removerBtn);
  div.appendChild(document.createElement("br"));
  div.appendChild(document.createElement("br"));

  itensContainer.appendChild(div);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  const nome = data.get("nome");
  const dataEvento = data.get("data");
  const responsavel = data.get("responsavel");

  const inputs = itensContainer.querySelectorAll(".item-line");
  const itens = {};

  inputs.forEach(div => {
    const nomeInput = div.querySelector("input[name='item-nome']");
    const qtdInput = div.querySelector("input[name='item-quantidade']");
    const nomeItem = nomeInput.value.trim();
    const quantidade = parseInt(qtdInput.value.trim());
    if (nomeItem && quantidade > 0) {
      itens[nomeItem] = { enviado: quantidade };
    }
  });

  const novoEvento = {
    nome,
    data: dataEvento,
    responsavel,
    status: "aberto",
    itens
  };

  try {
    await push(ref(db, "eventos"), novoEvento);
    alert("Evento criado com sucesso!");
    window.location.href = "../index.html";
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    alert("Erro ao criar evento.");
  }
});
