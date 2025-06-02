document.addEventListener('DOMContentLoaded', function() {
    const usuarioForm = document.getElementById('usuario-form');
    const usuarioIdInput = document.getElementById('usuario-id');
    const usuarioNomeInput = document.getElementById('usuario-nome');
    const usuarioEmailInput = document.getElementById('usuario-email');
    const usuarioTelefoneInput = document.getElementById('usuario-telefone');
    const usuarioSenhaInput = document.getElementById('usuario-senha');
    const usuarioTipoSelect = document.getElementById('usuario-tipo');
    const btnSalvarUsuario = document.getElementById('btn-salvar-usuario');
    const btnLimparForm = document.getElementById('btn-limpar-form');
    const listaUsuarios = document.querySelector('.lista-usuarios');

    // --- Funções Auxiliares para Manipulação da UI ---

    // Função para adicionar/atualizar um item de usuário na lista
    function addOrUpdateUsuarioItem(usuario) {
        let usuarioItem = listaUsuarios.querySelector(`.usuario-item[data-id="${usuario.id}"]`);

        if (!usuarioItem) {
            // Se não encontrou, cria um novo item
            usuarioItem = document.createElement('div');
            usuarioItem.classList.add('usuario-item');
            listaUsuarios.appendChild(usuarioItem);
        }
        
        usuarioItem.dataset.id = usuario.id; // Garante que o data-id esteja atualizado

        // Foto de perfil: usar a foto do usuário se disponível, caso contrário, genérica
        const fotoUrl = usuario.fotoUrl || '/img/foto-perfil.png'; // Assume uma foto padrão em /img/foto-perfil.png

        usuarioItem.innerHTML = `
            <img src="${fotoUrl}" alt="Foto de Perfil">
            <div class="usuario-info">
                <h3>${usuario.nome}</h3>
                <p>Email: ${usuario.email}</p>
                <span class="usuario-meta">Telefone: ${usuario.telefone || 'N/A'} | Tipo: ${usuario.tipo}</span>
            </div>
            <div class="item-actions">
                <button class="btn-edit" data-id="${usuario.id}"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" data-id="${usuario.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
    }

    // Função para limpar o formulário e resetar para "Adicionar"
    function limparFormulario() {
        usuarioForm.reset();
        usuarioIdInput.value = ''; // Limpa o ID oculto
        usuarioSenhaInput.setAttribute('placeholder', '********'); // Reseta o placeholder da senha
        btnSalvarUsuario.textContent = 'Salvar Usuário';
        btnSalvarUsuario.innerHTML = '<i class="fas fa-save"></i> Salvar Usuário';
        btnLimparForm.style.display = 'none'; // Esconde o botão Limpar
    }

    // Função para preencher o formulário para edição
    function preencherFormularioParaEdicao(usuario) {
        usuarioIdInput.value = usuario.id;
        usuarioNomeInput.value = usuario.nome;
        usuarioEmailInput.value = usuario.email;
        usuarioTelefoneInput.value = usuario.telefone || '';
        usuarioSenhaInput.value = ''; // A senha não é preenchida, apenas alterada
        usuarioSenhaInput.setAttribute('placeholder', 'Deixe em branco para manter a senha atual'); // Altera placeholder
        usuarioTipoSelect.value = usuario.tipo;

        btnSalvarUsuario.textContent = 'Atualizar Usuário';
        btnSalvarUsuario.innerHTML = '<i class="fas fa-save"></i> Atualizar Usuário';
        btnLimparForm.style.display = 'inline-flex'; // Mostra o botão Limpar
    }

    // --- Lógica de Eventos ---

    // 1. Envio do Formulário (Salvar/Atualizar Usuário)
    usuarioForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const usuario = {
            id: usuarioIdInput.value ? parseInt(usuarioIdInput.value) : null,
            nome: usuarioNomeInput.value,
            email: usuarioEmailInput.value,
            telefone: usuarioTelefoneInput.value,
            senha: usuarioSenhaInput.value, // A senha será enviada se preenchida
            tipo: usuarioTipoSelect.value,
            fotoUrl: null // Adicionar lógica para gerenciar foto de perfil real se necessário
        };

        if (usuario.id) {
            // Lógica de ATUALIZAÇÃO (PUT/PATCH)
            console.log('Atualizando Usuário:', usuario);
            // EM PRODUÇÃO: fetch(`/api/admin/usuarios/${usuario.id}`, { method: 'PUT', body: JSON.stringify(usuario), headers: { 'Content-Type': 'application/json' } })
            // .then(response => response.json()).then(data => { if (data.success) { addOrUpdateUsuarioItem(usuario); limparFormulario(); alert('Usuário atualizado!'); } else { alert('Erro ao atualizar: ' + data.message); } });
            
            // Simulação de atualização
            setTimeout(() => {
                alert(`Usuário "${usuario.nome}" atualizado com sucesso! (Simulação)`);
                addOrUpdateUsuarioItem(usuario); // Atualiza o item na UI
                limparFormulario();
            }, 500);

        } else {
            // Lógica de CRIAÇÃO (POST)
            console.log('Criando Novo Usuário:', usuario);
            // EM PRODUÇÃO: fetch('/api/admin/usuarios', { method: 'POST', body: JSON.stringify(usuario), headers: { 'Content-Type': 'application/json' } })
            // .then(response => response.json()).then(data => { if (data.success) { usuario.id = data.newId; addOrUpdateUsuarioItem(usuario); limparFormulario(); alert('Usuário adicionado!'); } else { alert('Erro ao adicionar: ' + data.message); } });
            
            // Simulação de criação (atribui um ID temporário)
            setTimeout(() => {
                usuario.id = Math.floor(Math.random() * 1000) + 1; // ID aleatório para simulação
                alert(`Usuário "${usuario.nome}" adicionado com sucesso! (Simulação)`);
                addOrUpdateUsuarioItem(usuario); // Adiciona o novo item na UI
                limparFormulario();
            }, 500);
        }
    });

    // 2. Botão "Limpar Formulário"
    btnLimparForm.addEventListener('click', limparFormulario);

    // 3. Botões de Edição e Exclusão na Lista (delegação de eventos)
    listaUsuarios.addEventListener('click', function(event) {
        const target = event.target;
        const editButton = target.closest('.btn-edit');
        const deleteButton = target.closest('.btn-delete');

        if (editButton) {
            const usuarioId = editButton.dataset.id;
            // EM PRODUÇÃO: buscar detalhes do usuário pelo ID do backend
            // fetch(`/api/admin/usuarios/${usuarioId}`).then(response => response.json()).then(usuarioData => {
            //     preencherFormularioParaEdicao(usuarioData);
            // });

            // Simulação de busca para edição
            const usuarioParaEditar = {
                id: usuarioId,
                nome: "Usuário Editado " + usuarioId,
                email: "editado" + usuarioId + "@email.com",
                telefone: "(99) 99999-9999",
                tipo: (usuarioId % 2 === 0) ? "FUNCIONARIO" : "CLIENTE", // Exemplo de tipo
                fotoUrl: "/img/foto-perfil.png" // Imagem de exemplo para edição
            };
            preencherFormularioParaEdicao(usuarioParaEditar);
            alert(`Editando usuário com ID: ${usuarioId} (Simulação)`);

        } else if (deleteButton) {
            const usuarioId = deleteButton.dataset.id;
            if (confirm(`Tem certeza que deseja excluir o usuário com ID ${usuarioId}?`)) {
                console.log('Excluindo Usuário com ID:', usuarioId);
                // EM PRODUÇÃO: fetch(`/api/admin/usuarios/${usuarioId}`, { method: 'DELETE' })
                // .then(response => response.json()).then(data => { if (data.success) { deleteButton.closest('.usuario-item').remove(); alert('Usuário excluído!'); } else { alert('Erro ao excluir: ' + data.message); } });
                
                // Simulação de exclusão
                setTimeout(() => {
                    alert(`Usuário com ID ${usuarioId} excluído com sucesso! (Simulação)`);
                    deleteButton.closest('.usuario-item').remove(); // Remove da UI
                    // Limpar formulário se o item excluído era o que estava sendo editado
                    if (usuarioIdInput.value === usuarioId) {
                        limparFormulario();
                    }
                }, 500);
            }
        }
    });
});