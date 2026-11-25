"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";

type ModalProps = {
  titulo: string;
  aoFechar: () => void;
  children: React.ReactNode;
};

// implementacao do modal base, igual ao cartao dos modais do figma:
// 1020px de largura, cantos de 29px, fundo #ededed, x no canto e titulo centralizado.
// fecha no x, no esc ou clicando fora. para abrir, o pai renderiza o modal; para fechar, deixa de renderizar
export default function Modal({ titulo, aoFechar, children }: ModalProps) {
  const idTitulo = useId();

  // esc fecha e a pagina de tras nao rola enquanto o modal esta aberto
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoFechar();
    }

    const rolagemAntes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", aoTeclar);

    return () => {
      document.body.style.overflow = rolagemAntes;
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aoFechar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      // clique no fundo (fora do cartao) fecha
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="relative max-h-[calc(100vh-2rem)] w-full max-w-[1020px] overflow-y-auto rounded-[29px] bg-cinza-claro px-5 pb-10 pt-14 sm:px-[97px] sm:pb-[55px] sm:pt-[50px]"
      >
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
          className="absolute right-5 top-5 text-black transition-opacity hover:opacity-70 sm:right-[32px] sm:top-[22px]"
        >
          <X className="h-[33px] w-[33px]" strokeWidth={1.75} />
        </button>

        <h2
          id={idTitulo}
          className="mb-[20px] text-center text-[34px] font-normal leading-none text-black sm:mb-[25px] sm:text-[52.56px]"
        >
          {titulo}
        </h2>

        {children}
      </div>
    </div>
  );
}
