const API_URL = "http://localhost:8080/api/user"; 

document.getElementById('aluno-form').addEventListener('submit', salvarAluno);

// 1. Renderizar Tabela (Adicionado o botão de Avaliações que você tinha antes)
function renderizarTabela(alunos) {
    const tbody = document.getElementById('aluno-table-body');
    tbody.innerHTML = "";

    if (!Array.isArray(alunos)) return;

    alunos.forEach(a => {
        tbody.innerHTML += `
            <tr>
                <td>${a.nome}</td>
                <td>${a.idade}</td>
                <td>${a.sexo}</td>
                <td>${a.role || 'USER'}</td>
                <td>
                    <button class="btn-edit" onclick="prepararEdicao('${a.id}', '${a.nome}', ${a.idade}, '${a.sexo}')">Editar</button>
                    <button class="btn-delete" onclick="excluirAluno('${a.id}')" style="background-color: #dc3545;">Excluir</button>
                </td>
            </tr>
        `;
    });
}

// 2. Preparar Edição: Torna o formulário VISÍVEL apenas para editar
function prepararEdicao(id, nome, idade, sexo) {
    // Exibe a seção do formulário que estava escondida
    document.querySelector('.form-section').style.display = 'block';
    
    document.getElementById('aluno-id').value = id;
    document.getElementById('nome').value = nome;
    document.getElementById('idade').value = idade;
    document.getElementById('sexo').value = sexo;

    document.getElementById('form-title').innerText = "Editando Aluno: " + nome;
    document.getElementById('btn-cancel').style.display = "inline";
    
    // Rola a página para o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 3. Salvar Aluno: Agora focado apenas em UPDATE (PUT)
async function salvarAluno(event) {
    event.preventDefault();

    const id = document.getElementById('aluno-id').value;
    const token = localStorage.getItem('token');

    if (!id) {
        alert("Erro: ID não encontrado. Use o botão Editar da tabela.");
        return;
    }

    const alunoData = {
        nome: document.getElementById('nome').value,
        idade: parseInt(document.getElementById('idade').value),
        sexo: document.getElementById('sexo').value
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(alunoData)
        });

        if (response.ok) {
            alert("Dados do aluno atualizados com sucesso!");
            resetForm();
            listarTodos(); 
        } else {
            alert("Erro ao atualizar dados.");
        }
    } catch (error) {
        alert("Erro de conexão com o servidor.");
    }
}

// 4. Resetar Formulário: Esconde-o novamente
function resetForm() {
    document.getElementById('aluno-form').reset();
    document.getElementById('aluno-id').value = "";
    document.getElementById('form-title').innerText = "Editar Aluno";
    
    // Esconde a seção novamente
    document.querySelector('.form-section').style.display = 'none';
}

// --- Funções de busca e listagem (Mantidas com correções de Token) ---

async function listarTodos() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const alunos = await response.json();
        renderizarTabela(alunos);
    } catch (error) {
        console.error(error);
    }
}

async function buscarPorNome() {
    const nome = document.getElementById('search-name').value;
    const token = localStorage.getItem('token');
    if (!nome) return listarTodos();

    try {
        const response = await fetch(`${API_URL}/nome/${nome}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Aluno não encontrado");
        const aluno = await response.json();
        renderizarTabela(Array.isArray(aluno) ? aluno : [aluno]);
    } catch (error) {
        alert(error.message);
    }
}

async function excluirAluno(id) {
    if (!confirm("Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.")) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/${id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert("Aluno removido.");
            listarTodos();
        }
    } catch (error) {
        alert("Erro ao excluir.");
    }
}

// --- Controle de Acesso Inicial ---
function checkAccess() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = "login.html"; return; }

    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Se for USER, ele não deve nem ver essa página de gestão, ou ver restrito
    if (payload.role === 'USER') {
        alert("Acesso restrito a administradores.");
        window.location.href = "telaMenu.html";
    } else {
        // Se for ADMIN, começa com o formulário escondido
        document.querySelector('.form-section').style.display = 'none';
        listarTodos();
    }
}

document.addEventListener('DOMContentLoaded', checkAccess);