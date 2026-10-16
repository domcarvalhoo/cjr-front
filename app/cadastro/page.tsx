"use client";
import { useState } from "react";

export default function Cadastro() {
    const [nome, setNome] = useState("");
    const [nomeUsuario, setNomeUsuario] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    return (
        <main>
            <h1>Cadastro</h1>
            <form>
                <label htmlFor="nome">Nome</label>
                <input 
                    type="text" 
                    id="nome" 
                    className="border"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)} 
                    />
                <label htmlFor="nomeUsuario">Nome de Usuário</label>
                <input 
                    type="text" 
                    id="nomeUsuario" 
                    className="border"
                    value={nomeUsuario}
                    onChange={(e) => setNomeUsuario(e.target.value)} 
                />
                <label htmlFor="email">Email</label>
                <input 
                    type="email" 
                    id="email" 
                    className="border"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <label htmlFor="senha">Senha</label>
                <input 
                    type="password" 
                    id="senha" 
                    className="border"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)} 
                />
                <button type="submit">Cadastrar</button>
            </form>
        </main>
    );
}