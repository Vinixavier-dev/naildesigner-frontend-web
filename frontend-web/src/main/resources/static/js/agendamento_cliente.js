// src/main/resources/static/js/agendamento_cliente.js

document.addEventListener('DOMContentLoaded', function() {
    // --- Configuração da API ---
    const API_GATEWAY_BASE_URL = 'http://localhost:8080/api';

    // --- Elementos do DOM ---
    const agendamentoClienteForm = document.getElementById('agendamento-cliente-form');
    const clienteIdInput = document.getElementById('cliente-id');
    const formServicoSelect = document.getElementById('form-servico');
    const formProfissionalSelect = document.getElementById('form-profissional');
    const formDataInput = document.getElementById('form-data');
    const horariosDisponiveisLista = document.getElementById('horarios-disponiveis-lista');
    const formHoraSelecionadaInput = document.getElementById('form-hora-selecionada');
    const btnAgendar = document.getElementById('btn-agendar');

    // --- Variáveis para dados reais ---
    let servicosData = [];
    let profissionaisData = [
        { id: 1, nome: 'Ana Paula (Designer A)' },
        { id: 2, nome: 'Bruna Silva (Designer B)' },
        { id: 3, nome: 'Carla Dias (Designer C)' }
    ];

    // --- Funções para Popular Selects ---
    async function popularServicos() {
        try {
            const response = await fetch(`${API_GATEWAY_BASE_URL}/servicos`);
            if (!response.ok) {
                throw new Error(`Erro ao buscar serviços: ${response.statusText}`);
            }
            servicosData = await response.json();
            formServicoSelect.innerHTML = '<option value="">Selecione um serviço</option>';
            servicosData.forEach(servico => {
                const option = document.createElement('option');
                option.value = servico.id;
                option.textContent = `${servico.nome} (R$ ${servico.preco ? servico.preco.toFixed(2) : 'N/A'})`;
                formServicoSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao popular serviços:', error);
            alert('Não foi possível carregar a lista de serviços. Verifique o console.');
        }
    }

    function popularProfissionais() {
        formProfissionalSelect.innerHTML = '<option value="">Selecione a Profissional</option>';
        profissionaisData.forEach(profissional => {
            const option = document.createElement('option');
            option.value = profissional.id;
            option.textContent = profissional.nome;
            formProfissionalSelect.appendChild(option);
        });
    }

    // --- Lógica de Disponibilidade ---
    async function buscarEExibirHorariosDisponiveis() {
        const servicoId = formServicoSelect.value;
        const profissionalId = formProfissionalSelect.value;
        const data = formDataInput.value;

        horariosDisponiveisLista.innerHTML = '<p>Carregando horários...</p>';
        formHoraSelecionadaInput.value = ''; // Limpa a hora selecionada ao buscar novos horários
        btnAgendar.disabled = true; // Desabilita o botão agendar

        if (!servicoId || !profissionalId || !data) {
            horariosDisponiveisLista.innerHTML = '<p>Selecione um serviço, profissional e data para ver os horários.</p>';
            return;
        }

        try {
            const response = await fetch(`${API_GATEWAY_BASE_URL}/agendamentos/disponibilidade?data=${data}&servicoId=${servicoId}&profissionalId=${profissionalId}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Tenta ler JSON, se falhar, usa objeto vazio
                const errorMessage = errorData.message || `Erro na API: ${response.status} ${response.statusText}`;
                throw new Error(errorMessage);
            }
            const disponibilidade = await response.json();

            if (disponibilidade.horariosDisponiveis.length === 0) {
                horariosDisponiveisLista.innerHTML = '<p>Nenhum horário disponível para esta data, serviço e profissional.</p>';
            } else {
                horariosDisponiveisLista.innerHTML = ''; // Limpa a mensagem de carregamento
                disponibilidade.horariosDisponiveis.forEach((hora, index) => { // Adicionado index para o ID
                    const radioId = `hora-${hora.replace(':', '-')}`; // ID único para o radio button
                    const radioWrapper = document.createElement('div'); // Para envolver o radio e label, se precisar de CSS
                    radioWrapper.classList.add('radio-item'); // Classe para estilização

                    radioWrapper.innerHTML = `
                        <input type="radio" id="${radioId}" name="horario-selecionado" value="${hora}" class="radio-horario">
                        <label for="${radioId}">${hora}</label>
                    `;
                    horariosDisponiveisLista.appendChild(radioWrapper);
                });

                // Adiciona listener aos radio buttons DENTRO DO CONTAINER
                horariosDisponiveisLista.addEventListener('change', function(event) {
                    if (event.target.classList.contains('radio-horario')) {
                        formHoraSelecionadaInput.value = event.target.value; // Salva a hora selecionada
                        btnAgendar.disabled = false; // Habilita o botão agendar
                    }
                });
            }

        } catch (error) {
            console.error('Erro ao buscar horários disponíveis:', error);
            alert(`Não foi possível carregar os horários disponíveis: ${error.message || 'Verifique o console.'}`);
            horariosDisponiveisLista.innerHTML = '<p>Erro ao carregar horários. Tente novamente.</p>';
        }
    }

    // --- Lógica de Eventos ---
    formServicoSelect.addEventListener('change', buscarEExibirHorariosDisponiveis);
    formProfissionalSelect.addEventListener('change', buscarEExibirHorariosDisponiveis);
    formDataInput.addEventListener('change', buscarEExibirHorariosDisponiveis);

    // Envio do Formulário (Salvar Agendamento)
    agendamentoClienteForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const clienteId = parseInt(clienteIdInput.value);
        const servicoId = parseInt(formServicoSelect.value);
        const profissionalId = parseInt(formProfissionalSelect.value);
        const dataSelecionada = formDataInput.value;
        const horaSelecionada = formHoraSelecionadaInput.value; // Pega a hora do input hidden

        if (!servicoId || !profissionalId || !dataSelecionada || !horaSelecionada) {
            alert('Por favor, preencha todos os campos e selecione um horário disponível.');
            return;
        }

        const dataHoraInicio = `${dataSelecionada}T${horaSelecionada}:00`;

        const agendamento = {
            clienteId: clienteId,
            profissionalId: profissionalId,
            servicoId: servicoId,
            dataHoraInicio: dataHoraInicio,
            status: "PENDENTE",
            observacoes: ""
        };

        try {
            const response = await fetch(`${API_GATEWAY_BASE_URL}/agendamentos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(agendamento)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `Erro na API: ${response.status} ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            alert(`Agendamento realizado com sucesso! ID: ${data.id}. Você pode ver em "Meus Agendamentos".`);
            agendamentoClienteForm.reset();
            horariosDisponiveisLista.innerHTML = '<p>Selecione um serviço, profissional e data para ver os horários.</p>';
            btnAgendar.disabled = true;
        } catch (error) {
            console.error('Erro ao agendar:', error);
            alert(`Erro ao agendar: ${error.message || 'Verifique o console para mais detalhes.'}`);
        }
    });

    // --- Inicialização ---
    popularServicos();
    popularProfissionais();
    btnAgendar.disabled = true;
});