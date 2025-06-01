// servicos_admin.js - Versão FINAL com chamadas REAIS para o API Gateway

document.addEventListener('DOMContentLoaded', function() {
    const servicoForm = document.getElementById('servico-form');
    const servicoIdInput = document.getElementById('servico-id');
    const servicoNomeInput = document.getElementById('servico-nome');
    const servicoDescricaoInput = document.getElementById('servico-descricao');
    const servicoValorInput = document.getElementById('servico-valor'); // Mapeia para 'preco' no backend
    const servicoDuracaoInput = document.getElementById('servico-duracao');
    const servicoImagemUrlInput = document.getElementById('servico-imagem-url'); // Mapeia para 'imagens' no backend
    const btnSalvarServico = document.getElementById('btn-salvar-servico');
    const btnLimparForm = document.getElementById('btn-limpar-form');
    const listaServicosDiv = document.querySelector('.lista-servicos'); // Renomeei para evitar conflito com listaServicos no escopo da função

    // URL BASE do seu API Gateway para os serviços
    // CONFIRME A PORTA DO SEU API GATEWAY (Geralmente 8080)
    const API_BASE_URL = 'http://localhost:8080/api/servicos';

    // --- Funções Auxiliares para Manipulação da UI ---

    // Função para adicionar/atualizar um item de serviço na lista
    function addOrUpdateServicoItemUI(servico) {
        let servicoItem = listaServicosDiv.querySelector(`.servico-item[data-id="${servico.id}"]`);

        if (!servicoItem) {
            servicoItem = document.createElement('div');
            servicoItem.classList.add('servico-item');
            listaServicosDiv.appendChild(servicoItem);
        }
        
        servicoItem.dataset.id = servico.id;

        const valorFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(servico.preco); // USAR servico.PRECO aqui, como no DTO

        // Pega a primeira imagem da lista 'imagens' ou usa um placeholder
        const imageUrl = (servico.imagens && servico.imagens.length > 0) ? servico.imagens[0] : '/img/placeholder-servico.jpg';

        servicoItem.innerHTML = `
            <img src="${imageUrl}" alt="${servico.nome}">
            <div class="servico-info">
                <h3>${servico.nome}</h3>
                <p>${servico.descricao}</p>
                <span class="servico-meta">Valor: ${valorFormatado} | Duração: ${servico.duracao} min</span>
            </div>
            <div class="item-actions">
                <button class="btn-edit" data-id="${servico.id}"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" data-id="${servico.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
    }

    // Função para limpar o formulário e resetar para "Adicionar"
    function limparFormulario() {
        servicoForm.reset();
        servicoIdInput.value = '';
        btnSalvarServico.textContent = 'Salvar Serviço';
        btnSalvarServico.innerHTML = '<i class="fas fa-save"></i> Salvar Serviço';
        btnLimparForm.style.display = 'none';
        // Remove focus de qualquer campo após limpar
        servicoNomeInput.focus(); 
    }

    // Função para preencher o formulário para edição
    function preencherFormularioParaEdicao(servico) {
        servicoIdInput.value = servico.id;
        servicoNomeInput.value = servico.nome;
        servicoDescricaoInput.value = servico.descricao;
        servicoValorInput.value = servico.preco; // USAR servico.PRECO
        servicoDuracaoInput.value = servico.duracao;
        // Pega a primeira imagem para preencher o input de URL
        servicoImagemUrlInput.value = (servico.imagens && servico.imagens.length > 0) ? servico.imagens[0] : '';

        btnSalvarServico.textContent = 'Atualizar Serviço';
        btnSalvarServico.innerHTML = '<i class="fas fa-save"></i> Atualizar Serviço';
        btnLimparForm.style.display = 'inline-flex';
    }

    // --- Funções de Conexão com o Backend (FETCH API) ---

    // 1. Função para carregar e exibir todos os serviços
    async function carregarServicos() {
        try {
            listaServicosDiv.innerHTML = '<p>Carregando serviços...</p>'; // Feedback visual
            const response = await fetch(API_BASE_URL); // Faz a requisição GET
            if (!response.ok) {
                throw new Error(`Erro ao carregar serviços! Status: ${response.status} ${response.statusText}`);
            }
            const servicos = await response.json(); // Converte a resposta para JSON

            listaServicosDiv.innerHTML = ''; // Limpa a lista existente

            if (servicos.length === 0) {
                listaServicosDiv.innerHTML = '<p>Nenhum serviço cadastrado.</p>';
                return;
            }

            servicos.forEach(servico => {
                addOrUpdateServicoItemUI(servico); // Usa a função auxiliar para adicionar/atualizar na UI
            });

        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            listaServicosDiv.innerHTML = '<p style="color: red;">Erro ao carregar serviços. Verifique a conexão com a API.</p>';
            alert('Erro ao carregar serviços. Verifique o console do navegador e se o API Gateway está rodando.');
        }
    }

    // 2. Função para salvar ou atualizar um serviço
    async function salvarOuAtualizarServico(event) {
        event.preventDefault();

        const id = servicoIdInput.value ? parseInt(servicoIdInput.value) : null;
        const nome = servicoNomeInput.value;
        const descricao = servicoDescricaoInput.value;
        const preco = parseFloat(servicoValorInput.value); // Campo 'preco' para o backend
        const duracao = parseInt(servicoDuracaoInput.value);
        
        // Converte a URL da imagem para uma lista, como o DTO espera
        const imagens = servicoImagemUrlInput.value ? [servicoImagemUrlInput.value] : [];

        const servicoPayload = {
            id: id, // O ID é necessário para PUT, mas será ignorado para POST pelo backend (gerado automaticamente)
            nome: nome,
            descricao: descricao,
            preco: preco,
            duracao: duracao,
            imagens: imagens
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE_URL}/${id}` : API_BASE_URL;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(servicoPayload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText })); // Tenta ler JSON de erro
                throw new Error(`Erro ao ${id ? 'atualizar' : 'salvar'} serviço: ${errorData.message || response.statusText}`);
            }

            const resultado = await response.json(); // O backend retorna o DTO do serviço salvo/atualizado
            alert(`Serviço "${resultado.nome}" ${id ? 'atualizado' : 'salvo'} com sucesso!`);
            limparFormulario();
            await carregarServicos(); // Recarrega a lista completa do backend para garantir a consistência

        } catch (error) {
            console.error(`Erro na operação de ${id ? 'atualização' : 'criação'} do serviço:`, error);
            alert(`Erro ao ${id ? 'atualizar' : 'salvar'} serviço. Verifique o console para mais detalhes e se a API está funcionando.`);
        }
    }

    // 3. Função para buscar e preencher o formulário para edição
    async function buscarParaEdicao(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`);
            if (!response.ok) {
                throw new Error(`Serviço com ID ${id} não encontrado! Status: ${response.status}`);
            }
            const servico = await response.json();
            preencherFormularioParaEdicao(servico);
        } catch (error) {
            console.error('Erro ao buscar serviço para edição:', error);
            alert('Não foi possível carregar o serviço para edição.');
        }
    }

    // 4. Função para excluir um serviço
    async function excluirServico(id) {
        if (!confirm(`Tem certeza que deseja excluir o serviço com ID ${id}?`)) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });

            // Status 204 No Content é sucesso para DELETE
            if (!response.ok && response.status !== 204) {
                throw new Error(`Erro ao excluir serviço: ${response.statusText}`);
            }

            alert(`Serviço com ID ${id} excluído com sucesso!`);
            await carregarServicos(); // Recarrega a lista para mostrar a remoção
            
            // Limpar formulário se o item excluído era o que estava sendo editado
            if (servicoIdInput.value === id) {
                limparFormulario();
            }

        } catch (error) {
            console.error('Erro ao excluir serviço:', error);
            alert('Erro ao excluir serviço. Verifique o console para mais detalhes.');
        }
    }

    // --- Lógica de Eventos e Inicialização ---

    // 1. Envio do Formulário (Salvar/Atualizar Serviço)
    servicoForm.addEventListener('submit', salvarOuAtualizarServico);

    // 2. Botão "Limpar Formulário"
    btnLimparForm.addEventListener('click', limparFormulario);

    // 3. Delegação de eventos para os botões de Edição e Exclusão na Lista
    listaServicosDiv.addEventListener('click', function(event) {
        const target = event.target;
        const editButton = target.closest('.btn-edit');
        const deleteButton = target.closest('.btn-delete');

        if (editButton) {
            const servicoId = editButton.dataset.id;
            buscarParaEdicao(servicoId); // Chama a função para buscar e preencher
        } else if (deleteButton) {
            const servicoId = deleteButton.dataset.id;
            excluirServico(servicoId);
        }
    });

    // Carrega os serviços quando a página é carregada
    carregarServicos();
});