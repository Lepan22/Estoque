<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>
<script>
  // Firebase config
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

  const urlParams = new URLSearchParams(window.location.search);
  const eventoId = urlParams.get("id");
  const refEvento = db.ref("eventos/" + eventoId);

  const tbody = document.querySelector("#itens-tabela tbody");
  const titulo = document.getElementById("eventoTitulo");
  const btnFinalizar = document.getElementById("finalizarEventoBtn");
  const btnSalvar = document.getElementById("salvarAlteracoesBtn");

  refEvento.once("value").then(snapshot => {
    const evento = snapshot.val();

    if (!evento) {
      alert("Evento não encontrado!");
      return;
    }

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

  btnSalvar.addEventListener("click", () => {
    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    refEvento.once("value").then(snapshot => {
      const ev = snapshot.val();
      const itensOrig = Array.isArray(ev.itens) ? ev.itens : [];
      const novos = [];

      document.querySelectorAll("#itens-tabela tbody tr[data-item-index]").forEach(tr => {
        const idx = parseInt(tr.getAttribute("data-item-index"), 10);
        if (isNaN(idx) || !itensOrig[idx]) return;
        const orig = itensOrig[idx];

        const assado = parseInt(tr.querySelector('input[name="assado"]').value, 10) || 0;
        const congelado = parseInt(tr.querySelector('input[name="congelado"]').value, 10) || 0;
        const perdido = parseInt(tr.querySelector('input[name="perdido"]').value, 10) || 0;

        novos.push({ ...orig, assado, congelado, perdido });
      });

      refEvento.update({ itens: novos })
        .then(() => {
          alert("Alterações salvas!");
          btnSalvar.textContent = "Salvar Alterações";
          btnSalvar.disabled = false;
        })
        .catch(err => {
          console.error(err);
          alert("Erro ao salvar!");
          btnSalvar.textContent = "Salvar Alterações";
          btnSalvar.disabled = false;
        });
    });
  });

  btnFinalizar.addEventListener("click", () => {
    btnFinalizar.disabled = true;
    btnFinalizar.textContent = "Finalizando...";

    const novos = [];

    document.querySelectorAll("#itens-tabela tbody tr[data-item-index]").forEach(tr => {
      const idx = parseInt(tr.getAttribute("data-item-index"), 10);
      const produto = tr.querySelector("td").textContent.trim();
      const assado = parseInt(tr.querySelector('input[name="assado"]').value, 10) || 0;
      const congelado = parseInt(tr.querySelector('input[name="congelado"]').value, 10) || 0;
      const perdido = parseInt(tr.querySelector('input[name="perdido"]').value, 10) || 0;

      novos.push({ produto, assado, congelado, perdido });
    });

    refEvento.update({ itens: novos, finalizado: true })
      .then(() => {
        alert("Evento finalizado.");
        document.querySelectorAll("input").forEach(input => input.disabled = true);
        btnSalvar.disabled = true;
      })
      .catch(err => {
        console.error(err);
        alert("Erro ao finalizar evento.");
      })
      .finally(() => {
        btnFinalizar.textContent = "Finalizar Evento e Salvar Alterações";
      });
  });
</script>
