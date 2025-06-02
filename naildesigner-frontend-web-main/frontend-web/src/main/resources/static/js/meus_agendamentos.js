document.addEventListener('DOMContentLoaded', function() {
    const confirmacaoCancelamentoModal = document.getElementById('confirmacaoCancelamentoModal');
    const btnCancelarModal = confirmacaoCancelamentoModal.querySelector('.btn-cancelar');
    const btnConfirmarCancelamento = confirmacaoCancelamentoModal.querySelector('#confirmarCancelamentoBtn');
    const agendamentoCards = document.querySelectorAll('.agendamento-card');

    let agendamentoIdParaCancelar = null; // Variável para armazenar o ID do agendamento a ser cancelado

    // 1. Lógica para abrir o modal de confirmação
    agendamentoCards.forEach(card => {
        const btnCancelarAgendamento = card.querySelector('.btn-cancelar-agendamento');
        if (btnCancelarAgendamento) {
            btnCancelarAgendamento.addEventListener('click', function() {
                agendamentoIdParaCancelar = this.dataset.id; // Pega o ID do agendamento do atributo data-id
                confirmacaoCancelamentoModal.classList.add('active');
            });
        }
    });

    // 2. Lógica para fechar o modal
    btnCancelarModal.addEventListener('click', function() {
        confirmacaoCancelamentoModal.classList.remove('active');
        agendamentoIdParaCancelar = null; // Limpa o ID quando o modal é fechado
    });

    confirmacaoCancelamentoModal.addEventListener('click', function(event) {
        if (event.target === confirmacaoCancelamentoModal) {
            confirmacaoCancelamentoModal.classList.remove('active');
            agendamentoIdParaCancelar = null;
        }
    });

    // 3. Lógica para confirmar o cancelamento (envio para o backend)
    btnConfirmarCancelamento.addEventListener('click', function() {
        if (agendamentoIdParaCancelar) {
            console.log('Tentando cancelar agendamento com ID:', agendamentoIdParaCancelar);

            // Simulação de requisição AJAX
            // EM PRODUÇÃO: Substitua por uma chamada real para seu backend Spring Boot
            // Ex: fetch(`/api/agendamentos/${agendamentoIdParaCancelar}/cancelar`, { method: 'POST' })
            // .then(response => response.json())
            // .then(data => {
            //     if (data.success) {
            //         alert('Agendamento cancelado com sucesso!');
            //         // Opcional: Atualizar a UI sem recarregar a página
            //         const cardToUpdate = document.querySelector(`.btn-cancelar-agendamento[data-id="${agendamentoIdParaCancelar}"]`).closest('.agendamento-card');
            //         if (cardToUpdate) {
            //             const statusSpan = cardToUpdate.querySelector('.agendamento-status');
            //             statusSpan.textContent = 'Cancelado';
            //             statusSpan.classList.remove('status-confirmado', 'status-pendente');
            //             statusSpan.classList.add('status-cancelado');
            //             cardToUpdate.querySelector('.btn-cancelar-agendamento').remove(); // Remove o botão
            //             const actionsDiv = cardToUpdate.querySelector('.card-actions');
            //             const infoCancelada = document.createElement('span');
            //             infoCancelada.classList.add('agendamento-cancelado-info');
            //             infoCancelada.textContent = 'Este agendamento foi cancelado.';
            //             actionsDiv.appendChild(infoCancelada);
            //         }
            //         location.reload(); // Recarrega a página para refletir a mudança
            //     } else {
            //         alert('Erro ao cancelar agendamento: ' + data.message);
            //     }
            // })
            // .catch(error => {
            //     console.error('Erro na requisição de cancelamento:', error);
            //     alert('Ocorreu um erro ao tentar cancelar o agendamento.');
            // });


            // --- Simulação de sucesso para fins de demonstração ---
            setTimeout(() => {
                alert('Agendamento cancelado com sucesso! (Simulação)');
                // Fechar o modal
                confirmacaoCancelamentoModal.classList.remove('active');
                agendamentoIdParaCancelar = null;

                // ATUALIZAR A INTERFACE SEM RECARREGAR A PÁGINA:
                // Encontrar o card correspondente ao agendamento cancelado
                const cardToUpdate = document.querySelector(`.btn-cancelar-agendamento[data-id="${this.dataset.id}"]`).closest('.agendamento-card');
                if (cardToUpdate) {
                    const statusSpan = cardToUpdate.querySelector('.agendamento-status');
                    statusSpan.textContent = 'Cancelado';
                    statusSpan.classList.remove('status-confirmado', 'status-pendente');
                    statusSpan.classList.add('status-cancelado');
                    cardToUpdate.querySelector('.btn-cancelar-agendamento').remove(); // Remove o botão de cancelar
                    const actionsDiv = cardToUpdate.querySelector('.card-actions');
                    const infoCancelada = document.createElement('span');
                    infoCancelada.classList.add('agendamento-cancelado-info');
                    infoCancelada.textContent = 'Este agendamento foi cancelado.';
                    actionsDiv.appendChild(infoCancelada);
                }

                // Ou, se preferir uma atualização mais completa:
                location.reload(); // Recarrega a página para refletir a mudança no backend
            }, 500); // Pequeno atraso para simular uma requisição de rede
            // --- Fim da simulação ---
        }
    });
});