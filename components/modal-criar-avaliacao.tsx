'use client';

import { useState, useEffect, SubmitEvent } from 'react';
import { Star, X } from 'lucide-react';
import { mensagemDeErro } from '@/lib/erro';
import {
  criarAvaliacaoLoja,
  criarAvaliacaoProduto,
} from '@/lib/avaliacoes';

interface ModalCriarAvaliacaoProps {
  aberto: boolean;
  tipo: 'loja' | 'produto';
  alvoId: number;
  nomeAlvo: string;
  usuarioId: number;
  onClose: () => void;
  onSuccess?: (novaAvaliacao: any) => void;
}

export default function ModalCriarAvaliacao({
  aberto,
  tipo,
  alvoId,
  nomeAlvo,
  usuarioId,
  onClose,
  onSuccess,
}: ModalCriarAvaliacaoProps) {
  const [nota, setNota] = useState(5);
  const [hoverNota, setHoverNota] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (aberto) {
      setNota(5);
      setHoverNota(null);
      setComentario('');
      setErro('');
    }
  }, [aberto]);

  if (!aberto) return null;

  async function handleAvaliar(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviando) return;

    setEnviando(true);
    setErro('');

    try {
      const textoLimpo = comentario.trim() || undefined;
      const criada =
        tipo === 'loja'
          ? await criarAvaliacaoLoja({
              usuarioId,
              lojaId: alvoId,
              nota,
              comentario: textoLimpo,
            })
          : await criarAvaliacaoProduto({
              usuarioId,
              produtoId: alvoId,
              nota,
              comentario: textoLimpo,
            });

      onSuccess?.(criada);
      onClose();
    } catch (err) {
      setErro(mensagemDeErro(err, 'Não foi possível publicar a avaliação.'));
    } finally {
      setEnviando(false);
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

        <form onSubmit={handleAvaliar} className="flex flex-col">
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

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={enviando}
              className="w-full max-w-md py-3 rounded-full bg-[#6338F6] hover:bg-[#5227e0] text-white font-medium text-base shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {enviando ? 'Avaliando...' : 'Avaliar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}