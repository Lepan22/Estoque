<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Análise do Evento</title>
  <link rel="stylesheet" href="assets/style.css" />
  <style>
    body {
      font-size: 14px;
    }

    .grupo {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;
    }

    .grupo label {
      flex: 1;
      min-width: 200px;
    }

    .separador {
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 24px;
      background: #f9f9f9;
    }

    table.tabela-produtos {
      width: calc(100% - 10cm);
      margin: 0 auto 30px auto;
      border-collapse: collapse;
      font-size: 13px;
    }

    .tabela-produtos th, .tabela-produtos td {
      border: 1px solid #ccc;
      padding: 6px 10px;
      text-align: center;
    }

    .linha-flex {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .linha-flex input {
      flex: 1;
    }

    .linha-flex button {
      padding: 4px 8px;
    }

    .botao-pequeno {
      padding: 6px 12px;
      margin-top: 6px;
    }

    .titulo-secao {
      font-weight: bold;
      margin: 10px 0 6px;
      font-size: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Análise do Evento</h2>

    <!-- Informações gerais -->
    <div class="grupo">
      <label>Nome: <input type="text" id="nomeEvento" readonly /></label>
      <label>Data: <input type="text" id="dataEvento" readonly /></label>
      <label>Responsável: <input type="text" id="responsavelEvento" readonly /></label>
    </div>

    <label for="vendaPDV">Venda PDV:</label>
    <input type="number" id="vendaPDV" />

    <div class="grupo">
      <label>Total de Venda: <input type="text" id="valorVenda" readonly /></label>
      <label>Total de Perda: <input type="text" id="valorPerda" readonly /></label>
    </div>

    <!-- Equipe -->
    <div class="separador">
      <div class="titulo-secao">Equipe</div>
      <div id="equipe-container"></div>
      <button type="button" class="botao botao-pequeno" id="addEquipeBtn">➕ Adicionar Membro</button>
      <p><strong>Custo Total:</strong> <span id="custoEquipe">R$ 0,00</span></p>
    </div>

    <!-- Logística -->
    <div class="separador">
      <div class="titulo-secao">Logística</div>
      <div id="logistica-container"></div>
      <button type="button" class="botao botao-pequeno" id="addLogisticaBtn">➕ Adicionar Item</button>
      <p><strong>Custo Total:</strong> <span id="custoLogistica">R$ 0,00</span></p>
    </div>

    <!-- Produtos -->
    <div class="titulo-secao">Resumo dos Produtos</div>
    <table class="tabela-produtos" id="tabelaProdutos">
      <thead>
        <tr>
          <th>Produto</th>
          <th>Enviado</th>
          <th>Congelado</th>
          <th>Assado</th>
          <th>Perda</th>
          <th>Valor de Venda</th>
          <th>Custo de Perda</th>
        </tr>
      </thead>
      <tbody>
        <tr><td colspan="7">Carregando...</td></tr>
      </tbody>
    </table>

    <!-- Ações -->
    <div class="button-container">
      <button class="botao" id="btnSalvar">Salvar</button>
      <a href="index.html" class="botao">Voltar</a>
    </div>
  </div>

  <!-- Firebase SDK -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
  <script>
    firebase.initializeApp({
      databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com"
    });
  </script>

  <!-- Lógica principal -->
  <script src="assets/resumo.js"></script>
</body>
</html>
