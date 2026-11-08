import { ShoppingBag } from "lucide-react";

import { formatarPreco, type ProdutoCard } from "@/lib/produtos";

// implementação do card de produto
export default function CardProduto({ produto }: { produto: ProdutoCard }) {
  return (
    <article className="flex flex-col rounded-2xl bg-white p-3 pb-4">
      {/* foto e logo da loja */}
      <div className="relative flex h-40 items-center justify-center">
        {produto.imagemUrl ? (
          // foto vem de link externo, por isso <img>
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={produto.imagemUrl}
            alt={produto.titulo}
            className="h-full w-full object-contain"
          />
        ) : (
          // sem foto
          <ShoppingBag className="h-12 w-12 text-cinza/60" strokeWidth={1.5} aria-hidden />
        )}

        {produto.lojaLogoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={produto.lojaLogoUrl}
            alt={`Loja ${produto.lojaNome}`}
            title={produto.lojaNome}
            className="absolute right-0 top-0 h-11 w-11 rounded-full bg-white object-contain p-1"
          />
        )}
      </div>

      {/* nome, preço e disponibilidade */}
      <h2 className="mt-3 truncate text-lg font-semibold text-black" title={produto.titulo}>
        {produto.titulo}
      </h2>
      <p className="text-lg font-semibold text-black">{formatarPreco(produto.preco)}</p>
      <p
        className={`text-xs font-medium uppercase ${
          produto.disponivel ? "text-verde" : "text-vermelho"
        }`}
      >
        {produto.disponivel ? "Disponível" : "Indisponível"}
      </p>
    </article>
  );
}
