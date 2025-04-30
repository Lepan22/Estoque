// form.js
import { initializeApp }              from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// --- Configuração do Firebase (use seus dados) ---
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
const db  = getDatabase(app);

// Captura o ID do evento na URL
const params    = new URLSearchParams(window.location.search);
const eventId   = params.get("id");
const itensBody = document.getElementById("itens-body");
const btnFinal  = document.getElementById("finalizar");

if (!eventId) {
  alert("ID do evento não fornecido.");
  location.href = "index.html";
}

// Referência ao evento
const eventoRef = ref(db, `eventos/${eventId}`);

// Função para carregar dados do evento e popular a tabela
function carregarDados() {
  get(eventoRef)
    .then(snapshot => {
      if (!snapshot.exists()) {
        alert("Evento não encontrado.");
        location.href = "index.html";
        return;
      }

      const ev = snapshot.val();

      // Preenche campos principais
      document.getElementById("nome").value       = ev.nome       || "";
      document.getElementById("data").value       = ev.data       || "";
      document.getElementById("responsavel").value= ev.responsavel|| "";

      // Limpa tabela
      itensBody.innerHTML = "";

      const itens = Array.isArray(ev.itens) ? ev.itens : [];

      if (itens.length === 0) {
        itensBody.innerHTML = `<tr><td colspan="5">Nenhum item registrado para este evento.</td></tr>`;
      } else {
        itens.forEach((item, idx) => {
          const tr = document.createElement("tr");
          tr.setAttribute("data-index", idx);

          // Nome pode estar em item.nomeItem ou item.nome
          const nomeExib = item.nomeItem ?? item.nome ?? "—";
          // Enviado pode ser boolean ou número/texto
          const enviadoExib = (item.enviado === true || item.enviado === false)
            ? item.enviado
            : (item.enviado ?? "—");

          tr.innerHTML = `
            <td>${nomeExib}</td>
            <td>${enviadoExib}</td>
            <td><input type="number" name="assado"    value="${item.assado   ?? 0}" min="0"></td>
            <td><input type="number" name="congelado" value="${item.congelado?? 0}" min="0"></td>
            <td><input type="number" name="perdido"   value="${item.perdido  ?? 0}" min="0"></td>
          `;

          itensBody.appendChild(tr);
        });
      }

      // Se já finalizado, desabilita inputs e botão
      if (ev.status === "finalizado") {
        btnFinal.textContent = "Evento Finalizado";
        btnFinal.disabled    = true;
        itensBody.querySelectorAll("input").forEach(i => i.disabled = true);
      }
    })
    .catch(err => {
      console.error("Erro ao carregar evento:", err);
      itensBody.innerHTML = `<tr><td colspan="5">Erro ao carregar itens.</td></tr>`;
    });
}

// Função para finalizar evento (salvar alterações nos itens e marcar status)
btnFinal.addEventListener("click", () => {
  btnFinal.disabled    = true;
  btnFinal.textContent = "Salvando...";

  const linhas = document.querySelectorAll("#itens-body tr[data-index]");
  const novos  = [];

  linhas.forEach(tr => {
    const idx = parseInt(tr.getAttribute("data-index"), 10);
    const orig = Array.isArray(orig = null) ? null : null; // placeholder
  });

  // Corrige acima: precisamos do array original. Recarregue snapshot.
  get(eventoRef).then(snapshot => {
    const ev = snapshot.val();
    const itensOrig = Array.isArray(ev.itens) ? ev.itens : [];

    linhas.forEach(tr => {
      const idx = parseInt(tr.getAttribute("data-index"), 10);
      if (isNaN(idx) || !itensOrig[idx]) return;

      const orig = itensOrig[idx];
      const assado    = parseInt(tr.querySelector('input[name="assado"]').value, 10)    || 0;
      const congelado = parseInt(tr.querySelector('input[name="congelado"]').value, 10) || 0;
      const perdido   = parseInt(tr.querySelector('input[name="perdido"]').value, 10)   || 0;

      novos.push({ ...orig, assado, congelado, perdido });
    });

    // Atualiza itens e status
    update(eventoRef, { itens: novos, status: "finalizado" })
      .then(() => {
        alert("Alterações salvas e evento finalizado!");
        btnFinal.textContent = "Evento Finalizado";
        itensBody.querySelectorAll("input").forEach(i => i.disabled = true);
      })
      .catch(err => {
        console.error("Erro ao salvar alterações:", err);
        alert("Falha ao salvar. Veja console.");
        btnFinal.disabled    = false;
        btnFinal.textContent = "Finalizar Evento e Salvar Alterações";
      });
  });
});

// Carrega tudo ao iniciar
carregarDados();
