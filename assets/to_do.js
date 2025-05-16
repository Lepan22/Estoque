// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBN-bmzgrlzjmrKMmuClZ8LVll-vJyx-aE",
  authDomain: "controleestoquelepan.firebaseapp.com",
  databaseURL: "https://controleestoquelepan-default-rtdb.firebaseio.com",
  projectId: "controleestoquelepan",
  storageBucket: "controleestoquelepan.appspot.com",
  messagingSenderId: "779860276544",
  appId: "1:779860276544:web:f45844571a8c0bab1576a5"
};

// Inicialização do Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Variáveis globais
let eventosData = [];
let equipeData = [];
let logisticaData = [];
let modalEventoId = null;
let modalTipo = null;

// Funções de utilidade
function formatarData(dataString) {
  if (!dataString) return "—";
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
}

function formatarMoeda(valor) {
  return `R$ ${parseFloat(valor || 0).toFixed(2).replace('.', ',')}`;
}

function obterDatasSemanaAtual() {
  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  
  // Calcular o início da semana (segunda-feira)
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1));
  inicioSemana.setHours(0, 0, 0, 0);
  
  // Calcular o fim da semana (domingo)
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  fimSemana.setHours(23, 59, 59, 999);
  
  return {
    inicio: inicioSemana,
    fim: fimSemana,
    inicioFormatado: inicioSemana.toISOString().split('T')[0],
    fimFormatado: fimSemana.toISOString().split('T')[0]
  };
}

function atualizarPeriodoSemana() {
  const semana = obterDatasSemanaAtual();
  const inicioFormatado = formatarData(semana.inicioFormatado);
  const fimFormatado = formatarData(semana.fimFormatado);
  document.getElementById('semana-periodo').textContent = `${inicioFormatado} - ${fimFormatado}`;
}

// Funções de carregamento de dados
async function carregarEventosSemana() {
  try {
    const semana = obterDatasSemanaAtual();
    
    const eventosRef = db.ref('eventos');
    const snapshot = await eventosRef.once('value');
    const eventos = snapshot.val() || {};
    
    eventosData = Object.entries(eventos)
      .map(([id, evento]) => ({ id, ...evento }))
      .filter(evento => {
        if (!evento.data) return false;
        const dataEvento = new Date(evento.data);
        return dataEvento >= semana.inicio && dataEvento <= semana.fim;
      })
      .sort((a, b) => new Date(a.data) - new Date(b.data));
    
    atualizarKPIs();
    renderizarEventos();
  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
    alert('Erro ao carregar eventos. Verifique o console para mais detalhes.');
  }
}

async function carregarEquipe() {
  try {
    // Aqui você pode carregar a lista de equipe do Firebase
    // Por enquanto, vamos usar uma lista estática para exemplo
    equipeData = [
      { id: 'eq1', nome: 'João Silva', apelido: 'João', rg: '12.345.678-9' },
      { id: 'eq2', nome: 'Maria Oliveira', apelido: 'Maria', rg: '98.765.432-1' },
      { id: 'eq3', nome: 'Pedro Santos', apelido: 'Pedro', rg: '45.678.912-3' }
    ];
  } catch (error) {
    console.error('Erro ao carregar equipe:', error);
  }
}

async function carregarLogistica() {
  try {
    // Aqui você pode carregar a lista de logística do Firebase
    // Por enquanto, vamos usar uma lista estática para exemplo
    logisticaData = [
      { id: 'log1', nome: 'Transportadora Rápida', rg: '12.345.678/0001-90' },
      { id: 'log2', nome: 'Logística Express', rg: '98.765.432/0001-10' },
      { id: 'log3', nome: 'Entregas Seguras', rg: '45.678.912/0001-30' }
    ];
  } catch (error) {
    console.error('Erro ao carregar logística:', error);
  }
}

