'use client';

import { useState, useEffect, SubmitEvent } from 'react';
import { X } from 'lucide-react';
import { mensagemDeErro } from '@/lib/erro';
import {
  editarComentario,
  type Comentario,
  type UsuarioComentario,
} from '@/lib/comentarios';

export type { Comentario, UsuarioComentario as UsuarioResumo };

interface ModalEditarComentarioProps {
  comentario: Comentario | null;
  onClose: () => void;
  onSuccess: (comentarioAtualizado: Comentario) => void;
}

export default function ModalEditarComentario({
  comentario,
  onClose,
  onSuccess,
}: ModalEditarComentarioProps) {
  const [texto, setTexto] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (comentario) {
      setTexto(comentario.texto);
      setErro('');
    }
  }, [comentario]);

  if (!comentario) return null;

  async function handleSalvar(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!comentario || !texto.trim() || salvando) return;

    setSalvando(true);
    setErro('');

    try {
      const atualizado = await editarComentario(comentario.id, texto.trim());
      onSuccess(atualizado);
      onClose();
    } catch (err) {
      setErro(mensagemDeErro(err, 'Não foi possível atualizar o comentário.'));
    } finally {
      setSalvando(false);
    }
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

        <form onSubmit={handleSalvar} className="flex flex-col items-center">
          <textarea
            autoFocus
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Comentário"
            className="w-full h-72 bg-white rounded-[24px] p-7 text-base text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#6338F6]/40 resize-none"
          />

          {erro && (
            <p className="mt-4 text-sm text-red-600 text-center">{erro}</p>
          )}

          <button
            type="submit"
            disabled={!texto.trim() || salvando}
            className="mt-8 w-full max-w-md py-3 rounded-full bg-[#6338F6] hover:bg-[#5227e0] text-white font-medium text-base shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {salvando ? 'Atualizando...' : 'Atualizar'}
          </button>
        </form>
      </div>
    </div>
  );
}