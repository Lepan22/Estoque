// Firebase setup
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  databaseURL: "https://SEU_DOMINIO.firebaseio.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_BUCKET.appspot.com",
  messagingSenderId: "ID_MSG",
  appId: "ID_APP"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ID do evento pela URL
const urlParams = new URLSearchParams(window.location.search);
const eventoId = urlParams.get("id");
const refEvento = db.ref("eventos/" + eventoId);

// Elementos DOM
const tbody = document.querySelector("#itens-tabela tbody");
const titulo = document.getElementById("eventoTitulo");
const btnFinalizar = document.getElementById("finalizarEventoBtn");
const btnSalvar = document.getElementById("salvarAlteracoesBtn");

// Carrega evento
refEvento.once("value").then(snapshot => {
  const evento = snapshot.val();
  titulo.textContent = evento.nome || "Evento";

  if (Array.isArray(evento.itens)) {
    evento.itens.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.setAttribute("data-item-index", index);

      tr.innerHTML = `
        <td>${item.produto}</td>
        <td><input type="number" class="form-control" name="assado" value="${item.assado || 0}"/></td>
        <td><input type="number" class="form-control" name="congelado" value="${item.congelado || 0}"/></td>
        <td><input type="number" class="form-control" name="perdido" value="${item.perdido || 0}"/></td>
      `;
      tbody.appendChild(tr);
    });
  }

  if (evento.finalizado) {
    document.querySelectorAll("input").forEach(input => input.disabled = true);
    btnFinalizar.disabled = true;
    btnSalvar.disabled = true;
  }
});

// Função de coleta de dados atualizados
function coletarItensAtualizados() {
  const novos = [];

  document.querySelectorAll("#itens-tabela tbody tr[data-item-index]").forEach(tr => {
    const idx = parseInt(tr.getAttribute("data-item-index"), 10);
    const produto = tr.querySelector("td").textContent.trim();
    const assado = parseInt(tr.querySelector('input[name="assado"]').value, 10) || 0;
    const congelado = parseInt(tr.querySelector('input[name="congelado"]').value, 10) || 0;
    const perdido = parseInt(tr.querySelector('input[name="perdido"]').value, 10) || 0;

    novos.push({ produto, assado, congelado, perdido });
  });

  return novos;
}

// Botão salvar alterações
btnSalvar.addEventListener("click", () => {
  btnSalvar.disabled = true;
  btnSalvar.textContent = "Salvando...";

  const novos = coletarItensAtualizados();

  refEvento.update({ itens: novos })
    .then(() => alert("Alterações salvas."))
    .catch(err => {
      console.error("Erro ao salvar alterações:", err);
      alert("Erro ao salvar alterações.");
    })
    .finally(() => {
      btnSalvar.disabled = false;
      btnSalvar.textContent = "Salvar Alterações";
    });
});

// Botão finalizar evento
btnFinalizar.addEventListener("click", () => {
  btnFinalizar.disabled = true;
  btnFinalizar.textContent = "Finalizando...";

  const novos = coletarItensAtualizados();

  refEvento.update({ itens: novos, finalizado: true })
    .then(() => {
      alert("Evento finalizado.");
      document.querySelectorAll("input").forEach(input => input.disabled = true);
      btnSalvar.disabled = true;
    })
    .catch(err => {
      console.error("Erro ao finalizar evento:", err);
      alert("Erro ao finalizar evento.");
    })
    .finally(() => {
      btnFinalizar.textContent = "Finalizar Evento e Salvar Alterações";
    });
});
