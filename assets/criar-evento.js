import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase, ref, push, update, get, child
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBN-bmzgrlzjmrKMmuClZ8LVll-vJyx-aE",
  authDomain: "controleestoquelepan.firebaseapp.com",
  databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com",
  projectId: "controleestoquelepan",
  storageBucket: "controleestoquelepan.appspot.com",
  messagingSenderId: "779860276544",
  appId: "1:779860276544:web:f45844571a8c0bab1576a5"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

const params   = new URLSearchParams(window.location.search);
const eventId  = params.get("id");
const isEdit   = Boolean(eventId);

const titleH2     = document.getElementById("form-title");
const submitBtn   = document.getElementById("submit-btn");
const addItem     = document.getElementById("add-item");
const itensCt     = document.getElementById("itens-container");
const form        = document.getElementById("form-evento");
const datalist    = document.getElementById("lista-produtos");
const nomeSelect  = document.getElementById("nome");

let produtosValidos = new Set();

// Carrega produtos válidos
get(ref(db, "produtos")).then(snap => {
  const prods = snap.val() || {};
  Object.values(prods).forEach(p => {
    const nomeLimpo = (p.nome || "").trim().toLowerCase();
    produtosValidos.add(nomeLimpo);
    const opt = document.createElement("option");
    opt.value = p.nome;
    datalist.appendChild(opt);
  });
});

// Carrega nomeEvento de todos os clientes
get(ref(db, "clientes")).then(snapshot => {
  const clientes = snapshot.val() || {};
  const nomesAdicionados = new Set();

  Object.values(clientes).forEach(cliente => {
    const nomeEvento = cliente.nomeEvento?.trim();
    if (nomeEvento && !nomesAdicionados.has(nomeEvento)) {
      nomesAdicionados.add(nomeEvento);
      const opt = document.createElement("option");
      opt.value = nomeEvento;
      opt.textContent = nomeEvento;
      nomeSelect.appendChild(opt);
    }
  });

  // Edição: manter nome antigo se necessário
  if (isEdit && form.dataset.nomeAntigo) {
    const antigo = form.dataset.nomeAntigo;
    if (!nomesAdicionados.has(antigo)) {
      const opt = document.createElement("option");
      opt.value = antigo;
      opt.textContent = antigo + " (antigo)";
      opt.selected = true;
      nomeSelect.appendChild(opt);
    } else {
      nomeSelect.value = antigo;
    }
  }
});

function novaLinha(item = {}) {
  const div = document.createElement("div");
  div.className = "item-line";

  const nome = document.createElement("input");
  nome.type = "text"; nome.name = "item-nome";
  nome.setAttribute("list", "lista-produtos");
  nome.placeholder = "Produto";
  nome.required = true;
  nome.value = item.nomeItem || item.nome || "";

  const qtd = document.createElement("input");
  qtd.type = "number"; qtd.name = "item-quantidade";
  qtd.placeholder = "Qtd"; qtd.min = "1"; qtd.required = true;
  qtd.value = item.quantidade ?? item.qtd ?? "";

  const rem = document.createElement("button");
  rem.type = "button"; rem.textContent = "❌";
  rem.addEventListener("click", () => div.remove());

  div.append(nome, qtd, rem);
  itensCt.appendChild(div);
}

addItem.addEventListener("click", () => novaLinha());

if (isEdit) {
  titleH2.textContent   = "Editar Evento";
  submitBtn.textContent = "Salvar Alterações";
  get(child(ref(db), `eventos/${eventId}`)).then(snap => {
    if (!snap.exists()) return;
    const ev = snap.val();
    form.dataset.nomeAntigo   = ev.nome;
    nomeSelect.value           = ev.nome;
    form.data.value            = ev.data;
    form.responsavel.value     = ev.responsavel;
    (ev.itens || []).forEach(it => novaLinha(it));
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const itens = Array.from(itensCt.children).map(div => {
    return {
      nomeItem: div.querySelector('[name="item-nome"]').value.trim(),
      quantidade: +div.querySelector('[name="item-quantidade"]').value
    };
  });

  const invalidos = itens.filter(i => !produtosValidos.has(i.nomeItem.toLowerCase()));
  if (invalidos.length > 0) {
    alert("Os seguintes produtos não estão cadastrados:\n\n" + invalidos.map(i => "- " + i.nomeItem).join("\n"));
    return;
  }

  const evObj = {
    nome:        nomeSelect.value,
    data:        form.data.value,
    responsavel: form.responsavel.value,
    itens,
    status: "aberto"
  };

  const action = isEdit
    ? update(ref(db, `eventos/${eventId}`), evObj)
    : push(ref(db, "eventos"), evObj);

  action
    .then(() => location.href = "../index.html")
    .catch(err => {
      console.error(err);
      alert("Falha ao salvar.");
    });
});
