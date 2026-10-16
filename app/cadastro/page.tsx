export default function Cadastro() {
    return (
        <main>
            <h1>Cadastro</h1>
            <form>
                <label htmlFor="nome">Nome</label>
                <input type="text" id="nome" />
                <label htmlFor="nomeUsuario">Nome de Usuário</label>
                <input type="text" id="nomeUsuario" />
                <label htmlFor="email">Email</label>
                <input type="email" id="email" />
                <label htmlFor="senha">Senha</label>
                <input type="password" id="senha" />
                <button type="submit">Cadastrar</button>
            </form>
        </main>
    );
}