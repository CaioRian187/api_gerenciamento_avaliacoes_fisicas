const API_URL = "http://localhost:8080/dobrasCutaneas";
const ALUNOS_API = "http://localhost:8080/api/user";

window.onload = async () => {
    await checkAccess();
};

// =====================
// ACESSO E SEGURANÇA
// =====================
function parseJwt(token) {
    try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
}

async function checkAccess() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = "login.html"; return; }

    const payload = parseJwt(token);
    const userRole = payload.role;

    if (userRole === 'ADMIN') {
        await carregarListaAlunos();
    } else {
        aplicarRestricoesUSER(payload.id);
    }
}

function aplicarRestricoesUSER(userId) {
    const formSec = document.querySelector('.form-section');
    if (formSec) formSec.style.display = 'none';
    
    const buscaSec = document.getElementById('area-busca-aluno');
    if (buscaSec) buscaSec.style.display = 'none';

    carregarEvolucaoUsuarioLogado(userId);
}

// =====================
// CARGA DE DADOS
// =====================
async function carregarListaAlunos() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(ALUNOS_API, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const alunos = await response.json();

        const selForm = document.getElementById('aluno-id');
        const selSearch = document.getElementById('aluno-id-search');

        selForm.innerHTML = '<option value="" disabled selected>Selecione um aluno...</option>';
        selSearch.innerHTML = '<option value="">Selecione um aluno para ver a evolução...</option>';

        alunos.forEach(a => {
            const opt = `<option value="${a.id}">${a.nome}</option>`;
            selForm.innerHTML += opt;
            selSearch.innerHTML += opt;
        });
    } catch (error) {
        console.error("Erro ao carregar alunos:", error);
    }
}

// Função chamada pelo ADMIN ao mudar o select de busca ou após salvar
async function carregarEvolucao() {
    const alunoId = document.getElementById('aluno-id-search').value;
    const token = localStorage.getItem('token');
    if (!alunoId) {
        document.getElementById('tabela-container').innerHTML = "";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/aluno/${alunoId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const lista = await response.json();
        renderizarTabela(lista);
    } catch (error) {
        console.error("Erro ao carregar evolução:", error);
    }
}

async function carregarEvolucaoUsuarioLogado(userId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/aluno/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const lista = await response.json();
        renderizarTabela(lista);
    } catch (error) {
         document.getElementById('tabela-container').innerHTML = 
            `<p style='text-align:center; color:red;'>Erro ao carregar dados.</p>`;
    
        console.error("Erro:", error);
    }
}

// =====================
// CRUD (AJUSTADO PARA ADMIN)
// =====================
// ... (mantenha as funções de carregamento e acesso iguais)

document.getElementById('dobras-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const idAvaliacao = document.getElementById('dobras-id').value; // ID da avaliação (para PUT)
    const alunoId = document.getElementById('aluno-id').value; // UUID do aluno

    const dados = {
        data: document.getElementById('data').value,
        subescapular: parseFloat(document.getElementById('subescapular').value),
        suprailiaca: parseFloat(document.getElementById('suprailiaca').value),
        abdominal: parseFloat(document.getElementById('abdominal').value),
        peitoral: parseFloat(document.getElementById('peitoral').value),
        biceps: parseFloat(document.getElementById('biceps').value),
        triceps: parseFloat(document.getElementById('triceps').value),
        coxa: parseFloat(document.getElementById('coxa').value),
        panturrilhaMedial: parseFloat(document.getElementById('panturrilhaMedial').value),
        relacaoCinturaQuadril: 0.0, 
        percentualGordura: 0.0
        // Não enviamos o objeto "aluno" aqui dentro do JSON, pois ele vai na URL
    };

    let method, url;

    if (idAvaliacao) {
        // Rota para Update: /dobrasCutaneas/{id}/aluno/{id_aluno}
        method = 'PUT';
        url = `${API_URL}/${idAvaliacao}/aluno/${alunoId}`;
    } else {
        // Rota para Create: /dobrasCutaneas/aluno/{id_aluno}
        method = 'POST';
        url = `${API_URL}/aluno/${alunoId}`;
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            alert(idAvaliacao ? "Avaliação atualizada!" : "Avaliação salva com sucesso!");
            // Seta o filtro de busca para o aluno que acabamos de salvar para ver a tabela
            document.getElementById('aluno-id-search').value = alunoId;
            resetForm();
            carregarEvolucao();
        } else {
            const errorText = await response.text();
            console.error("Erro do Servidor:", errorText);
            alert("Erro ao salvar: " + response.status);
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
});

// Removi as linhas que tentavam preencher os campos RCQ e Percentual no prepararEdicao
function prepararEdicao(av) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('dobras-id').value = av.id;
    document.getElementById('aluno-id').value = av.aluno.id;
    document.getElementById('data').value = av.data;
    document.getElementById('subescapular').value = av.subescapular;
    document.getElementById('suprailiaca').value = av.suprailiaca;
    document.getElementById('abdominal').value = av.abdominal;
    document.getElementById('peitoral').value = av.peitoral;
    document.getElementById('biceps').value = av.biceps;
    document.getElementById('triceps').value = av.triceps;
    document.getElementById('coxa').value = av.coxa;
    document.getElementById('panturrilhaMedial').value = av.panturrilhaMedial;

    document.getElementById('form-title').innerText = "Editando Avaliação";
    document.getElementById('btn-save').innerText = "Atualizar Avaliação";
    document.getElementById('btn-cancel').style.display = "block";
}