// Funções de atualização da interface
function atualizarKPIs() {
  const qtdEventos = eventosData.length;
  let valorEstimadoTotal = 0;
  
  eventosData.forEach(evento => {
    const analise = evento.analise || {};
    valorEstimadoTotal += parseFloat(analise.estimativaTotal || 0);
  });
  
  document.getElementById('kpi-qtd-eventos').textContent = qtdEventos;
  document.getElementById('kpi-valor-estimado').textContent = formatarMoeda(valorEstimadoTotal);
}

function renderizarEventos() {
  const container = document.getElementById('lista-eventos');
  container.innerHTML = '';
  
  if (eventosData.length === 0) {
    container.innerHTML = '<div class="sem-eventos">Nenhum evento encontrado para esta semana.</div>';
    return;
  }
  
  eventosData.forEach(evento => {
    const analise = evento.analise || {};
    const estimativa = parseFloat(analise.estimativaTotal || 0);
    const venda = parseFloat(analise.vendaPDV || 0);
    
    const eventoElement = document.createElement('div');
    eventoElement.className = 'evento-item';
    eventoElement.innerHTML = `
      <div class="evento-header">
        <h3>${evento.nome || 'Evento sem nome'}</h3>
        <span class="evento-data">${formatarData(evento.data)}</span>
      </div>
      <div class="evento-detalhes">
        <div class="evento-valores">
          <div>Estimado: ${formatarMoeda(estimativa)}</div>
          <div>Venda: ${formatarMoeda(venda)}</div>
        </div>
        <div class="evento-checklist">
          <div class="check-item">
            <input type="checkbox" id="pedido-${evento.id}" class="check-pedido" ${analise.pedidoCompleto ? 'checked' : ''}>
            <label for="pedido-${evento.id}">Pedido</label>
          </div>
          <div class="check-item">
            <input type="checkbox" id="equipe-${evento.id}" class="check-equipe" ${analise.equipeCompleta ? 'checked' : ''}>
            <label for="equipe-${evento.id}">Equipe</label>
            <button class="btn-adicionar" data-tipo="equipe" data-evento-id="${evento.id}">Adicionar</button>
          </div>
          <div class="check-item">
            <input type="checkbox" id="logistica-${evento.id}" class="check-logistica" ${analise.logisticaCompleta ? 'checked' : ''}>
            <label for="logistica-${evento.id}">Logística</label>
            <button class="btn-adicionar" data-tipo="logistica" data-evento-id="${evento.id}">Adicionar</button>
          </div>
          <div class="check-item">
            <input type="checkbox" id="cliente-${evento.id}" class="check-cliente" ${analise.clienteConfirmado ? 'checked' : ''}>
            <label for="cliente-${evento.id}">Cliente</label>
          </div>
        </div>
        <div class="evento-acoes">
          <button class="btn-copiar" data-tipo="equipe-logistica" data-evento-id="${evento.id}">Copiar Equipe/Logística</button>
          <button class="btn-copiar" data-tipo="cliente-endereco" data-evento-id="${evento.id}">Copiar Cliente/Endereço</button>
        </div>
      </div>
    `;
    
    container.appendChild(eventoElement);
  });
  
  // Adicionar event listeners
  adicionarEventListeners();
}

function adicionarEventListeners() {
  // Event listeners para checkboxes
  document.querySelectorAll('.check-pedido, .check-equipe, .check-logistica, .check-cliente').forEach(checkbox => {
    checkbox.addEventListener('change', handleCheckboxChange);
  });
  
  // Event listeners para botões de adicionar
  document.querySelectorAll('.btn-adicionar').forEach(button => {
    button.addEventListener('click', handleBtnAdicionar);
  });
  
  // Event listeners para botões de copiar
  document.querySelectorAll('.btn-copiar').forEach(button => {
    button.addEventListener('click', handleBtnCopiar);
  });
}

