// src/main/resources/static/js/agendamentos_admin.js

document.addEventListener('DOMContentLoaded', function() {
    // --- Configuração da API ---
    const API_GATEWAY_BASE_URL = 'http://localhost:8080/api'; // URL do seu API Gateway

    // --- Elementos do DOM ---
    const agendamentoForm = document.getElementById('agendamento-form');
    const agendamentoIdInput = document.getElementById('agendamento-id');
    const agendamentoClienteSelect = document.getElementById('agendamento-cliente');
    const agendamentoServicoSelect = document.getElementById('agendamento-servico');
    // NOVO CAMPO: ID da Profissional
    const agendamentoProfissionalSelect = document.getElementById('agendamento-profissional'); // Certifique-se de que o HTML tem este ID!

    const agendamentoDataInput = document.getElementById('agendamento-data');
    const agendamentoHoraInput = document.getElementById('agendamento-hora');
    const agendamentoStatusSelect = document.getElementById('agendamento-status');
    const agendamentoObservacoesTextarea = document.getElementById('agendamento-observacoes');
    const btnSalvarAgendamento = document.getElementById('btn-salvar-agendamento');
    const btnLimparForm = document.getElementById('btn-limpar-form');
    const listaAgendamentos = document.querySelector('.lista-agendamentos');

    // --- Variáveis para dados reais ---
    let clientesData = []; // Aqui serão armazenados os clientes do backend
    let servicosData = []; // Aqui serão armazenados os serviços do backend
    let profissionaisData = [ // Simulação de profissionais por enquanto, idealmente viriam de um 'profissional-service'
        { id: 1, nome: 'Jessika Xavier' }
    ];

    // --- Funções Auxiliares para Manipulação da UI ---

    // Popula os selects de cliente, serviço e profissional do backend
    async function popularSelectsDoBackend() {
        // TODO: Em um ambiente real, 'clientes' viria de um 'usuario-service'
        // Por enquanto, vamos usar uma lista estática de clientes
        // Ou você pode buscar de um microsserviço de usuários se tiver um.
        clientesData = [
            { id: 1, nome: 'João Silva' },
            { id: 2, nome: 'Maria Souza' },
            { id: 3, nome: 'Ana Costa' }
        ];

        agendamentoClienteSelect.innerHTML = '<option value="">Selecione o Cliente</option>';
        clientesData.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = cliente.nome;
            agendamentoClienteSelect.appendChild(option);
        });

        // Buscar Serviços do Servico-service
        try {
            const response = await fetch(`${API_GATEWAY_BASE_URL}/servicos`); // Rota do Gateway para servico-service
            if (!response.ok) {
                throw new Error(`Erro ao buscar serviços: ${response.statusText}`);
            }
            servicosData = await response.json();
            agendamentoServicoSelect.innerHTML = '<option value="">Selecione o Serviço</option>';
            servicosData.forEach(servico => {
                const option = document.createElement('option');
                option.value = servico.id;
                option.textContent = `${servico.nome} (R$ ${servico.preco ? servico.preco.toFixed(2) : 'N/A'})`;
                agendamentoServicoSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao popular serviços:', error);
            alert('Não foi possível carregar a lista de serviços. Verifique o console.');
        }

        // Popular Profissionais (por enquanto estático, mas idealmente viria de um microserviço)
        agendamentoProfissionalSelect.innerHTML = '<option value="">Selecione a Profissional</option>';
        profissionaisData.forEach(profissional => {
            const option = document.createElement('option');
            option.value = profissional.id;
            option.textContent = profissional.nome;
            agendamentoProfissionalSelect.appendChild(option);
        });
    }

    // Função para renderizar todos os agendamentos na lista (AGORA DO BACKEND)
    async function renderizarAgendamentos() {
        listaAgendamentos.innerHTML = ''; // Limpa a lista existente
        try {
            const response = await fetch(`${API_GATEWAY_BASE_URL}/agendamentos`); // Rota do Gateway para agendamento-service
            if (!response.ok) {
                throw new Error(`Erro ao buscar agendamentos: ${response.statusText}`);
            }
            const agendamentosReais = await response.json();

            // Ordena por data e hora de início
            agendamentosReais.sort((a, b) => new Date(a.dataHoraInicio) - new Date(b.dataHoraInicio));

            agendamentosReais.forEach(agendamento => addOrUpdateAgendamentoItem(agendamento));

        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
            alert('Não foi possível carregar a lista de agendamentos. Verifique o console.');
        }
    }

    // Função para adicionar/atualizar um item de agendamento na lista
    function addOrUpdateAgendamentoItem(agendamento) {
        let agendamentoItem = listaAgendamentos.querySelector(`.agendamento-item[data-id="${agendamento.id}"]`);

        if (!agendamentoItem) {
            agendamentoItem = document.createElement('div');
            agendamentoItem.classList.add('agendamento-item');
            listaAgendamentos.appendChild(agendamentoItem);
        }

        agendamentoItem.dataset.id = agendamento.id;

        // Buscar nomes para exibição (se não vierem no DTO)
        const cliente = clientesData.find(c => c.id === agendamento.clienteId);
        const servico = servicosData.find(s => s.id === agendamento.servicoId);
        const profissional = profissionaisData.find(p => p.id === agendamento.profissionalId); // Busca profissional

        const clienteNome = agendamento.clienteNome || (cliente ? cliente.nome : 'Desconhecido');
        const servicoNome = agendamento.servicoNome || (servico ? servico.nome : 'Desconhecido');
        const profissionalNome = profissional ? profissional.nome : 'Desconhecido'; // Nome da profissional

        // Formata a data para exibição
        const dataInicio = new Date(agendamento.dataHoraInicio);
        const dataFim = new Date(agendamento.dataHoraFim);

        const dataFormatada = dataInicio.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
        const horaInicioFormatada = dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const horaFimFormatada = dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });


        // Adiciona classe de status para estilização visual
        let statusClass = '';
        switch (agendamento.status) {
            case 'PENDENTE': statusClass = 'status-pendente'; break;
            case 'CONFIRMADO': statusClass = 'status-confirmado'; break;
            case 'CONCLUIDO': statusClass = 'status-concluido'; break;
            case 'CANCELADO': statusClass = 'status-cancelado'; break;
            default: statusClass = '';
        }

        agendamentoItem.innerHTML = `
            <div class="agendamento-info">
                <h3>${servicoNome} com ${clienteNome}</h3>
                <p><strong>Cliente:</strong> ${clienteNome}</p>
                <p><strong>Profissional:</strong> ${profissionalNome}</p>
                <p><strong>Serviço:</strong> ${servicoNome}</p>
                <p><strong>Data:</strong> ${dataFormatada} das ${horaInicioFormatada} às ${horaFimFormatada}</p>
                <p><strong>Observações:</strong> ${agendamento.observacoes || 'Nenhuma'}</p>
                <span class="agendamento-meta ${statusClass}">Status: ${agendamento.status}</span>
            </div>
            <div class="item-actions">
                <button class="btn-edit" data-id="${agendamento.id}"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" data-id="${agendamento.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
    }

    // Função para limpar o formulário e resetar para "Adicionar"
    function limparFormulario() {
        agendamentoForm.reset();
        agendamentoIdInput.value = '';
        btnSalvarAgendamento.textContent = 'Salvar Agendamento';
        btnSalvarAgendamento.innerHTML = '<i class="fas fa-save"></i> Salvar Agendamento';
        btnLimparForm.style.display = 'none';
        agendamentoClienteSelect.value = '';
        agendamentoServicoSelect.value = '';
        agendamentoProfissionalSelect.value = ''; // Resetar profissional
        agendamentoStatusSelect.value = 'PENDENTE';
    }

    // Função para preencher o formulário para edição
    async function preencherFormularioParaEdicao(agendamentoId) {
        try {
            const response = await fetch(`${API_GATEWAY_BASE_URL}/agendamentos/${agendamentoId}`);
            if (!response.ok) {
                throw new Error(`Erro ao buscar agendamento para edição: ${response.statusText}`);
            }
            const agendamento = await response.json();

            agendamentoIdInput.value = agendamento.id;
            agendamentoClienteSelect.value = agendamento.clienteId;
            agendamentoServicoSelect.value = agendamento.servicoId;
            agendamentoProfissionalSelect.value = agendamento.profissionalId; // Preenche profissional
            agendamentoDataInput.value = agendamento.dataHoraInicio.substring(0, 10); // Formato YYYY-MM-DD
            agendamentoHoraInput.value = agendamento.dataHoraInicio.substring(11, 16); // Formato HH:mm
            agendamentoStatusSelect.value = agendamento.status;
            agendamentoObservacoesTextarea.value = agendamento.observacoes || '';

            btnSalvarAgendamento.textContent = 'Atualizar Agendamento';
            btnSalvarAgendamento.innerHTML = '<i class="fas fa-save"></i> Atualizar Agendamento';
            btnLimparForm.style.display = 'inline-flex';

        } catch (error) {
            console.error('Erro ao preencher formulário para edição:', error);
            alert('Não foi possível carregar os dados do agendamento para edição. Verifique o console.');
        }
    }

    // Função para lidar com erros da API
    function handleApiError(error, defaultMessage) {
        let errorMessage = defaultMessage;
        if (error.response && error.response.json) {
            error.response.json().then(data => {
                errorMessage = data.message || defaultMessage;
                alert(`Erro: ${errorMessage}`);
            }).catch(() => {
                alert(`Erro inesperado: ${defaultMessage}`);
                console.error(error);
            });
        } else if (error.message) {
            errorMessage = error.message;
            alert(`Erro: ${errorMessage}`);
        } else {
            alert(`Erro: ${defaultMessage}`);
            console.error(error);
        }
    }


    // --- Lógica de Eventos ---

    // Inicializa os selects e renderiza os agendamentos ao carregar a página
    popularSelectsDoBackend();
    renderizarAgendamentos();

    // 1. Envio do Formulário (Salvar/Atualizar Agendamento)
    agendamentoForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const agendamento = {
            id: agendamentoIdInput.value ? parseInt(agendamentoIdInput.value) : null,
            clienteId: parseInt(agendamentoClienteSelect.value),
            profissionalId: parseInt(agendamentoProfissionalSelect.value), // Captura profissionalId
            servicoId: parseInt(agendamentoServicoSelect.value),
            dataHoraInicio: `${agendamentoDataInput.value}T${agendamentoHoraInput.value}:00`, // Formato ISO 8601
            // dataHoraFim não é enviada, será calculada no backend
            status: agendamentoStatusSelect.value,
            observacoes: agendamentoObservacoesTextarea.value.trim()
        };

        const method = agendamento.id ? 'PUT' : 'POST';
        const url = agendamento.id ? `${API_GATEWAY_BASE_URL}/agendamentos/${agendamento.id}` : `${API_GATEWAY_BASE_URL}/agendamentos`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(agendamento)
            });

            if (!response.ok) {
                // Se a resposta não for OK (ex: 400, 500), tentamos ler o JSON de erro
                const errorData = await response.json();
                const errorMessage = errorData.message || `Erro na API: ${response.status} ${response.statusText}`;
                throw new Error(errorMessage); // Lança para o catch
            }

            const data = await response.json();
            alert(`Agendamento salvo com sucesso! ID: ${data.id}`);
            renderizarAgendamentos(); // Re-renderiza para atualizar a lista
            limparFormulario();

        } catch (error) {
            console.error('Erro ao salvar agendamento:', error);
            // Mensagem de erro mais amigável, incluindo a mensagem do backend
            alert(`Erro ao salvar agendamento: ${error.message || 'Verifique o console para mais detalhes.'}`);
        }
    });

    // 2. Botão "Limpar Formulário"
    btnLimparForm.addEventListener('click', limparFormulario);

    // 3. Botões de Edição e Exclusão na Lista (delegação de eventos)
    listaAgendamentos.addEventListener('click', async function(event) {
        const target = event.target;
        const editButton = target.closest('.btn-edit');
        const deleteButton = target.closest('.btn-delete');

        if (editButton) {
            const agendamentoId = parseInt(editButton.dataset.id);
            await preencherFormularioParaEdicao(agendamentoId);

        } else if (deleteButton) {
            const agendamentoId = parseInt(deleteButton.dataset.id);
            if (confirm(`Tem certeza que deseja excluir o agendamento com ID ${agendamentoId}?`)) {
                try {
                    const response = await fetch(`${API_GATEWAY_BASE_URL}/agendamentos/${agendamentoId}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        const errorMessage = errorData.message || `Erro na API: ${response.status} ${response.statusText}`;
                        throw new Error(errorMessage);
                    }

                    alert(`Agendamento com ID ${agendamentoId} excluído com sucesso!`);
                    renderizarAgendamentos(); // Re-renderiza a lista
                    if (parseInt(agendamentoIdInput.value) === agendamentoId) {
                        limparFormulario(); // Limpa formulário se o item excluído estava sendo editado
                    }

                } catch (error) {
                    console.error('Erro ao excluir agendamento:', error);
                    alert(`Erro ao excluir agendamento: ${error.message || 'Verifique o console para mais detalhes.'}`);
                }
            }
        }
    });
});