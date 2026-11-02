"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { api } from "../../lib/api";
import { mensagemDeErro } from "../../lib/erro";
import CampoSenha from "../componentes/campo-senha";
import TelaAuth from "../componentes/tela-auth";

function FormularioRedefinir() {
  // o token vem no link enviado por e-mail: /redefinir-senha?token=...
  const token = useSearchParams().get("token");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      const resposta = await api.post("/auth/redefinir-senha", { token, senha });
      setSucesso(resposta.data.mensagem);
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível alterar a senha. Tente novamente."));
    } finally {
      setCarregando(false);
    }
  }

  if (!token) {
    return (
      <>
        <p className="form-erro" role="alert">
          Link inválido. Solicite uma nova recuperação de senha.
        </p>
        <p className="register-text">
          <a href="/recuperar-senha">Recuperar senha</a>
        </p>
      </>
    );
  }

  if (sucesso) {
    return (
      <>
        <p className="form-sucesso" role="status">
          {sucesso}
        </p>
        <p className="register-text">
          <a href="/inicial">Ir para o login</a>
        </p>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <CampoSenha
        name="senha"
        placeholder="Nova senha"
        value={senha}
        onChange={setSenha}
        autoComplete="new-password"
      />

      <CampoSenha
        name="confirmarSenha"
        placeholder="Confirmar nova senha"
        value={confirmarSenha}
        onChange={setConfirmarSenha}
        autoComplete="new-password"
      />

      {erro && (
        <p className="form-erro" role="alert">
          {erro}
        </p>
      )}

      <button type="submit" className="login-button" disabled={carregando}>
        {carregando ? "SALVANDO..." : "SALVAR NOVA SENHA"}
      </button>
    </form>
  );
}

export default function RedefinirSenha() {
  return (
    <TelaAuth titulo="NOVA SENHA">
      {/* useSearchParams exige Suspense para a página poder ser gerada no build */}
      <Suspense>
        <FormularioRedefinir />
      </Suspense>
    </TelaAuth>
  );
}
