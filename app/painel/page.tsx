"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "../../lib/api";
import { limparToken } from "../../lib/sessao";

type Usuario = {
  nome: string;
  nomeUsuario: string;
};

// página provisória para quem acabou de entrar.
// confirma que o login funciona; pode ser substituída pela tela principal do sistema.
export default function Painel() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    // sem token válido, volta para o login
    api
      .get("/auth/me")
      .then((resposta) => setUsuario(resposta.data))
      .catch(() => {
        limparToken();
        router.replace("/inicial");
      });
  }, [router]);

  function sair() {
    limparToken();
    router.push("/inicial");
  }

  if (!usuario) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-bold">Olá, {usuario.nome}!</h1>
      <p>Você entrou como @{usuario.nomeUsuario}.</p>
      <button
        type="button"
        onClick={sair}
        className="rounded-full bg-roxo px-8 py-3 font-semibold text-white hover:opacity-90"
      >
        Sair
      </button>
    </main>
  );
}
