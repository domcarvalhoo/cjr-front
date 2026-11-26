'use client';

import { useState, useEffect, SubmitEvent } from 'react';
import { X } from 'lucide-react';
// import { api } from '@/lib/api';
import type { Comentario } from './editar-comentario';

interface ModalCriarComentarioProps {
  aberto: boolean;
  avaliacaoLojaId?: string;
  avaliacaoProdutoId?: string;
  produtoId?: string;
  onClose: () => void;
  onSuccess: (novoComentario: Comentario) => void;
}

export default function ModalCriarComentario({
  aberto,
  onClose,
  onSuccess,
}: ModalCriarComentarioProps) {
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (aberto) {
      setTexto('');
    }
  }, [aberto]);

  if (!aberto) return null;

  async function handleComentar(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!texto.trim() || enviando) return;

    setEnviando(true);

    const novoComentarioMock: Comentario = {
      id: `coment-${Date.now()}`,
      texto: texto.trim(),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      usuarioId: 'user-sofia-id',
      usuario: {
        id: 'user-sofia-id',
        nome: 'Sofia Figueiredo',
        nomeUsuario: 'sofiafig',
        fotoUrl: null,
      },
    };

    onSuccess(novoComentarioMock);
    setTexto('');
    setEnviando(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#EDEDED] rounded-[28px] w-full max-w-3xl px-8 md:px-14 pt-14 pb-9 relative shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute top-6 right-6 text-black hover:opacity-70 transition-opacity cursor-pointer"
        >
          <X size={32} strokeWidth={1.75} />
        </button>

        <form onSubmit={handleComentar} className="flex flex-col items-center">
          <textarea
            autoFocus
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Comentário"
            className="w-full h-72 bg-white rounded-[24px] p-7 text-base text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#6338F6]/40 resize-none"
          />

          <button
            type="submit"
            disabled={!texto.trim() || enviando}
            className="mt-8 w-full max-w-md py-3 rounded-full bg-[#6338F6] hover:bg-[#5227e0] text-white font-medium text-base shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {enviando ? 'Comentando...' : 'Comentar'}
          </button>
        </form>
      </div>
    </div>
  );
}