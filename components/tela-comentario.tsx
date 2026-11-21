'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Pencil, Star, Send, Trash2 } from 'lucide-react';
// import { api } from '@/lib/api';

import ModalCriarComentario from './criar-comentario';
import ModalEditarComentario, {
  type Comentario,
  type UsuarioResumo
} from './editar-comentario';

/*import ModalEditarAvaliacao, {
  type Avaliacao,
} from './modal-editar-avaliacao';*/
 export interface Avaliacao {
  id: string;
  nota: number;
  comentario: string | null;
  criadoEm: string;
  usuarioId: string;
  usuario: UsuarioResumo;
  loja?: {
    donoId?: string;
  };
}


interface Props {
  avaliacao: Avaliacao;
  usuarioLogadoId?: string;
  donoDaLojaId?: string;
}

export default function TelaComentariosAvaliacao({
  avaliacao: avaliacaoInicial,
  usuarioLogadoId: usuarioLogadoProp,
  donoDaLojaId,
}: Props) {
  const router = useRouter();
  const [avaliacao, setAvaliacao] = useState<Avaliacao>(avaliacaoInicial);
  const [idUsuarioAtual, setIdUsuarioAtual] = useState<string | null>(
    usuarioLogadoProp ?? 'user-sofia-id'
  );

  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [comentarioEmEdicao, setComentarioEmEdicao] = useState<Comentario | null>(null);
  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = useState(false);

  useEffect(() => {
    setIdUsuarioAtual(usuarioLogadoProp ?? 'user-sofia-id');
  }, [usuarioLogadoProp]);

  useEffect(() => {
    setComentarios([
      {
        id: 'coment-1',
        texto: 'Amei muito também!',
        criadoEm: new Date(Date.now() - 3600 * 1000).toISOString(),
        atualizadoEm: new Date().toISOString(),
        usuarioId: 'user-maria-id',
        usuario: {
          id: 'user-maria-id',
          nome: 'Maria Santos',
          nomeUsuario: 'mariasantos',
          fotoUrl: null,
        },
      },
      {
        id: 'coment-2',
        texto: 'Muito obrigada pelo carinho! Nós da Rare Beauty ficamos felizes =)',
        criadoEm: new Date(Date.now() - 3600 * 1000).toISOString(),
        atualizadoEm: new Date().toISOString(),
        usuarioId: 'user-selena-id',
        usuario: {
          id: 'user-selena-id',
          nome: 'Selena Gomez',
          nomeUsuario: 'selenagomez',
          fotoUrl: null,
        },
      },
    ]);
    setCarregando(false);
  }, []);

  function formatarTempoRelativo(dataIso: string) {
    const diferencaMs = Date.now() - new Date(dataIso).getTime();
    const minutos = Math.floor(diferencaMs / 60000);
    if (minutos < 60) return `${Math.max(1, minutos)}m`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h`;
    const dias = Math.floor(horas / 24);
    return `${dias}d`;
  }

  // Simulação local (mock) de exclusão
  async function handleExcluirComentario(id: string) {
    setComentarios((prev) => prev.filter((c) => c.id !== id));
  }

  const ehDonoDaAvaliacao = Boolean(
    idUsuarioAtual && idUsuarioAtual === avaliacao.usuarioId
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2E6]">
      {/* SEÇÃO SUPERIOR PRETA: Avaliação Principal */}
      <section className="w-full bg-black text-white px-6 md:px-16 pt-6 pb-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-end h-6 mb-2">
            {ehDonoDaAvaliacao && (
              <button
                type="button"
                onClick={() => setModalAvaliacaoAberto(true)}
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

              <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-800 relative shrink-0">
                <Image
                  src={avaliacao.usuario.fotoUrl || '/avatar-placeholder.png'}
                  alt={avaliacao.usuario.nome}
                  fill
                  className="object-cover"
                />
              </div>

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
                  donoDaLojaId && item.usuarioId === donoDaLojaId
                );
                const ehDonoDoComentario = Boolean(
                  idUsuarioAtual && item.usuarioId === idUsuarioAtual
                );

                return (
                  <div key={item.id} className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-300 relative shrink-0 mt-0.5">
                      <Image
                        src={item.usuario.fotoUrl || '/avatar-placeholder.png'}
                        alt={item.usuario.nome}
                        fill
                        className="object-cover"
                      />
                    </div>

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
                              dona da loja
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

        {/* Barra Inferior: Clicar abre o ModalCriarComentario */}
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
    </div>
  );
}