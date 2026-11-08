import { ChevronLeft, ChevronRight } from "lucide-react";

// implementação da paginação

// quantos números aparecem: < 1 2 3 4 5 >
const NUMEROS_VISIVEIS = 5;

// páginas ao redor da atual
function paginasVisiveis(atual: number, total: number) {
  const quantidade = Math.min(NUMEROS_VISIVEIS, total);
  const inicio = Math.min(
    Math.max(atual - Math.floor(quantidade / 2), 1),
    total - quantidade + 1,
  );

  return Array.from({ length: quantidade }, (_, indice) => inicio + indice);
}

type PaginacaoProps = {
  atual: number;
  total: number;
  aoMudar: (pagina: number) => void;
};

export default function Paginacao({ atual, total, aoMudar }: PaginacaoProps) {
  // uma página só, sem paginação
  if (total <= 1) return null;

  const botaoSeta =
    "text-black transition-colors hover:text-roxo disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-black";

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-4 sm:gap-8">
      {/* seta anterior */}
      <button
        type="button"
        aria-label="Página anterior"
        disabled={atual === 1}
        onClick={() => aoMudar(atual - 1)}
        className={botaoSeta}
      >
        <ChevronLeft className="h-9 w-9" strokeWidth={1.5} />
      </button>

      {/* números */}
      {paginasVisiveis(atual, total).map((pagina) => (
        <button
          key={pagina}
          type="button"
          aria-label={`Página ${pagina}`}
          aria-current={pagina === atual ? "page" : undefined}
          onClick={() => aoMudar(pagina)}
          className={`text-3xl transition-colors hover:text-roxo sm:text-4xl ${
            pagina === atual ? "font-bold text-black" : "font-light text-black/80"
          }`}
        >
          {pagina}
        </button>
      ))}

      {/* seta próxima */}
      <button
        type="button"
        aria-label="Próxima página"
        disabled={atual === total}
        onClick={() => aoMudar(atual + 1)}
        className={botaoSeta}
      >
        <ChevronRight className="h-9 w-9" strokeWidth={1.5} />
      </button>
    </nav>
  );
}