// Handlers de eventos
function handleCheckboxChange(event) {
  const checkbox = event.target;
  const [tipo, eventoId] = checkbox.id.split('-');
  const checked = checkbox.checked;
  
  let campoFirebase = '';
  switch (tipo) {
    case 'pedido':
      campoFirebase = 'pedidoCompleto';
      break;
    case 'equipe':
      campoFirebase = 'equipeCompleta';
      break;
    case 'logistica':
      campoFirebase = 'logisticaCompleta';
      break;
    case 'cliente':
      campoFirebase = 'clienteConfirmado';
      break;
  }
  
  if (campoFirebase) {
    db.ref(`eventos/${eventoId}/analise/${campoFirebase}`).set(checked)
      .catch(error => {
        console.error(`Erro ao atualizar ${tipo}:`, error);
        checkbox.checked = !checked; // Reverter em caso de erro
        alert(`Erro ao atualizar ${tipo}. Verifique o console para mais detalhes.`);
      });
  }
}

function handleBtnAdicionar(event) {
  const button = event.target;
  const tipo = button.getAttribute('data-tipo');
  const eventoId = button.getAttribute('data-evento-id');
  
  modalEventoId = eventoId;
  modalTipo = tipo;
  
  const evento = eventosData.find(e => e.id === eventoId);
  if (!evento) return;
  
  document.getElementById('modal-titulo').textContent = `Adicionar ${tipo === 'equipe' ? 'Equipe' : 'Logística'}`;
  document.getElementById('modal-evento-nome').textContent = evento.nome || 'Evento sem nome';
  
  const container = document.getElementById('modal-selecao-container');
  container.innerHTML = '';
  
  // Adicionar primeiro item de seleção
  adicionarItemSelecao(container, tipo);
  
  // Exibir modal
  document.getElementById('modal-adicionar').style.display = 'block';
}

function adicionarItemSelecao(container, tipo) {
  const item = document.createElement('div');
  item.className = 'selecao-item';
  
  const select = document.createElement('select');
  select.className = `select-${tipo}`;
  
  // Adicionar opção padrão
  const optionPadrao = document.createElement('option');
  optionPadrao.value = '';
  optionPadrao.textContent = `Selecione ${tipo === 'equipe' ? 'um membro' : 'um parceiro'}`;
  select.appendChild(optionPadrao);
  
  // Adicionar opções baseadas nos dados
  const dados = tipo === 'equipe' ? equipeData : logisticaData;
  dados.forEach(d => {
    const option = document.createElement('option');
    option.value = d.id;
    option.textContent = tipo === 'equipe' ? d.apelido : d.nome;
    select.appendChild(option);
  });
  
  item.appendChild(select);
  
  // Adicionar botão de remover (exceto para o primeiro item)
  if (container.children.length > 0) {
    const btnRemover = document.createElement('button');
    btnRemover.className = 'btn-remover-item';
    btnRemover.textContent = 'Remover';
    btnRemover.addEventListener('click', () => {
      container.removeChild(item);
    });
    item.appendChild(btnRemover);
  }
  
  container.appendChild(item);
}

