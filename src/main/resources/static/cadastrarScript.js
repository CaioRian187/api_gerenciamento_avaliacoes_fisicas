const AUTH_URL = "http://localhost:8080/auth/cadastro";

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Montando o objeto para o CadastroDto (Sem o campo role, pois o Java assumirá USER)
    const data = {
        nome: document.getElementById('reg-nome').value,
        idade: parseInt(document.getElementById('reg-idade').value),
        sexo: document.getElementById('reg-sexo').value,
        login: document.getElementById('reg-login').value,
        password: document.getElementById('reg-password').value
    };

    try {
        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Cadastro realizado com sucesso! Redirecionando para o login...");
            window.location.href = "index.html"; // Redireciona para o arquivo físico
        } else {
            // Tenta pegar a mensagem de erro do servidor se houver
            const errorText = await response.text();
            alert("Erro ao cadastrar: " + (errorText || "Login já pode estar em uso."));
        }
    } catch (err) {
        console.error("Erro de conexão:", err);
        alert("Não foi possível conectar ao servidor.");
    }
});