async function excluir(id) {
    if (!confirm("Deseja realmente excluir esta avaliação?")) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert("Excluído com sucesso!");
            carregarEvolucao();
        }
    } catch (error) {
        console.error("Erro ao excluir:", error);
    }
}

// =====================
// INTERFACE E TABELA
// =====================

function gerarLinhaTabela(label, campo, lista) {
    return `
        <tr>
            <td class="param-column">${label}</td>
            ${lista.map((av, index) => {
                const valorAtual = av[campo];
                let diffHtml = "";

                if (index > 0) {
                    const valorAnterior = lista[index - 1][campo];
                    const diff = (valorAtual - valorAnterior).toFixed(1);
                    
                    // Lógica de Dobras: Aumento (+) é ruim (vermelho), Diminuição (-) é bom (verde)
                    const classe = diff > 0 ? "diff-pos" : (diff < 0 ? "diff-neg" : "");
                    const sinal = diff > 0 ? "+" : "";
                    
                    if (diff != 0) diffHtml = `<span class="diff-text ${classe}">${sinal}${diff}</span>`;
                }

                return `<td>${valorAtual} ${diffHtml}</td>`;
            }).join('')}
        </tr>
    `;
}


function resetForm() {
    document.getElementById('dobras-form').reset();
    document.getElementById('dobras-id').value = "";
    document.getElementById('form-title').innerText = "Nova Avaliação de Dobras";
    document.getElementById('btn-save').innerText = "Salvar Dobras";
    document.getElementById('btn-cancel').style.display = "none";
}

// =====================
// CARGA DE DADOS AJUSTADA
// =====================
async function carregarListaAlunos() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(ALUNOS_API, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Falha ao buscar alunos");
        
        const dados = await response.json();
        
        // Ajuste: Verifica se a API retornou um array direto ou um objeto paginado (comum em Spring)
        const alunos = Array.isArray(dados) ? dados : (dados.content || []);

        const selForm = document.getElementById('aluno-id');
        const selSearch = document.getElementById('aluno-id-search');

        selForm.innerHTML = '<option value="" disabled selected>Selecione um aluno...</option>';
        selSearch.innerHTML = '<option value="">Selecione um aluno para ver a evolução...</option>';
       
        console.log(alunos);
        alunos.forEach(a => {
            // Verifica se o aluno tem o campo nome ou username (ajuste conforme seu DTO)
            const nomeExibicao = a.nome || a.username || "Usuário sem nome";
            const opt = `<option value="${a.id}">${nomeExibicao}</option>`;
            selForm.innerHTML += opt;
            selSearch.innerHTML += opt;
        });
    } catch (error) {
   
        console.error("Erro ao carregar alunos:", error);
        alert("Erro ao carregar lista de alunos. Verifique a conexão com o servidor.");
    }
}

// =====================
// RENDERIZAÇÃO DA TABELA (ESTAVA FALTANDO)
// =====================
function renderizarTabela(lista) {
    const container = document.getElementById('tabela-container');
    const token = localStorage.getItem('token');
    const payload = parseJwt(token);
    const isAdmin = payload && payload.role === 'ADMIN';

    if (!lista || lista.length === 0) {
        container.innerHTML = "<p style='text-align:center; margin-top:20px; background:white; padding:20px; border-radius:12px;'>Nenhuma avaliação encontrada.</p>";
        return;
    }

    lista.sort((a, b) => new Date(a.data) - new Date(b.data));

    let html = `
        <table class="evolution-table">
            <thead>
                <tr>
                    <th class="param-column">Parâmetro</th>
                    ${lista.map(av => `
                        <th>
                            <span class="header-date">${new Date(av.data).toLocaleDateString('pt-BR')}</span>
                            ${isAdmin ? `
                                <div class="header-actions">
                                    <button class="btn-edit-header" onclick='prepararEdicao(${JSON.stringify(av)})'>Editar</button>
                                    <button class="btn-delete-header" onclick="excluir('${av.id}')">Excluir</button>
                                </div>
                            ` : ''}
                        </th>
                    `).join('')}
                </tr>
            </thead>
            <tbody>
                ${gerarLinhaTabela("Subescapular (mm)", "subescapular", lista)}
                ${gerarLinhaTabela("Suprailíaca (mm)", "suprailiaca", lista)}
                ${gerarLinhaTabela("Abdominal (mm)", "abdominal", lista)}
                ${gerarLinhaTabela("Peitoral (mm)", "peitoral", lista)}
                ${gerarLinhaTabela("Bíceps (mm)", "biceps", lista)}
                ${gerarLinhaTabela("Tríceps (mm)", "triceps", lista)}
                ${gerarLinhaTabela("Coxa (mm)", "coxa", lista)}
                ${gerarLinhaTabela("Panturrilha (mm)", "panturrilhaMedial", lista)}
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}