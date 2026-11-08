"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import type { CategoriaTela } from "@/lib/categorias";
import { mensagemDeErro } from "@/lib/erro";
import {
  buscarProdutos,
  filtrarProdutos,
  OPCOES_ORDENACAO,
  type Ordenacao,
  type ProdutoCard,
} from "@/lib/produtos";
import CardProduto from "./card-produto";
import Paginacao from "./paginacao";

// 3 linhas de 5 produtos
const PRODUTOS_POR_PAGINA = 15;

// implementação da lista de produtos da categoria
export default function ListaProdutos({ categoria }: { categoria: CategoriaTela }) {
  const [produtos, setProdutos] = useState<ProdutoCard[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("");
  const [pagina, setPagina] = useState(1);

  const topoRef = useRef<HTMLDivElement>(null);

  // buscando produtos ao abrir a tela
  useEffect(() => {
    buscarProdutos()
      .then(setProdutos)
      .catch((err) => setErro(mensagemDeErro(err, "Não foi possível carregar os produtos.")))
      .finally(() => setCarregando(false));
  }, []);

  // alterou busca, filtro ou ordem: volta pra página 1
  function alterar<T>(definir: (valor: T) => void, valor: T) {
    definir(valor);
    setPagina(1);
  }

  // trocando de página
  function irParaPagina(nova: number) {
    setPagina(nova);
    topoRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  // aplicando filtros
  const encontrados = filtrarProdutos(produtos, {
    categoriasAceitas: [categoria.slug, ...categoria.filtros.map((filtro) => filtro.slug)],
    subcategoria,
    busca,
    ordenacao,
  });

  // separando por página
  const totalPaginas = Math.max(1, Math.ceil(encontrados.length / PRODUTOS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const daPagina = encontrados.slice(
    (paginaAtual - 1) * PRODUTOS_POR_PAGINA,
    paginaAtual * PRODUTOS_POR_PAGINA,
  );

  return (
    <section className="mx-auto w-[92%] max-w-[1280px] py-8 md:w-[84%]">
      <div ref={topoRef} className="scroll-mt-4" />

      {/* busca */}
      <div className="relative ml-auto w-full md:w-[42%]">
        <input
          type="search"
          value={busca}
          onChange={(evento) => alterar(setBusca, evento.target.value)}
          placeholder="Procurar por..."
          aria-label={`Buscar em ${categoria.nome}`}
          className="h-11 w-full rounded-full bg-white pl-6 pr-12 text-roxo outline-none placeholder:text-roxo/50 focus:ring-2 focus:ring-roxo/40"
        />
        <Search
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-roxo/60"
        />
      </div>

      {/* filtros e ordenação */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {categoria.filtros.map((filtro) => {
          const ativo = subcategoria === filtro.slug;

          return (
            <button
              key={filtro.slug}
              type="button"
              aria-pressed={ativo}
              // clicar de novo desliga o filtro
              onClick={() => alterar(setSubcategoria, ativo ? "" : filtro.slug)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                ativo ? "bg-roxo text-white" : "bg-white text-roxo hover:bg-roxo/10"
              }`}
            >
              {filtro.nome}
            </button>
          );
        })}

        <div className="relative w-full sm:ml-auto sm:w-[39%]">
          <select
            value={ordenacao}
            onChange={(evento) => alterar(setOrdenacao, evento.target.value as Ordenacao)}
            aria-label="Ordenar produtos"
            className="h-10 w-full cursor-pointer appearance-none rounded-full bg-white pl-6 pr-12 text-lg text-roxo outline-none focus:ring-2 focus:ring-roxo/40"
          >
            {OPCOES_ORDENACAO.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.nome}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-roxo"
          />
        </div>
      </div>

      {/* grade de produtos e mensagens */}
      <div className="mt-6" aria-live="polite">
        {carregando && <p className="py-16 text-center text-cinza">Carregando produtos...</p>}

        {!carregando && erro && <p className="py-16 text-center text-vermelho">{erro}</p>}

        {!carregando && !erro && encontrados.length === 0 && (
          <p className="py-16 text-center text-cinza">Nenhum produto encontrado.</p>
        )}

        {daPagina.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {daPagina.map((produto) => (
              <li key={produto.id}>
                <CardProduto produto={produto} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* paginação */}
      <div className="mt-10">
        <Paginacao atual={paginaAtual} total={totalPaginas} aoMudar={irParaPagina} />
      </div>
    </section>
  );
}
