<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Detalhes do Evento</title>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <div class="container">
    <h1>Detalhes do Evento</h1>
    <div id="eventoInfo"></div>
    <h3>Itens:</h3>
    
    <table id="itens-tabela">
      <thead>
        <tr>
          <th class="col-nome">Nome</th>
          <th class="col-quantidade">Quantidade</th>
          <th class="col-editavel">Assado</th>
          <th class="col-editavel">Congelado</th>
          <th class="col-editavel">Perdido</th>
        </tr>
      </thead>
      <tbody id="itens-tbody">
        <tr><td colspan="6">Carregando itens...</td></tr>
      </tbody>
    </table>

    <div class="button-container" style="margin-top: 20px;">
      <button id="salvarAlteracoesBtn">Salvar Alterações</button>
      <button id="finalizarEventoBtn">Finalizar Evento e Salvar Alterações</button>
    </div>
  </div>

  <script type="module">
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

    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id");
    const refEvento = ref(db, `eventos/${eventId}`);
    const itensBody = document.getElementById("itens-tbody");
    const btnFinal = document.getElementById("finalizarEventoBtn");
    const btnSalvar = document.getElementById("salvarAlteracoesBtn");
    let currentItens = [];

    if (!eventId) {
      alert("ID do Evento não fornecido na URL.");
      window.location.href = "index.html";
    }

    function carregarDados() {
      get(refEvento)
        .then(snapshot => {
          if (!snapshot.exists()) {
            alert("Evento não encontrado.");
            window.location.href = "index.html";
            return;
          }

          const ev = snapshot.val();
          currentItens = Array.isArray(ev.itens) ? ev.itens : [];

          document.getElementById("eventoInfo").innerHTML = `
            <p><strong>Nome:</strong> ${ev.nome || "—"}</p>
            <p><strong>Data:</strong> ${ev.data || "—"}</p>
            <p><strong>Responsável:</strong> ${ev.responsavel || "—"}</p>
          `;

          itensBody.innerHTML = "";

          if (currentItens.length === 0) {
            itensBody.innerHTML = `<tr><td colspan="6">Nenhum item registrado para este evento.</td></tr>`;
          } else {
            currentItens.forEach((item, idx) => {
              const tr = document.createElement("tr");
              tr.setAttribute("data-item-index", idx);

              const nomeExib = item.nomeItem ?? item.nome ?? "—";
              const quantidadeExib = item.quantidade ?? item.qtd ?? "—";
              const assado = item.assado ?? 0;
              const congelado = item.congelado ?? 0;
              const perdido = item.perdido ?? 0;

              tr.innerHTML = `
                <td class="col-nome">${nomeExib}</td>
                <td class="col-quantidade">${quantidadeExib}</td>
                <td class="col-editavel"><input type="number" name="assado" value="${assado}" min="0"></td>
                <td class="col-editavel"><input type="number" name="congelado" value="${congelado}" min="0"></td>
                <td class="col-editavel"><input type="number" name="perdido" value="${perdido}" min="0"></td>
              `;

              // Campos ocultos apenas se valor > 0
              if (assado > 0) {
                tr.innerHTML += `<input type="hidden" name="assado_oculto" value="${assado}">`;
              }
              if (congelado > 0) {
                tr.innerHTML += `<input type="hidden" name="congelado_oculto" value="${congelado}">`;
              }
              if (perdido > 0) {
                tr.innerHTML += `<input type="hidden" name="perdido_oculto" value="${perdido}">`;
              }

              itensBody.appendChild(tr);
            });
          }

          if (ev.status === "finalizado") {
            btnFinal.textContent = "Evento Finalizado";
            btnFinal.disabled = true;
            btnSalvar.disabled = true;
            itensBody.querySelectorAll("input").forEach(i => i.disabled = true);
          }
        })
        .catch(err => {
          console.error("Erro ao buscar dados do evento:", err);
          itensBody.innerHTML = `<tr><td colspan="6">Erro ao carregar itens.</td></tr>`;
        });
    }

    function coletarItensAtualizados() {
      const novos = [];
      document.querySelectorAll("#itens-tabela tbody tr[data-item-index]").forEach(tr => {
        const idx = parseInt(tr.getAttribute("data-item-index"), 10);
        if (isNaN(idx) || !currentItens[idx]) return;
        const orig = currentItens[idx];

        const assado = parseInt(tr.querySelector('input[name="assado"]').value, 10) || 0;
        const congelado = parseInt(tr.querySelector('input[name="congelado"]').value, 10) || 0;
        const perdido = parseInt(tr.querySelector('input[name="perdido"]').value, 10) || 0;

        novos.push({ ...orig, assado, congelado, perdido });
      });
      return novos;
    }

    btnFinal.addEventListener("click", () => {
      btnFinal.disabled = true;
      btnFinal.textContent = "Processando...";

      const atualizados = coletarItensAtualizados();
      update(refEvento, { itens: atualizados, status: "finalizado" })
        .then(() => {
          alert("Evento finalizado e alterações salvas!");
          btnFinal.textContent = "Evento Finalizado";
          btnSalvar.disabled = true;
          itensBody.querySelectorAll("input").forEach(i => i.disabled = true);
        })
        .catch(err => {
          console.error("Erro ao salvar alterações:", err);
          alert("Falha ao salvar. Veja o console.");
          btnFinal.disabled = false;
          btnFinal.textContent = "Finalizar Evento e Salvar Alterações";
        });
    });

    btnSalvar.addEventListener("click", () => {
      btnSalvar.disabled = true;
      btnSalvar.textContent = "Salvando...";

      const atualizados = coletarItensAtualizados();
      update(refEvento, { itens: atualizados })
        .then(() => {
          alert("Alterações salvas com sucesso!");
        })
        .catch(err => {
          console.error("Erro ao salvar alterações:", err);
          alert("Falha ao salvar. Veja o console.");
        })
        .finally(() => {
          btnSalvar.disabled = false;
          btnSalvar.textContent = "Salvar Alterações";
        });
    });

    carregarDados();
  </script>
</body>
</html>
