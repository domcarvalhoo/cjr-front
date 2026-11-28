'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Pencil, Star, Send, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { mensagemDeErro } from '@/lib/erro';
import {
  buscarComentarioPorId,
  excluirComentario,
  listarComentarios,
  type Comentario,
  type UsuarioComentario,
} from '@/lib/comentarios';

import ModalCriarComentario from './criar-comentario';
import ModalEditarComentario from './editar-comentario';
import ModalEditarAvaliacao from './modal-editar-avaliacao';

export interface Avaliacao {
  id: number;
  nota: number;
  comentario: string | null;
  criadoEm: string;
  usuarioId: number;
  usuario: UsuarioComentario;
  loja?: {
    nome?: string;
    donoId?: number | null;
  };
}

interface Props {
  avaliacao: Avaliacao;
  usuarioLogadoId?: number;
  donoDaLojaId?: number;
}

function iniciais(nome: string) {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');
}

function AvatarUsuario({
  nome,
  fotoUrl,
  tamanhoClasse,
  textoClasse,
}: {
  nome: string;
  fotoUrl: string | null;
  tamanhoClasse: string;
  textoClasse: string;
}) {
  const [erroImagem, setErroImagem] = useState(false);

  useEffect(() => {
    setErroImagem(false);
  }, [fotoUrl]);

  const src = fotoUrl
    ? fotoUrl.startsWith('http')
      ? fotoUrl
      : `${process.env.NEXT_PUBLIC_API_URL}${fotoUrl}`
    : null;

  return (
    <div
      className={`${tamanhoClasse} relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#6a38f3] font-semibold text-[#F5F2E6] ${textoClasse}`}
    >
      {src && !erroImagem ? (
        <Image
          src={src}
          alt={nome}
          fill
          unoptimized
          onError={() => setErroImagem(true)}
          className="object-cover"
        />
      ) : (
        iniciais(nome)
      )}
    </div>
  );
}

