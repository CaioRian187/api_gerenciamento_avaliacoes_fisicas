const API_URL = "http://localhost:8080/circunferencias";
const ALUNOS_API = "http://localhost:8080/api/user"; 

let avaliacaoEditandoId = null;

window.onload = async () => {
    await checkAccess(); 
};

async function carregarListaAlunos() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(ALUNOS_API, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Erro ao carregar alunos");
        
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

        selSearch.addEventListener('change', carregarEvolucao);

    } catch (error) {
        console.error("Erro ao popular selects:", error);
    }
}

document.getElementById('circ-form').addEventListener('submit', salvarCircunferencia);

async function salvarCircunferencia(event) {
    event.preventDefault();

    const id = document.getElementById('circ-id').value;
    const alunoId = document.getElementById('aluno-id').value;
    const token = localStorage.getItem('token');

    
    const dados = {
        data: document.getElementById('data').value,
        peso: parseFloat(document.getElementById('peso').value),
        altura: parseFloat(document.getElementById('altura').value),
        ombro: parseFloat(document.getElementById('ombro').value),
        peitoral: parseFloat(document.getElementById('peitoral').value),
        cintura: parseFloat(document.getElementById('cintura').value),
        quadril: parseFloat(document.getElementById('quadril').value),
        
        // No Java está 'abdommen' (com dois M), conforme sua model:
        abdommen: parseFloat(document.getElementById('abdommen').value), 

        // Membros Superiores (Use o nome da variável Java, SEM cedilha)
        bracoRelaxadoEsquerdo: parseFloat(document.getElementById('bracoRelaxadoEsquerdo').value),
        bracoRelaxadoDireito: parseFloat(document.getElementById('bracoRelaxadoDireito').value),
        bracoContraidoEsquerdo: parseFloat(document.getElementById('bracoContraidoEsquerdo').value),
        bracoContraidoDireito: parseFloat(document.getElementById('bracoContraidoDireito').value),
        antebraçoEsquerdo: parseFloat(document.getElementById('antebraçoEsquerdo').value), // O seu Java usa 'antebraçoEsquerdo' com cedilha na variável? Se sim, mantenha.
        antebraçoDireito: parseFloat(document.getElementById('antebraçoDireito').value),

        // Membros Inferiores
        coxaProximalEsquerda: parseFloat(document.getElementById('coxaProximalEsquerda').value),
        coxaProximalDireita: parseFloat(document.getElementById('coxaProximalDireita').value),
        coxaMedialEsquerda: parseFloat(document.getElementById('coxaMedialEsquerda').value),
        coxaMedialDireita: parseFloat(document.getElementById('coxaMedialDireita').value),
        coxaDistalEsquerda: parseFloat(document.getElementById('coxaDistalEsquerda').value),
        coxaDistalDireita: parseFloat(document.getElementById('coxaDistalDireita').value),
        panturrilhaEsquerda: parseFloat(document.getElementById('panturrilhaEsquerda').value),
        panturrilhaDireita: parseFloat(document.getElementById('panturrilhaDireita').value),
        
        aluno: { id: alunoId } 
    };

    // DICA: Se o erro persistir, mude antebraçoEsquerdo para antebracoEsquerdo (sem cedilha) 
    // tanto no Java quanto no JS. Caracteres especiais em nomes de variáveis são má prática.

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

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
            alert(id ? "Avaliação atualizada!" : "Avaliação salva!");
            resetForm();
            if(document.getElementById('aluno-id-search').value === alunoId) carregarEvolucao();
        } else {
            const errorText = await response.text();
            console.error("Resposta do Servidor:", errorText);
            alert("Erro no servidor: Verifique os logs do console.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}

// =====================
// CARREGAR EVOLUÇÃO (USADO PELO ADMIN AO MUDAR O SELECT)
// =====================
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

// ... (Função renderizarTabela permanece igual à sua)

function renderizarTabela(lista) {
    const container = document.getElementById('tabela-container');
    const token = localStorage.getItem('token');
    const payload = parseJwt(token);
    const isAdmin = payload && payload.role === 'ADMIN';

    if (!lista || lista.length === 0) {
        container.innerHTML = "<p style='text-align:center; margin-top:20px;'>Nenhuma avaliação encontrada.</p>";
        return;
    }

    lista.sort((a, b) => new Date(a.data) - new Date(b.data));

    let html = `
        <table class="evolution-table">
            <thead>
                <tr>
                    <th class="param-column">Parâmetro</th>
                    ${lista.map(av => `
                        <th class="header-content">
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
                ${gerarLinhaTabela("Peso (kg)", "peso", lista)}
                ${gerarLinhaTabela("Altura (cm)", "altura", lista)}
                ${gerarLinhaTabela("Ombro (cm)", "ombro", lista)}
                ${gerarLinhaTabela("Peitoral (cm)", "peitoral", lista)}
                ${gerarLinhaTabela("Cintura (cm)", "cintura", lista)}
                ${gerarLinhaTabela("Abdômen (cm)", "abdommen", lista)}
                ${gerarLinhaTabela("Quadril (cm)", "quadril", lista)}
                ${gerarLinhaTabela("Braço Relax. E", "bracoRelaxadoEsquerdo", lista)}
                ${gerarLinhaTabela("Braço Relax. D", "bracoRelaxadoDireito", lista)}
                ${gerarLinhaTabela("Braço Contr. E", "bracoContraidoEsquerdo", lista)}
                ${gerarLinhaTabela("Braço Contr. D", "bracoContraidoDireito", lista)}
            </tbody>
        </table>
    `;
    container.innerHTML = html;
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
            // Recarrega a tabela do aluno selecionado
            carregarEvolucao(); 
        }
    } catch (error) {
        console.error("Erro ao excluir:", error);
    }
}

// Função auxiliar para criar as linhas com comparação de evolução
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
                    const classe = diff > 0 ? "diff-pos" : (diff < 0 ? "diff-neg" : "");
                    const sinal = diff > 0 ? "+" : "";
                    if (diff != 0) diffHtml = `<span class="diff-text ${classe}">${sinal}${diff}</span>`;
                }

                return `<td>${valorAtual} ${diffHtml}</td>`;
            }).join('')}
        </tr>
    `;
}


// =====================
// CONTROLE DE ACESSO
// =====================
function parseJwt(token) {
    try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
}

async function checkAccess() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = "login.html"; return; }

    const payload = parseJwt(token);
    const userRole = payload.role;

    // Verificação para debug:
    console.log("ID extraído do Token:", payload.id);

    if (userRole === 'ADMIN') {
        await carregarListaAlunos();
        // ... lógica de URL params
    } else {
        // Agora o payload.id deve ser o número correto
        aplicarRestricoesUSER(payload.id); 
    }
}

