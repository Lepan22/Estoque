<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Evento</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
</head>
<body class="container py-4">

  <h2 id="eventoTitulo">Evento</h2>

  <table id="itens-tabela" class="table table-bordered mt-3">
    <thead>
      <tr>
        <th>Produto</th>
        <th>Assado</th>
        <th>Congelado</th>
        <th>Perdido</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>

  <button id="salvarAlteracoesBtn" class="btn btn-primary">Salvar Alterações</button>
  <button id="finalizarEventoBtn" class="btn btn-danger ms-2">Finalizar Evento e Salvar Alterações</button>

  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>
  <script>
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

      // ✅ Corrigido: usava get(refEvento), agora usa once("value")
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
            alert("Alterações salvas com sucesso!");
            btnSalvar.textContent = "Salvar Alterações";
            btnSalvar.disabled = false;
          })
          .catch(err => {
            console.error("Erro ao salvar alterações:", err);
            alert("Falha ao salvar. Veja o console.");
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
</body>
</html>