export default function TelaComentariosAvaliacao({
  avaliacao: avaliacaoInicial,
  usuarioLogadoId: usuarioLogadoProp,
  donoDaLojaId,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const comentarioIdNaUrl = searchParams.get('comentarioId');

  const [avaliacao, setAvaliacao] = useState<Avaliacao>(avaliacaoInicial);
  const [usuarioAtual, setUsuarioAtual] = useState<{
    id: number;
    fotoUrl: string | null;
  } | null>(
    usuarioLogadoProp !== undefined
      ? { id: usuarioLogadoProp, fotoUrl: null }
      : null
  );

  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState('');
  const [comentarioDestacadoId, setComentarioDestacadoId] = useState<number | null>(
    null
  );

  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [comentarioEmEdicao, setComentarioEmEdicao] = useState<Comentario | null>(null);
  const [modalEditarAvaliacaoAberto, setModalEditarAvaliacaoAberto] = useState(false);

  const idDonoLoja = donoDaLojaId ?? avaliacao.loja?.donoId ?? undefined;

  useEffect(() => {
    setAvaliacao(avaliacaoInicial);
  }, [avaliacaoInicial]);

  useEffect(() => {
    api
      .get<{ id: number; fotoUrl: string | null }>('/auth/me')
      .then((res) => setUsuarioAtual({ id: res.data.id, fotoUrl: res.data.fotoUrl }))
      .catch(() => {
        if (usuarioLogadoProp !== undefined) {
          setUsuarioAtual({ id: usuarioLogadoProp, fotoUrl: null });
        } else {
          setUsuarioAtual(null);
        }
      });
  }, [usuarioLogadoProp]);

  useEffect(() => {
    setCarregando(true);
    setErroLista('');

    listarComentarios({ avaliacaoLojaId: avaliacao.id })
      .then(setComentarios)
      .catch((err) =>
        setErroLista(mensagemDeErro(err, 'Não foi possível carregar os comentários.'))
      )
      .finally(() => setCarregando(false));
  }, [avaliacao.id]);

  useEffect(() => {
    const idNumerico = comentarioIdNaUrl ? Number(comentarioIdNaUrl) : NaN;
    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      setComentarioDestacadoId(null);
      return;
    }

    buscarComentarioPorId(idNumerico)
      .then((encontrado) => setComentarioDestacadoId(encontrado.id))
      .catch(() => setComentarioDestacadoId(null));
  }, [comentarioIdNaUrl]);

  function formatarTempoRelativo(dataIso: string) {
    const diferencaMs = Date.now() - new Date(dataIso).getTime();
    const minutos = Math.floor(diferencaMs / 60000);
    if (minutos < 60) return `${Math.max(1, minutos)}m`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h`;
    const dias = Math.floor(horas / 24);
    return `${dias}d`;
  }

  async function handleExcluirComentario(id: number) {
    try {
      await excluirComentario(id);
      setComentarios((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setErroLista(mensagemDeErro(err, 'Não foi possível excluir o comentário.'));
    }
  }

  const ehDonoDaAvaliacao = Boolean(
    usuarioAtual && usuarioAtual.id === avaliacao.usuarioId
  );

  const fotoAutorAvaliacao =
    ehDonoDaAvaliacao && usuarioAtual?.fotoUrl
      ? usuarioAtual.fotoUrl
      : avaliacao.usuario.fotoUrl;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2E6]">
      {/* SEÇÃO SUPERIOR PRETA: Avaliação Principal */}
      <section className="w-full bg-black text-white px-6 md:px-16 pt-6 pb-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-end h-6 mb-2">
            {ehDonoDaAvaliacao && (
              <button
                type="button"
                onClick={() => setModalEditarAvaliacaoAberto(true)}
                aria-label="Editar avaliação"
                title="Editar avaliação"
                className="text-white hover:text-[#c4f000] transition-colors cursor-pointer"
              >
                <Pencil size={20} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Voltar"
                className="text-white hover:text-[#c4f000] transition-colors cursor-pointer -ml-2"
              >
                <ChevronLeft size={28} strokeWidth={2} />
              </button>

              <AvatarUsuario
                nome={avaliacao.usuario.nome}
                fotoUrl={fotoAutorAvaliacao}
                tamanhoClasse="w-14 h-14"
                textoClasse="text-xl"
              />

              <div className="flex items-baseline gap-2.5">
                <h1 className="text-2xl font-medium tracking-tight">
                  {avaliacao.usuario.nome}
                </h1>
                <span className="text-xs text-zinc-400">
                  {formatarTempoRelativo(avaliacao.criadoEm)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <Star
                  key={estrela}
                  size={20}
                  className={
                    estrela <= avaliacao.nota
                      ? 'fill-[#FACC15] text-[#FACC15]'
                      : 'text-zinc-600'
                  }
                />
              ))}
            </div>
          </div>

          {avaliacao.comentario && (
            <p className="mt-6 pl-10 text-zinc-200 text-lg font-light leading-relaxed max-w-4xl">
              {avaliacao.comentario}
            </p>
          )}
        </div>
      </section>

      {/* SEÇÃO INFERIOR CREME: Thread de Comentários e Barra de Gatilho */}
      <section className="flex-1 w-full px-6 md:px-16 py-10 flex flex-col justify-between max-w-6xl mx-auto">
        <div className="pl-4 md:pl-12">
          {erroLista && (
            <p className="mb-4 text-sm text-red-600">{erroLista}</p>
          )}

          {carregando ? (
            <p className="text-zinc-500 text-sm">Carregando comentários...</p>
          ) : comentarios.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">
              Nenhum comentário ainda. Seja o primeiro a comentar!
            </p>
          ) : (
            <div className="border-l border-zinc-800 pl-8 flex flex-col gap-6">
              {comentarios.map((item) => {
                const ehDonoDaLoja = Boolean(
                  idDonoLoja !== undefined && item.usuarioId === idDonoLoja
                );
                const ehDonoDoComentario = Boolean(
                  usuarioAtual && item.usuarioId === usuarioAtual.id
                );
                const fotoAutorComentario =
                  ehDonoDoComentario && usuarioAtual?.fotoUrl
                    ? usuarioAtual.fotoUrl
                    : item.usuario.fotoUrl;

                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3.5 rounded-xl transition-colors ${
                      comentarioDestacadoId === item.id
                        ? 'bg-[#6338F6]/10 p-3 -ml-3'
                        : ''
                    }`}
                  >
                    <AvatarUsuario
                      nome={item.usuario.nome}
                      fotoUrl={fotoAutorComentario}
                      tamanhoClasse="w-11 h-11 mt-0.5"
                      textoClasse="text-base"
                    />

                    <div className="flex-1">
                      <div className="flex items-center justify-between max-w-2xl">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-2">
                            <span className="text-black font-medium text-base leading-none">
                              {item.usuario.nome}
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              {formatarTempoRelativo(item.criadoEm)}
                            </span>
                          </div>

                          {ehDonoDaLoja && (
                            <span className="text-[11px] font-medium text-[#7c3aed] leading-tight mt-0.5">
                              dono da loja
                            </span>
                          )}
                        </div>

                        {ehDonoDoComentario && (
                          <div className="flex items-center gap-2.5 ml-3">
                            <button
                              type="button"
                              onClick={() => setComentarioEmEdicao(item)}
                              className="text-zinc-500 hover:text-black transition-colors cursor-pointer"
                              aria-label="Editar comentário"
                              title="Editar comentário"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExcluirComentario(item.id)}
                              className="text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
                              aria-label="Excluir comentário"
                              title="Excluir comentário"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-zinc-800 text-base font-light mt-1">
                        {item.texto}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-14 w-full max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => setModalCriarAberto(true)}
            className="w-full flex items-center justify-between bg-white rounded-full shadow-sm px-6 py-3.5 text-left hover:ring-2 hover:ring-[#6338F6]/30 transition-all cursor-text"
          >
            <span className="text-zinc-400 text-sm">
              Adicionar comentário
            </span>
            <Send size={20} className="text-zinc-400 rotate-12" />
          </button>
        </div>
      </section>

      {/* MODAIS */}
      <ModalCriarComentario
        aberto={modalCriarAberto}
        avaliacaoLojaId={avaliacao.id}
        onClose={() => setModalCriarAberto(false)}
        onSuccess={(novoComentario) =>
          setComentarios((prev) => [...prev, novoComentario])
        }
      />

      <ModalEditarComentario
        comentario={comentarioEmEdicao}
        onClose={() => setComentarioEmEdicao(null)}
        onSuccess={(comentarioAtualizado) =>
          setComentarios((prev) =>
            prev.map((c) =>
              c.id === comentarioAtualizado.id ? comentarioAtualizado : c
            )
          )
        }
      />

      <ModalEditarAvaliacao
        aberto={modalEditarAvaliacaoAberto}
        avaliacao={avaliacao}
        onClose={() => setModalEditarAvaliacaoAberto(false)}
        onSuccess={({ nota, comentario }) =>
          setAvaliacao((prev) => ({
            ...prev,
            nota,
            comentario,
          }))
        }
        onDelete={() => router.back()}
      />
    </div>
  );
}