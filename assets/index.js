<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Painel do Gerente</title>
  <link rel="stylesheet" href="assets/style.css">
  <script type="module">
    import { initializeApp }     from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
    import {
      getDatabase,
      ref,
      onValue,
      get,
      push,
      set
    } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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

    const tabelaBody = document.getElementById("eventos-tbody");
    const loadingRow = document.getElementById("loading-row");

    function carregarEventos() {
      const eventosRef = ref(db, "eventos");
      onValue(eventosRef, snapshot => {
        tabelaBody.innerHTML = "";
        loadingRow.style.display = "none";

        if (!snapshot.exists()) {
          tabelaBody.innerHTML = '<tr><td colspan="5">Nenhum evento encontrado.</td></tr>';
          return;
        }

        const evs = snapshot.val();
        Object.entries(evs)
          .map(([id, ev]) => ({ id, ...ev }))
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .forEach(({ id, nome, data, responsavel, status }) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td data-label="Nome">${nome   || "–"}</td>
              <td data-label="Data">${data   || "–"}</td>
              <td data-label="Responsável">${responsavel || "–"}</td>
              <td data-label="Status">${status || "aberto"}</td>
              <td data-label="Ações">
                <a href="form.html?id=${id}" class="botao">Ver Detalhes</a>
                <a href="assets/criar-evento.html?id=${id}" class="botao editar">✏️ Editar</a>
                <a href="resumo.html?id=${id}" class="botao resumo">📊 Ver Resumo</a>
                <button class="botao duplicar" data-id="${id}">📄 Duplicar</button>
                <button class="botao exportar-evento" data-id="${id}">📤 Exportar</button> <!-- Botão Exportar adicionado por linha -->
              </td>
            `;
            tabelaBody.appendChild(tr);
          });

        document.querySelectorAll(".duplicar").forEach(botao => {
          botao.addEventListener("click", async e => {
            const id = e.target.dataset.id;
            if (!id) return;

            try {
              const snapshot = await get(ref(db, `eventos/${id}`));
              if (!snapshot.exists()) {
                alert("Evento não encontrado.");
                return;
              }

              const dados = snapshot.val();
              const novoRef = push(ref(db, "eventos"));
              await set(novoRef, {
                ...dados,
                status: "aberto",
                nome: `${dados.nome} (cópia)`
              });

              alert("Evento duplicado com sucesso!");
              carregarEventos();
            } catch (error) {
              console.error("Erro ao duplicar:", error);
              alert("Erro ao duplicar o evento.");
            }
          });
        });
      }, err => {
        console.error("Erro ao carregar eventos:", err);
        loadingRow.style.display = "none";
        tabelaBody.innerHTML = '<tr><td colspan="5">Erro ao carregar eventos.</td></tr>';
      });
    }

    document.addEventListener("DOMContentLoaded", carregarEventos);
  </script>
</head>
<body>
  <div class="container">
    <h1>Painel do Gerente</h1>
    <a href="assets/criar-evento.html" class="botao">➕ Criar Novo Evento</a>
    <a href="assets/produtos.html"     class="botao-criar">📦 Cadastro de Produto</a>
    <!-- Botão Exportar Eventos (geral) removido daqui -->

    <table id="eventos-tabela">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Data</th>
          <th>Responsável</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="eventos-tbody">
        <tr id="loading-row">
          <td colspan="5">Carregando eventos...</td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>
