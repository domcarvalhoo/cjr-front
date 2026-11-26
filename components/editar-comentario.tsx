'use client';

import { useState, useEffect, SubmitEvent } from 'react';
import { X } from 'lucide-react';
// import { api } from '@/lib/api';

export interface UsuarioResumo {
  id: string;
  nome: string;
  nomeUsuario: string;
  fotoUrl: string | null;
}

export interface Comentario {
  id: string;
  texto: string;
  criadoEm: string;
  atualizadoEm: string;
  usuarioId: string;
  usuario: UsuarioResumo;
}

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

  useEffect(() => {
    if (comentario) {
      setTexto(comentario.texto);
    }
  }, [comentario]);

  if (!comentario) return null;

  async function handleSalvar(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!comentario || !texto.trim() || salvando) return;

    setSalvando(true);

    onSuccess({
      ...comentario,
      texto: texto.trim(),
      atualizadoEm: new Date().toISOString(),
    });

    setSalvando(false);
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

        <form onSubmit={handleSalvar} className="flex flex-col items-center">
          <textarea
            autoFocus
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Comentário"
            className="w-full h-72 bg-white rounded-[24px] p-7 text-base text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#6338F6]/40 resize-none"
          />

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