function aplicarRestricoesUSER(userId) {
    console.log("ID recebido para busca:", userId);
    
    // Esconder elementos de Admin
    const formSec = document.querySelector('.form-section');
    if (formSec) formSec.style.display = 'none';
    
    const buscaSec = document.getElementById('area-busca-aluno');
    if (buscaSec) buscaSec.style.display = 'none';

    if (!userId) {
        console.error("ERRO: O ID do usuário é nulo ou indefinido.");
        return;
    }

    carregarEvolucaoUsuarioLogado(userId);
}

async function carregarEvolucaoUsuarioLogado(userId) {
    const token = localStorage.getItem('token');
    
    // Verificação de segurança: se o userId não existir, não faz a requisição
    if (!userId) {
        console.error("ID do usuário não encontrado no token.");
        return;
    }

    try {
        const urlFinal = `${API_URL}/aluno/${userId}`;
        console.log("Tentando buscar dados em:", urlFinal); // Verifique isso no F12

        const response = await fetch(urlFinal, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        const lista = await response.json();
        renderizarTabela(lista);
    } catch (error) {
        console.error("Detalhes do erro:", error);
        document.getElementById('tabela-container').innerHTML = 
            `<p style='text-align:center; color:red;'>Erro ao carregar dados.</p>`;
    }
}


function prepararEdicao(av) {
    // 1. Rola a página para o topo onde está o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 2. Preenche o ID oculto para que o sistema saiba que é um PUT
    document.getElementById('circ-id').value = av.id;

    // 3. Preenche os campos de seleção e data
    document.getElementById('aluno-id').value = av.aluno.id;
    document.getElementById('data').value = av.data;

    // 4. Preenche os dados numéricos (Geral e Tronco)
    document.getElementById('peso').value = av.peso;
    document.getElementById('altura').value = av.altura;
    document.getElementById('ombro').value = av.ombro;
    document.getElementById('peitoral').value = av.peitoral;
    document.getElementById('cintura').value = av.cintura;
    document.getElementById('abdommen').value = av.abdommen;
    document.getElementById('quadril').value = av.quadril;

    // 5. Membros Superiores
    document.getElementById('bracoRelaxadoEsquerdo').value = av.bracoRelaxadoEsquerdo;
    document.getElementById('bracoRelaxadoDireito').value = av.bracoRelaxadoDireito;
    document.getElementById('bracoContraidoEsquerdo').value = av.bracoContraidoEsquerdo;
    document.getElementById('bracoContraidoDireito').value = av.bracoContraidoDireito;
    document.getElementById('antebraçoEsquerdo').value = av.antebraçoEsquerdo;
    document.getElementById('antebraçoDireito').value = av.antebraçoDireito;

    // 6. Membros Inferiores
    document.getElementById('coxaProximalEsquerda').value = av.coxaProximalEsquerda;
    document.getElementById('coxaProximalDireita').value = av.coxaProximalDireita;
    document.getElementById('coxaMedialEsquerda').value = av.coxaMedialEsquerda;
    document.getElementById('coxaMedialDireita').value = av.coxaMedialDireita;
    document.getElementById('coxaDistalEsquerda').value = av.coxaDistalEsquerda;
    document.getElementById('coxaDistalDireita').value = av.coxaDistalDireita;
    document.getElementById('panturrilhaEsquerda').value = av.panturrilhaEsquerda;
    document.getElementById('panturrilhaDireita').value = av.panturrilhaDireita;

    // 7. Ajusta a interface (Título e botões)
    document.getElementById('form-title').innerText = "Editando Avaliação";
    document.getElementById('btn-save').innerText = "Atualizar Avaliação";
    document.getElementById('btn-cancel').style.display = "block";
}
function resetForm() {
    // Limpa o formulário
    document.getElementById('circ-form').reset();
    
    // Limpa o ID oculto
    document.getElementById('circ-id').value = "";

    // Restaura a interface original
    document.getElementById('form-title').innerText = "Nova Avaliação";
    document.getElementById('btn-save').innerText = "Salvar Avaliação";
    document.getElementById('btn-cancel').style.display = "none";
}