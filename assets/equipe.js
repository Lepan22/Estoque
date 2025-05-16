async function calcularIndicadores(nomeOuApelido) {
  const eventosRef = ref(db, "eventos");
  const snapshot = await get(eventosRef);
  const eventos = snapshot.val();

  let qtd = 0, totalPDV = 0, totalDiferenca = 0, totalPerda = 0;

  if (eventos) {
    Object.values(eventos).forEach(evento => {
      const analise = evento.analise || {};
      const equipe = analise.equipe || [];

      const encontrou = Array.isArray(equipe)
        ? equipe.some(e =>
            (e.apelido && e.apelido.trim().toLowerCase() === nomeOuApelido.trim().toLowerCase()) ||
            (e.nome && e.nome.trim().toLowerCase() === nomeOuApelido.trim().toLowerCase())
          )
        : false;

      if (encontrou) {
        qtd++;
        const pdv = parseFloat(analise.vendaPDV) || 0;
        const venda = parseFloat(analise.valorVenda) || 0;
        const perda = parseFloat(analise.valorPerda) || 0;

        totalPDV += pdv;
        totalDiferenca += (pdv - venda);
        totalPerda += perda;
      }
    });
  }

  return {
    qtd,
    mediaPDV: qtd ? (totalPDV / qtd).toFixed(2) : "0.00",
    mediaDif: qtd ? (totalDiferenca / qtd).toFixed(2) : "0.00",
    mediaPerda: qtd ? (totalPerda / qtd).toFixed(2) : "0.00"
  };
}
