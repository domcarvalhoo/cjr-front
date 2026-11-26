<<<<<<< HEAD
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import TelaComentariosAvaliacao, {
  type Avaliacao,
} from "@/components/tela-comentario";
import { api } from "@/lib/api";
import { mensagemDeErro } from "@/lib/erro";

function ConteudoPaginaComentario() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const avaliacaoId = Number(params?.id);

  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);
  const [usuarioLogadoId, setUsuarioLogadoId] = useState<number | undefined>(
    undefined
  );
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!avaliacaoId) return;

    setCarregando(true);
    setErro("");

    Promise.all([
      api.get<Avaliacao>(`/avaliacoes/lojas/${avaliacaoId}`),
      api.get<{ id: number }>("/auth/me").catch(() => null),
    ])
      .then(([resAvaliacao, resUsuario]) => {
        setAvaliacao(resAvaliacao.data);
        if (resUsuario?.data?.id) {
          setUsuarioLogadoId(resUsuario.data.id);
        }
      })
      .catch((err) => {
        setErro(
          mensagemDeErro(err, "Não foi possível carregar os detalhes da avaliação.")
        );
      })
      .finally(() => setCarregando(false));
  }, [avaliacaoId]);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2E6] text-zinc-600">
        Carregando avaliação...
      </div>
    );
  }

  if (erro || !avaliacao) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F5F2E6] px-6 text-center">
        <p className="text-red-600">{erro || "Avaliação não encontrada."}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full bg-[#6338F6] px-6 py-2 text-sm text-white hover:bg-[#5227e0] cursor-pointer"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <TelaComentariosAvaliacao
      avaliacao={avaliacao}
      usuarioLogadoId={usuarioLogadoId}
      donoDaLojaId={avaliacao.loja?.donoId ?? undefined}
    />
  );
}

export default function PaginaDetalhesComentario() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2E6] text-zinc-600">
          Carregando...
        </div>
      }
    >
      <ConteudoPaginaComentario />
    </Suspense>
  );
}
=======
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import TelaComentariosAvaliacao, {
  type Avaliacao,
} from "@/components/tela-comentario";
import { api } from "@/lib/api";
import { mensagemDeErro } from "@/lib/erro";

function ConteudoPaginaComentario() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const avaliacaoId = params?.id;

  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);
  const [usuarioLogadoId, setUsuarioLogadoId] = useState<string | undefined>(
    undefined
  );
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!avaliacaoId) return;

    setCarregando(true);
    setErro("");

    Promise.all([
      api.get<Avaliacao>(`/avaliacoes/lojas/${avaliacaoId}`),
      api.get<{ id: string }>("/auth/me").catch(() => null),
    ])
      .then(([resAvaliacao, resUsuario]) => {
        setAvaliacao(resAvaliacao.data);
        if (resUsuario?.data?.id) {
          setUsuarioLogadoId(resUsuario.data.id);
        }
      })
      .catch((err) => {
        setErro(
          mensagemDeErro(err, "Não foi possível carregar os detalhes da avaliação.")
        );
      })
      .finally(() => setCarregando(false));
  }, [avaliacaoId]);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2E6] text-zinc-600">
        Carregando avaliação...
      </div>
    );
  }

  if (erro || !avaliacao) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F5F2E6] px-6 text-center">
        <p className="text-red-600">{erro || "Avaliação não encontrada."}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full bg-[#6338F6] px-6 py-2 text-sm text-white hover:bg-[#5227e0] cursor-pointer"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <TelaComentariosAvaliacao
      avaliacao={avaliacao}
      usuarioLogadoId={usuarioLogadoId}
      donoDaLojaId={avaliacao.loja?.donoId ?? undefined}
    />
  );
}

export default function PaginaDetalhesComentario() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2E6] text-zinc-600">
          Carregando...
        </div>
      }
    >
      <ConteudoPaginaComentario />
    </Suspense>
  );
}
>>>>>>> 4582bab4f5558b792f24607f2b642c40d04384f6
