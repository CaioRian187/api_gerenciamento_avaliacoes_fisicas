// URL da sua API de autenticação
const LOGIN_URL = "http://localhost:8080/auth/login";

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Coleta os dados dos campos de input
    // Certifique-se de que os IDs 'login' e 'password' existem no seu HTML
    const loginInput = document.getElementById('login').value;
    const passwordInput = document.getElementById('password').value;

    const data = {
        login: loginInput,
        password: passwordInput
    };

    try {
        // 2. Envia a requisição para o Controller Java
        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            // 3. Extrai o token do LoginResponseDto enviado pelo Java
            const result = await response.json();
            
            // 4. Salva o token no navegador para usar em requisições futuras
            localStorage.setItem('token', result.token);
            
            alert("Login realizado com sucesso!");

            // 5. REDIRECIONAMENTO FÍSICO: 
            // Como você usa arquivos estáticos, redirecione para o nome do seu arquivo HTML
            window.location.href = "telaMenu.html"; 
            
        } else {
            // Caso o Java retorne 403 ou 401 (senha errada ou usuário não existe)
            alert("Usuário ou senha incorretos. Tente novamente.");
        }
    } catch (err) {
        console.error("Erro na conexão:", err);
        alert("Não foi possível conectar ao servidor. Verifique se a aplicação Java está rodando.");
    }
});