function handleBtnCopiar(event) {
  const button = event.target;
  const tipo = button.getAttribute('data-tipo');
  const eventoId = button.getAttribute('data-evento-id');
  
  const evento = eventosData.find(e => e.id === eventoId);
  if (!evento) return;
  
  let textoCopiar = '';
  
  if (tipo === 'equipe-logistica') {
    // Copiar informações de equipe e logística
    const analise = evento.analise || {};
    const equipe = analise.equipe || [];
    const logistica = analise.logistica || [];
    
    let textoEquipe = '';
    equipe.forEach((e, index) => {
      if (e.nome) {
        const membro = equipeData.find(eq => eq.apelido === e.nome);
        if (membro) {
          textoEquipe += `${membro.nome}; RG: ${membro.rg}${index < equipe.length - 1 ? '\n' : ''}`;
        } else {
          textoEquipe += `${e.nome}${index < equipe.length - 1 ? '\n' : ''}`;
        }
      }
    });
    
    let textoLogistica = '';
    logistica.forEach((l, index) => {
      if (l.nome) {
        const parceiro = logisticaData.find(log => log.nome === l.nome);
        if (parceiro) {
          textoLogistica += `${parceiro.nome}; RG: ${parceiro.rg}${index < logistica.length - 1 ? '\n' : ''}`;
        } else {
          textoLogistica += `${l.nome}${index < logistica.length - 1 ? '\n' : ''}`;
        }
      }
    });
    
    textoCopiar = textoEquipe;
    if (textoEquipe && textoLogistica) textoCopiar += '\n\n';
    textoCopiar += textoLogistica;
  } else if (tipo === 'cliente-endereco') {
    // Copiar informações de cliente e endereço
    const cliente = evento.cliente || {};
    textoCopiar = `${cliente.nome || 'Cliente não informado'}\n${cliente.endereco || 'Endereço não informado'}`;
  }
  
  if (textoCopiar) {
    navigator.clipboard.writeText(textoCopiar)
      .then(() => {
        alert('Informações copiadas para a área de transferência!');
      })
      .catch(err => {
        console.error('Erro ao copiar texto:', err);
        alert('Erro ao copiar informações. Verifique o console para mais detalhes.');
      });
  } else {
    alert('Não há informações para copiar.');
  }
}

// Funções do modal
function salvarDadosModal() {
  if (!modalEventoId || !modalTipo) return;
  
  const selects = document.querySelectorAll(`.select-${modalTipo}`);
  const itens = [];
  
  selects.forEach(select => {
    const valor = select.value;
    if (valor) {
      const dados = modalTipo === 'equipe' ? equipeData : logisticaData;
      const item = dados.find(d => d.id === valor);
      if (item) {
        itens.push({
          nome: modalTipo === 'equipe' ? item.apelido : item.nome,
          valor: 0 // Valor padrão, pode ser atualizado posteriormente
        });
      }
    }
  });
  
  if (itens.length === 0) {
    alert('Selecione pelo menos um item para adicionar.');
    return;
  }
  
  // Salvar no Firebase
  db.ref(`eventos/${modalEventoId}/analise/${modalTipo}`).set(itens)
    .then(() => {
      alert(`${modalTipo === 'equipe' ? 'Equipe' : 'Logística'} adicionada com sucesso!`);
      fecharModal();
      
      // Atualizar o checkbox correspondente
      const checkbox = document.getElementById(`${modalTipo}-${modalEventoId}`);
      if (checkbox) checkbox.checked = true;
      
      // Atualizar o Firebase para marcar como completo
      const campoCompleto = modalTipo === 'equipe' ? 'equipeCompleta' : 'logisticaCompleta';
      db.ref(`eventos/${modalEventoId}/analise/${campoCompleto}`).set(true);
    })
    .catch(error => {
      console.error(`Erro ao salvar ${modalTipo}:`, error);
      alert(`Erro ao salvar ${modalTipo}. Verifique o console para mais detalhes.`);
    });
}

function fecharModal() {
  document.getElementById('modal-adicionar').style.display = 'none';
  modalEventoId = null;
  modalTipo = null;
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Atualizar período da semana
  atualizarPeriodoSemana();
  
  // Carregar dados
  Promise.all([
    carregarEventosSemana(),
    carregarEquipe(),
    carregarLogistica()
  ]);
  
  // Event listeners do modal
  document.querySelector('.fechar-modal').addEventListener('click', fecharModal);
  document.getElementById('btn-adicionar-item').addEventListener('click', () => {
    adicionarItemSelecao(document.getElementById('modal-selecao-container'), modalTipo);
  });
  document.getElementById('btn-salvar-modal').addEventListener('click', salvarDadosModal);
  document.getElementById('btn-cancelar-modal').addEventListener('click', fecharModal);
  
  // Fechar modal ao clicar fora
  window.addEventListener('click', event => {
    const modal = document.getElementById('modal-adicionar');
    if (event.target === modal) {
      fecharModal();
    }
  });
});
