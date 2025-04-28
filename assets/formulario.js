document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('id');

    const eventoInfo = document.getElementById('eventoInfo');
    const formPreenchimento = document.getElementById('formPreenchimento');
    const listaItens = document.getElementById('listaItens');
    const statusEvento = document.getElementById('statusEvento');

    let eventos = JSON.parse(localStorage.getItem('eventos')) || [];
    let evento = eventos.find(ev => ev.id === eventoId);

    if (!evento) {
        eventoInfo.innerHTML = '<p>Evento não encontrado!</p>';
        return;
    }

    eventoInfo.innerHTML = `
        <h2>${evento.nome}</h2>
        <p>Data: ${evento.data}</p>
    `;

    if (evento.finalizado) {
        statusEvento.innerHTML = '<h3>Evento Finalizado ✅</h3>';
        return;
    }

    formPreenchimento.style.display = 'block';

    evento.itens.forEach((item, index) => {
        const div = document.createElement('div');
        div.innerHTML = `
            <h4>${item.nome} (Enviado: ${item.quantidade})</h4>
            Congelado: <input type="number" min="0" id="congelado-${index}" value="${item.retorno.congelado || 0}"><br>
            Assado: <input type="number" min="0" id="assado-${index}" value="${item.retorno.assado || 0}"><br>
            Perdido: <input type="number" min="0" id="perdido-${index}" value="${item.retorno.perdido || 0}"><br><br>
        `;
        listaItens.appendChild(div);
    });

    formPreenchimento.addEventListener('submit', (e) => {
        e.preventDefault();

        evento.itens.forEach((item, index) => {
            item.retorno.congelado = parseInt(document.getElementById(`congelado-${index}`).value) || 0;
            item.retorno.assado = parseInt(document.getElementById(`assado-${index}`).value) || 0;
            item.retorno.perdido = parseInt(document.getElementById(`perdido-${index}`).value) || 0;
        });

        evento.finalizado = true;

        localStorage.setItem('eventos', JSON.stringify(eventos));

        alert('Evento finalizado com sucesso!');

        window.location.reload();
    });
});

