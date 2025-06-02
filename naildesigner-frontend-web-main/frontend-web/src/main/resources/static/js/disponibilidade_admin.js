// src/main/resources/static/js/disponibilidade.js

document.addEventListener('DOMContentLoaded', function() {
    // --- Configuração da API ---
    const API_GATEWAY_BASE_URL = 'http://localhost:8080/api'; // URL do seu API Gateway

    // --- Elementos do DOM ---
    const bloqueioForm = document.getElementById('bloqueio-form');
    const dataBloqueioInput = document.getElementById('data-bloqueio');
    const horaInicioBloqueioInput = document.getElementById('hora-inicio-bloqueio');
    const horaFimBloqueioInput = document.getElementById('hora-fim-bloqueio');
    const motivoBloqueioInput = document.getElementById('motivo-bloqueio');
    const listaBloqueios = document.querySelector('.lista-bloqueios');

    // Elemento para o select de profissional
    const bloqueioProfissionalSelect = document.getElementById('bloqueio-profissional');

    // --- Variáveis para dados reais (ou simulação inicial de profissionais) ---
    // Idealmente, profissionaisData viria de um 'profissional-service' ou 'usuario-service'
    let profissionaisData = [
        { id: 1, nome: 'Jessika Xavier' }
    ];

    // --- Funções Auxiliares ---

    // Popula o select de profissionais
    function popularProfissionaisSelect() {
        bloqueioProfissionalSelect.innerHTML = '<option value="">Selecione a Profissional</option>';
        profissionaisData.forEach(profissional => {
            const option = document.createElement('option');
            option.value = profissional.id;
            option.textContent = profissional.nome;
            bloqueioProfissionalSelect.appendChild(option);
        });
    }

    // Função para renderizar todos os bloqueios na lista
    async function renderizarBloqueios() {
        listaBloqueios.innerHTML = '';
        try {
            const response = await fetch(`${API_GATEWAY_BASE_URL}/bloqueios`);
            if (!response.ok) {
                throw new Error(`Erro ao buscar bloqueios: ${response.statusText}`);
            }
            const bloqueiosReais = await response.json();

            bloqueiosReais.sort((a, b) => {
                const dataA = new Date(a.dataBloqueio + 'T' + (a.horaInicio || '00:00') + ':00');
                const dataB = new Date(b.dataBloqueio + 'T' + (b.horaInicio || '00:00') + ':00');
                return dataA - dataB;
            });

            bloqueiosReais.forEach(bloqueio => addBloqueioItem(bloqueio));

        } catch (error) {
            console.error('Erro ao carregar bloqueios:', error);
            alert('Não foi possível carregar a lista de bloqueios. Verifique o console.');
        }
    }

    // Função para adicionar um item de bloqueio à lista HTML
    function addBloqueioItem(bloqueio) {
        const newItem = document.createElement('div');
        newItem.classList.add('disponibilidade-item', 'bloqueio-item');
        newItem.dataset.id = bloqueio.id;

        const profissional = profissionaisData.find(p => p.id === bloqueio.profissionalId);
        const profissionalNome = profissional ? profissional.nome : 'Profissional Desconhecida';

        const periodo = (bloqueio.horaInicio && bloqueio.horaFim) ? `${bloqueio.horaInicio} - ${bloqueio.horaFim}` : 'Dia Inteiro';
        const motivoTexto = bloqueio.motivo ? ` - ${bloqueio.motivo}` : '';
        const [ano, mes, dia] = bloqueio.dataBloqueio.split('-');
    const dataCorreta = new Date(ano, mes - 1, dia); // mês começa em 0
const dataFormatada = dataCorreta.toLocaleDateString('pt-BR');


        newItem.innerHTML = `
            <span><strong>${dataFormatada}:</strong> ${periodo} (${profissionalNome})${motivoTexto}</span>
            <div class="item-actions">
                <button class="btn-delete" data-id="${bloqueio.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        listaBloqueios.appendChild(newItem);
    }

    // --- Lógica de Eventos ---

    // Envio do Formulário (Salvar Bloqueio)
    bloqueioForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const dataBloqueio = dataBloqueioInput.value;
        const horaInicioBloqueio = horaInicioBloqueioInput.value;
        const horaFimBloqueio = horaFimBloqueioInput.value;
        const motivoBloqueio = motivoBloqueioInput.value;
        const profissionalIdBloqueio = parseInt(bloqueioProfissionalSelect.value);

        if (!dataBloqueio || !profissionalIdBloqueio) {
            alert('Por favor, selecione a Data do Bloqueio e a Profissional.');
            return;
        }

        const bloqueioData = {
            dataBloqueio: dataBloqueio,
            horaInicio: horaInicioBloqueio || null,
            horaFim: horaFimBloqueio || null,
            motivo: motivoBloqueio || null,
            profissionalId: profissionalIdBloqueio
        };

        try {
            const response = await fetch(`${API_GATEWAY_BASE_URL}/bloqueios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bloqueioData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || `Erro na API: ${response.status} ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const novoBloqueio = await response.json();
            alert('Período bloqueado com sucesso!');
            renderizarBloqueios();
            bloqueioForm.reset();

        } catch (error) {
            console.error('Erro ao bloquear período:', error);
            alert(`Erro ao bloquear período: ${error.message || 'Verifique o console para mais detalhes.'}`);
        }
    });

    // Lógica para botões de Excluir Bloqueios
    listaBloqueios.addEventListener('click', async function(event) {
        const target = event.target;
        const deleteButton = target.closest('.btn-delete');
        const item = target.closest('.bloqueio-item');

        if (!item || !deleteButton) return;

        const bloqueioId = parseInt(deleteButton.dataset.id);

        if (confirm(`Tem certeza que deseja remover o bloqueio com ID ${bloqueioId}?`)) {
            try {
                const response = await fetch(`${API_GATEWAY_BASE_URL}/bloqueios/${bloqueioId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    const errorMessage = errorData.message || `Erro na API: ${response.status} ${response.statusText}`;
                    throw new Error(errorMessage);
                }

                alert(`Bloqueio com ID ${bloqueioId} removido com sucesso!`);
                renderizarBloqueios();

            } catch (error) {
                console.error('Erro ao remover bloqueio:', error);
                alert(`Erro ao remover bloqueio: ${error.message || 'Verifique o console para mais detalhes.'}`);
            }
        }
    });

    // --- Inicialização ---
    popularProfissionaisSelect();
    renderizarBloqueios();
});