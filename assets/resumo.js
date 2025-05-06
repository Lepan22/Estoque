import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase, ref, get, child, update
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// --- FIREBASE CONFIG (Mesma configuração do criar-evento.html) ---
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
const db = getDatabase(app);

// --- ELEMENTOS HTML ---
const eventoInfoDiv = document.getElementById("eventoInfoResumo");
const resumoContainer = document.getElementById("resumo-container");
const vendaPDVInput = document.getElementById("vendaPDV");
const recebidoMaquininhaInput = document.getElementById("recebidoMaquininha");
const recebidoPIXInput = document.getElementById("recebidoPIX");
const vendaCalculadaSpan = document.getElementById("vendaCalculada");
const perdaCalculadaSpan = document.getElementById("perdaCalculada");
const farolStatusSpan = document.getElementById("farolStatus");
const salvarResumoBtn = document.getElementById("salvarResumoBtn");

// --- PARÂMETROS DA URL ---
const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

// --- ESTADO E DADOS ---
let eventoData = null;
let produtosData = {}; // Armazenar dados dos produtos (custo, precoVenda)

// --- FUNÇÕES ---

// Função para buscar dados do evento e produtos
async function carregarDados() {
    if (!eventId) {
        eventoInfoDiv.innerHTML = "<p>ID do evento não fornecido.</p>";
        resumoContainer.innerHTML = "";
        return;
    }

    try {
        const eventoRef = ref(db, `eventos/${eventId}`);
        const produtosRef = ref(db, "produtos");

        const [eventoSnapshot, produtosSnapshot] = await Promise.all([
            get(eventoRef),
            get(produtosRef)
        ]);

        if (!eventoSnapshot.exists()) {
            eventoInfoDiv.innerHTML = "<p>Evento não encontrado.</p>";
            resumoContainer.innerHTML = "";
            return;
        }

        eventoData = eventoSnapshot.val();
        // Mapeia produtos por nome para fácil acesso
        const prods = produtosSnapshot.val() || {};
        Object.values(prods).forEach(p => {
            produtosData[p.nome] = { custo: p.custo || 0, precoVenda: p.precoVenda || 0 };
        });

        // Preenche informações básicas do evento
        eventoInfoDiv.innerHTML = `
            <p><strong>Nome do Evento:</strong> ${eventoData.nome}</p>
            <p><strong>Data:</strong> ${eventoData.data}</p>
            <p><strong>Responsável:</strong> ${eventoData.responsavel}</p>
            <p><strong>Equipe:</strong> ${formatarDetalhes(eventoData.equipe)}</p>
            <p><strong>Logística:</strong> ${formatarDetalhes(eventoData.logistica)}</p>
        `;

        // Preenche valores financeiros já salvos, se existirem
        vendaPDVInput.value = eventoData.resumoFinanceiro?.vendaPDV || "";
        recebidoMaquininhaInput.value = eventoData.resumoFinanceiro?.recebidoMaquininha || "";
        recebidoPIXInput.value = eventoData.resumoFinanceiro?.recebidoPIX || "";

        // Renderiza itens
        renderizarItens();
        // Calcula o resumo inicial se já houver dados
        calcularResumo();

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        eventoInfoDiv.innerHTML = "<p>Erro ao carregar dados do evento.</p>";
        resumoContainer.innerHTML = "";
    }
}

// Função para formatar detalhes (Equipe/Logística)
function formatarDetalhes(detalhes) {
    if (!detalhes || detalhes.length === 0) return "N/A";
    return detalhes.map(d => `${d.nome}: ${d.valor}`).join(", ");
}

// Função para renderizar os itens do evento com campos de entrada
function renderizarItens() {
    resumoContainer.innerHTML = ""; // Limpa o container
    if (!eventoData || !eventoData.itens || eventoData.itens.length === 0) {
        resumoContainer.innerHTML = "<p>Nenhum item neste evento.</p>";
        return;
    }

    eventoData.itens.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "resumo-item";
        itemDiv.dataset.itemName = item.nomeItem; // Guarda o nome do item

        // Recupera quantidades salvas, se existirem
        const resumoItemSalvo = eventoData.resumoFinanceiro?.itens?.[item.nomeItem] || {};

        itemDiv.innerHTML = `
            <div><strong>Item:</strong> ${item.nomeItem}</div>
            <div><strong>Enviado:</strong> ${item.quantidade}</div>
            <label>Congelado:
                <input type="number" name="congelado" min="0" max="${item.quantidade}" value="${resumoItemSalvo.congelado || 0}" data-index="${index}">
            </label>
            <label>Assado:
                <input type="number" name="assado" min="0" max="${item.quantidade}" value="${resumoItemSalvo.assado || 0}" data-index="${index}">
            </label>
            <label>Perdido:
                <input type="number" name="perdido" min="0" max="${item.quantidade}" value="${resumoItemSalvo.perdido || 0}" data-index="${index}">
            </label>
            <div><strong>Vendido (Calculado):</strong> <span class="item-vendido">--</span></div>
        `;
        resumoContainer.appendChild(itemDiv);
    });

    // Adiciona listeners aos inputs de quantidade após renderizar
    resumoContainer.querySelectorAll("input[type='number']").forEach(input => {
        input.addEventListener("change", calcularResumo);
        input.addEventListener("input", calcularResumo); // Recalcula enquanto digita
    });
}

