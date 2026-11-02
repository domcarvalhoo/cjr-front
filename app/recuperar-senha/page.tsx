"use client";

import { useState } from "react";

import { api } from "../../lib/api";
import { mensagemDeErro } from "../../lib/erro";
import TelaAuth from "../componentes/tela-auth";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await api.post("/auth/esqueci-senha", { email });
      setSucesso(resposta.data.mensagem);
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível enviar o e-mail. Tente novamente."));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <TelaAuth titulo="RECUPERAR SENHA">
      {sucesso ? (
        <p className="form-sucesso" role="status">
          {sucesso}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            name="email"
            placeholder="Digite seu e-mail"
            aria-label="Email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          {erro && (
            <p className="form-erro" role="alert">
              {erro}
            </p>
          )}

          <button type="submit" className="login-button" disabled={carregando}>
            {carregando ? "ENVIANDO..." : "ENVIAR LINK"}
          </button>
        </form>
      )}

      <p className="register-text">
        Lembrou a senha? <a href="/inicial">Voltar ao login</a>
      </p>
    </TelaAuth>
  );
}
