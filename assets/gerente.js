document.addEventListener('DOMContentLoaded', () => {
    const formNovoEvento = document.getElementById('formNovoEvento');
    const listaEventos = document.getElementById('listaEventos');

    let eventos = JSON.parse(localStorage.getItem('eventos')) || [];

    function salvarEventos() {
        localStorage.setItem('eventos', JSON.stringify(eventos));
    }

    function gerarIdUnico() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    function atualizarListaEventos() {
        listaEventos.innerHTML = '';
        eventos.forEach((evento, index) => {
            const div = document.createElement('div');
            div.innerHTML = `
                <h3>${evento.nome} (${evento.data})</h3>
                <p>Status: <strong>${evento.finalizado ? "Finalizado ✅" : "Aberto 🟢"}</strong></p>
                <a href="form.html?id=${evento.id}" target="_blank">Link para preenchimento</a><br><br>
                <button onclick="duplicarEvento(${index})">Duplicar</button>
                <button onclick="reabrirEvento(${index})" ${evento.finalizado ? '' : 'disabled'}>Reabrir</button>
            `;
            listaEventos.appendChild(div);
        });
    }

    formNovoEvento.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nomeEvento').value;
        const data = document.getElementById('dataEvento').value;
        const itensTexto = document.getElementById('itensEvento').value.trim();
        const itens = itensTexto.split('\n').map(linha => {
            const partes = linha.split('-');
            return {
                nome: partes[0].trim(),
                quantidade: parseInt(partes[1].trim()),
                retorno: { congelado: 0, assado: 0, perdido: 0 }
            };
        });

        const novoEvento = {
            id: gerarIdUnico(),
            nome,
            data,
            itens,
            finalizado: false
        };
        eventos.push(novoEvento);
        salvarEventos();
        atualizarListaEventos();
        formNovoEvento.reset();
    });

    window.duplicarEvento = function(index) {
        const eventoOriginal = eventos[index];
        const novoEvento = JSON.parse(JSON.stringify(eventoOriginal));
        novoEvento.id = gerarIdUnico();
        novoEvento.nome += ' (Cópia)';
        novoEvento.finalizado = false;
        eventos.push(novoEvento);
        salvarEventos();
        atualizarListaEventos();
    };

    window.reabrirEvento = function(index) {
        eventos[index].finalizado = false;
        eventos[index].itens.forEach(item => {
            item.retorno = { congelado: 0, assado: 0, perdido: 0 };
        });
        salvarEventos();
        atualizarListaEventos();
    };

    atualizarListaEventos();
});
