// form.js
import { initializeApp }      from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, get, child, update } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// 1) Inicializa o Firebase (use seus dados)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "controleestoquelepan.firebaseapp.com",
  databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com",
  projectId: "controleestoquelepan",
  storageBucket: "controleestoquelepan.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// 2) Lê o parâmetro ?id= do URL
const params = new URLSearchParams(location.search);
const eventId = params.get('id');
if (!eventId) {
  alert('ID do evento não fornecido na URL.');
  throw new Error('Falta parâmetro id');
}

// 3) Carrega o evento do Firebase
const dbRef = ref(db);
get(child(dbRef, `eventos/${eventId}`))
  .then(snapshot => {
    if (!snapshot.exists()) {
      alert('Evento não encontrado.');
      return;
    }
    const ev = snapshot.val();

    // Preenche os campos
    document.getElementById('nome').value = ev.nome;
    document.getElementById('data').value = ev.data;
    document.getElementById('responsavel').value = ev.responsavel;

    // Monta a tabela de itens
    const body = document.getElementById('itens-body');
    body.innerHTML = '';  // limpa "Carregando itens..."
    const itens = ev.itens || [];
    if (itens.length === 0) {
      body.innerHTML = '<tr><td colspan="5">Nenhum item cadastrado.</td></tr>';
    } else {
      itens.forEach((item, idx) => {
        const tr = document.createElement('tr');

        // Nome
        const tdNome = document.createElement('td');
        tdNome.textContent = item.nome;
        tr.appendChild(tdNome);

        // Cria quatro checkboxes: enviado, assado, congelado, perdido
        ['enviado','assado','congelado','perdido'].forEach(prop => {
          const td = document.createElement('td');
          const chk = document.createElement('input');
          chk.type = 'checkbox';
          chk.checked = item[prop] === true;
          chk.addEventListener('change', () => {
            // Atualiza só aquele campo no Firebase
            const updates = {};
            updates[`eventos/${eventId}/itens/${idx}/${prop}`] = chk.checked;
            update(ref(db), updates);
          });
          td.appendChild(chk);
          tr.appendChild(td);
        });

        body.appendChild(tr);
      });
    }
  })
  .catch(err => {
    console.error('Erro ao carregar evento:', err);
    alert('Falha ao carregar detalhes. Veja console.');
  });

// 4) Botão Finalizar: aqui você pode adicionar lógica extra antes de salvar
document.getElementById('finalizar').addEventListener('click', () => {
  alert('Alterações salvas com sucesso!');
  // Caso queira redirecionar:
  // location.href = 'lista-eventos.html';
});
