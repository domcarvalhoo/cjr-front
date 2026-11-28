'use client';

import { useState, useEffect, SubmitEvent } from 'react';
import { Star, X } from 'lucide-react';
import { mensagemDeErro } from '@/lib/erro';
import {
  editarAvaliacaoLoja,
  editarAvaliacaoProduto,
  excluirAvaliacaoLoja,
  excluirAvaliacaoProduto,
} from '@/lib/avaliacoes';

export interface AvaliacaoEditavel {
  id: number
  nota: number;
  comentario: string | null;
}

interface ModalEditarAvaliacaoProps {
  aberto: boolean;
  avaliacao: AvaliacaoEditavel | null;
  tipo?: 'loja' | 'produto';
  nomeAlvo?: string;
  onClose: () => void;
  onSuccess: (dadosAtualizados: { nota: number; comentario: string | null }) => void;
  onDelete?: () => void;
}

export default function ModalEditarAvaliacao({
  aberto,
  avaliacao,
  tipo = 'loja',
  nomeAlvo = 'esta loja',
  onClose,
  onSuccess,
  onDelete,
}: ModalEditarAvaliacaoProps) {
  const [nota, setNota] = useState(5);
  const [hoverNota, setHoverNota] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (aberto && avaliacao) {
      setNota(avaliacao.nota);
      setHoverNota(null);
      setComentario(avaliacao.comentario ?? '');
      setErro('');
    }
  }, [aberto, avaliacao]);

  if (!aberto || !avaliacao) return null;

  async function handleSalvar(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!avaliacao || salvando || deletando) return;

    setSalvando(true);
    setErro('');

    try {
      const textoFinal = comentario.trim();
      if (tipo === 'loja') {
        await editarAvaliacaoLoja(avaliacao.id, {
          nota,
          comentario: textoFinal,
        });
      } else {
        await editarAvaliacaoProduto(avaliacao.id, {
          nota,
          comentario: textoFinal,
        });
      }

      onSuccess({
        nota,
        comentario: textoFinal || null,
      });
      onClose();
    } catch (err) {
      setErro(mensagemDeErro(err, 'Não foi possível salvar a avaliação.'));
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletar() {
    if (!avaliacao || salvando || deletando) return;

    setDeletando(true);
    setErro('');

    try {
      if (tipo === 'loja') {
        await excluirAvaliacaoLoja(avaliacao.id);
      } else {
        await excluirAvaliacaoProduto(avaliacao.id);
      }

      onClose();
      onDelete?.();
    } catch (err) {
      setErro(mensagemDeErro(err, 'Não foi possível deletar a avaliação.'));
    } finally {
      setDeletando(false);
    }
  }

  const notaExibida = hoverNota ?? nota;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#EDEDED] rounded-[28px] w-full max-w-3xl px-8 md:px-14 pt-12 pb-9 relative shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute top-6 right-6 text-black hover:opacity-70 transition-opacity cursor-pointer"
        >
          <X size={30} strokeWidth={1.75} />
        </button>

        <form onSubmit={handleSalvar} className="flex flex-col">
          {/* Cabeçalho: "Você está avaliando Rare Beauty" + Estrelas */}
          <div className="flex flex-wrap items-center justify-between gap-4 pr-8 mb-5">
            <p className="text-xl md:text-2xl font-light text-black">
              Você está avaliando{' '}
              <strong className="font-semibold">{nomeAlvo}</strong>
            </p>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <button
                  key={estrela}
                  type="button"
                  onClick={() => setNota(estrela)}
                  onMouseEnter={() => setHoverNota(estrela)}
                  onMouseLeave={() => setHoverNota(null)}
                  aria-label={`Dar ${estrela} estrela${estrela > 1 ? 's' : ''}`}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    size={26}
                    className={
                      estrela <= notaExibida
                        ? 'fill-[#FACC15] text-[#FACC15]'
                        : 'text-zinc-400'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            autoFocus
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder={
              tipo === 'loja' ? 'Avaliação da loja' : 'Avaliação do produto'
            }
            className="w-full h-64 bg-white rounded-[24px] p-7 text-base text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#6338F6]/40 resize-none"
          />

          {erro && (
            <p className="mt-4 text-sm text-red-600 text-center">{erro}</p>
          )}

          {/* Botões DELETAR e Salvar lado a lado */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleDeletar}
              disabled={salvando || deletando}
              className="w-full max-w-[220px] py-3 rounded-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold text-base transition-all disabled:opacity-50 cursor-pointer"
            >
              {deletando ? 'Deletando...' : 'DELETAR'}
            </button>

            <button
              type="submit"
              disabled={salvando || deletando}
              className="w-full max-w-[220px] py-3 rounded-full bg-[#6338F6] hover:bg-[#5227e0] text-white font-medium text-base shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}