// Função para calcular Venda, Perda e Farol
function calcularResumo() {
    if (!eventoData || !eventoData.itens) return;

    let vendaTotalCalculada = 0;
    let perdaTotalCalculada = 0;

    resumoContainer.querySelectorAll(".resumo-item").forEach(itemDiv => {
        const nomeItem = itemDiv.dataset.itemName;
        const itemOriginal = eventoData.itens.find(i => i.nomeItem === nomeItem);
        const produtoInfo = produtosData[nomeItem] || { custo: 0, precoVenda: 0 };

        if (!itemOriginal) return;

        const enviado = itemOriginal.quantidade;
        const congeladoInput = itemDiv.querySelector("input[name='congelado']");
        const assadoInput = itemDiv.querySelector("input[name='assado']");
        const perdidoInput = itemDiv.querySelector("input[name='perdido']");

        const congelado = parseInt(congeladoInput.value) || 0;
        const assado = parseInt(assadoInput.value) || 0;
        const perdido = parseInt(perdidoInput.value) || 0;

        // Validação simples para não exceder o enviado
        const totalRetornoPerda = congelado + assado + perdido;
        if (totalRetornoPerda > enviado) {
           // Poderia adicionar uma mensagem de erro, mas por ora apenas limita
           // Ajusta proporcionalmente ou zera o último modificado? Simplesmente não calcula?
           // Por simplicidade, vamos apenas sinalizar e não calcular venda negativa.
           console.warn(`Item ${nomeItem}: Quantidade de retorno/perda (${totalRetornoPerda}) excede a enviada (${enviado}).`);
           // Poderia resetar o último campo alterado ou mostrar erro.
        }

        const vendido = Math.max(0, enviado - totalRetornoPerda);
        itemDiv.querySelector(".item-vendido").textContent = vendido;

        vendaTotalCalculada += vendido * (produtoInfo.precoVenda || 0);
        perdaTotalCalculada += perdido * (produtoInfo.custo || 0);
    });

    vendaCalculadaSpan.textContent = `R$ ${vendaTotalCalculada.toFixed(2)}`;
    perdaCalculadaSpan.textContent = `R$ ${perdaTotalCalculada.toFixed(2)}`;

    // Calcula Farol
    const vendaPDV = parseFloat(vendaPDVInput.value) || 0;
    const recebidoMaquininha = parseFloat(recebidoMaquininhaInput.value) || 0;
    const recebidoPIX = parseFloat(recebidoPIXInput.value) || 0;
    const recebidoTotal = recebidoMaquininha + recebidoPIX;

    let status = [];
    // Tolerância para comparação de float
    const tolerancia = 0.01;

    if (Math.abs(vendaTotalCalculada - vendaPDV) <= tolerancia) {
        status.push("Venda OK");
    } else {
        status.push("VERIFICAR VENDA (Calculada != PDV)");
    }

    if (recebidoTotal > vendaPDV + tolerancia) {
        status.push("VERIFICAR RECEBIMENTO (Recebido > PDV)");
    } else if (recebidoTotal < vendaPDV - tolerancia) {
        status.push("VERIFICAR RECEBIMENTO (Recebido < PDV)");
    } else {
        status.push("Recebimento OK");
    }

    const percentualPerda = vendaTotalCalculada > 0 ? (perdaTotalCalculada / vendaTotalCalculada) * 100 : 0;
    if (percentualPerda > 5) {
        status.push(`VERIFICAR PERDA (${percentualPerda.toFixed(1)}% > 5%)`);
    } else {
        status.push("Perda OK");
    }

    farolStatusSpan.textContent = status.join("; ");
    // Adicionar classes CSS para cores do farol se desejado
    // Ex: farolStatusSpan.className = "farol-ok" ou "farol-verificar"
}

// Função para salvar o resumo financeiro no Firebase
async function salvarResumo() {
    if (!eventId || !eventoData) return;

    const resumoFinanceiro = {
        vendaPDV: parseFloat(vendaPDVInput.value) || 0,
        recebidoMaquininha: parseFloat(recebidoMaquininhaInput.value) || 0,
        recebidoPIX: parseFloat(recebidoPIXInput.value) || 0,
        vendaCalculada: parseFloat(vendaCalculadaSpan.textContent.replace("R$ ", "")) || 0,
        perdaCalculada: parseFloat(perdaCalculadaSpan.textContent.replace("R$ ", "")) || 0,
        statusFarol: farolStatusSpan.textContent,
        itens: {}
    };

    resumoContainer.querySelectorAll(".resumo-item").forEach(itemDiv => {
        const nomeItem = itemDiv.dataset.itemName;
        resumoFinanceiro.itens[nomeItem] = {
            congelado: parseInt(itemDiv.querySelector("input[name='congelado']").value) || 0,
            assado: parseInt(itemDiv.querySelector("input[name='assado']").value) || 0,
            perdido: parseInt(itemDiv.querySelector("input[name='perdido']").value) || 0,
            vendido: parseInt(itemDiv.querySelector(".item-vendido").textContent) || 0
        };
    });

    try {
        const eventoRef = ref(db, `eventos/${eventId}/resumoFinanceiro`);
        await update(eventoRef, resumoFinanceiro);
        alert("Resumo financeiro salvo com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar resumo financeiro:", error);
        alert("Falha ao salvar o resumo financeiro.");
    }
}

// --- INICIALIZAÇÃO ---

// Adiciona listeners aos inputs financeiros
vendaPDVInput.addEventListener("change", calcularResumo);
vendaPDVInput.addEventListener("input", calcularResumo);
recebidoMaquininhaInput.addEventListener("change", calcularResumo);
recebidoMaquininhaInput.addEventListener("input", calcularResumo);
recebidoPIXInput.addEventListener("change", calcularResumo);
recebidoPIXInput.addEventListener("input", calcularResumo);

// Adiciona listener ao botão salvar
salvarResumoBtn.addEventListener("click", salvarResumo);

// Carrega os dados iniciais
carregarDados();

