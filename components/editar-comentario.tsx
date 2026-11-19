'use client';

import { useState, useEffect, SubmitEvent } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/api';

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

  async function handleSalvar(e: SubmitEvent) {
    e.preventDefault();
    if (!comentario || !texto.trim() || salvando) return;

    setSalvando(true);
    try {
      const { data } = await api.patch(`/comentario/${comentario.id}`, {
        texto: texto.trim(),
      });
      onSuccess(data);
      onClose();
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-black">Editar comentário</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="text-zinc-400 hover:text-black transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSalvar} className="flex flex-col gap-4">
          <textarea
            rows={3}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="w-full border border-zinc-300 rounded-2xl p-3.5 text-sm text-black focus:outline-none focus:border-[#7c3aed] resize-none"
            placeholder="Digite seu comentário..."
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-sm text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!texto.trim() || salvando}
              className="px-6 py-2 rounded-full text-sm font-semibold bg-[#7c3aed] text-white hover:bg-purple-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}