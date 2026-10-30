"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "../../lib/api";
import { mensagemDeErro } from "../../lib/erro";
import { salvarToken } from "../../lib/sessao";
import CampoSenha from "../componentes/campo-senha";
import TelaAuth from "../componentes/tela-auth";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await api.post("/auth/login", { email, senha });
      salvarToken(resposta.data.token);
      router.push("/painel");
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível entrar. Tente novamente."));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <TelaAuth titulo="BEM VINDO DE VOLTA!">
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          aria-label="Email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <CampoSenha
          name="senha"
          placeholder="Senha"
          value={senha}
          onChange={setSenha}
          autoComplete="current-password"
        />

        <a href="/recuperar-senha" className="forgot-password">
          Esqueceu sua senha?
        </a>

        {erro && (
          <p className="form-erro" role="alert">
            {erro}
          </p>
        )}

        <button type="submit" className="login-button" disabled={carregando}>
          {carregando ? "ENTRANDO..." : "ENTRAR"}
        </button>
      </form>

      <p className="register-text">
        Não possui uma conta? <a href="/cadastro">Cadastre-se</a>
      </p>
    </TelaAuth>
  );
}
