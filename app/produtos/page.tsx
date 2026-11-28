"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  Laptop,
  Pill,
  Search,
  Shirt,
  ShoppingBasket,
  Sparkles,
  Store,
  ToyBrick,
} from "lucide-react";

import {
  buscarProdutos,
  filtrarProdutos,
  formatarPreco,
  resolverUrlImagem,
  type ProdutoCard,
} from "@/lib/produtos";
import { mensagemDeErro } from "@/lib/erro";

type CategoriaItem = {
  nome: string;
  slug: string;
  icone: React.ReactNode;
};

const CATEGORIAS: CategoriaItem[] = [
  { nome: "Mercado", slug: "mercado", icone: <ShoppingBasket className="h-9 w-9 text-[#6338F6]" strokeWidth={1.6} /> },
  { nome: "Farmácia", slug: "farmacia", icone: <Pill className="h-9 w-9 text-[#6338F6]" strokeWidth={1.6} /> },
  { nome: "Beleza", slug: "beleza", icone: <Sparkles className="h-9 w-9 text-[#6338F6]" strokeWidth={1.6} /> },
  { nome: "Moda", slug: "moda", icone: <Shirt className="h-9 w-9 text-[#6338F6]" strokeWidth={1.6} /> },
  { nome: "Eletrônicos", slug: "eletronicos", icone: <Laptop className="h-9 w-9 text-[#6338F6]" strokeWidth={1.6} /> },
  { nome: "Brinquedos", slug: "brinquedos", icone: <ToyBrick className="h-9 w-9 text-[#6338F6]" strokeWidth={1.6} /> },
  { nome: "Casa", slug: "casa", icone: <Home className="h-9 w-9 text-[#6338F6]" strokeWidth={1.6} /> },
];

function normalizarChave(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function pertenceACategoria(produto: ProdutoCard, categoria: CategoriaItem) {
  const alvo = normalizarChave(categoria.slug);
  return (
    normalizarChave(produto.categoriaSlug || "") === alvo ||
    normalizarChave(produto.categoriaNome || "") === alvo
  );
}

function CarrosselHorizontal({ children }: { children: React.ReactNode }) {
  const trilhaRef = useRef<HTMLDivElement>(null);
  const arrastando = useRef(false);
  const moveu = useRef(false);
  const inicioX = useRef(0);
  const scrollInicial = useRef(0);

  function aoPressionarMouse(e: React.MouseEvent<HTMLDivElement>) {
    const el = trilhaRef.current;
    if (!el) return;
    arrastando.current = true;
    moveu.current = false;
    inicioX.current = e.pageX - el.offsetLeft;
    scrollInicial.current = el.scrollLeft;
  }

  function aoMoverMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!arrastando.current || !trilhaRef.current) return;
    e.preventDefault();
    const x = e.pageX - trilhaRef.current.offsetLeft;
    const deslocamento = x - inicioX.current;
    if (Math.abs(deslocamento) > 5) {
      moveu.current = true;
    }
    trilhaRef.current.scrollLeft = scrollInicial.current - deslocamento;
  }

  function aoSoltarMouse() {
    arrastando.current = false;
  }

  function aoCapturarClique(e: React.MouseEvent<HTMLDivElement>) {
    if (moveu.current) {
      e.preventDefault();
      e.stopPropagation();
      moveu.current = false;
    }
  }

  return (
    <div
      ref={trilhaRef}
      onMouseDown={aoPressionarMouse}
      onMouseMove={aoMoverMouse}
      onMouseUp={aoSoltarMouse}
      onMouseLeave={aoSoltarMouse}
      onClickCapture={aoCapturarClique}
      className="flex flex-nowrap gap-6 overflow-x-auto pb-4 select-none [scrollbar-width:thin]"
    >
      {children}
    </div>
  );
}

function CartaoProduto({ produto }: { produto: ProdutoCard }) {
  const fotoProduto = resolverUrlImagem(produto.imagemUrl);
  const logoLoja = resolverUrlImagem(produto.lojaLogoUrl);

  return (
    <Link
      href={`/produto/${produto.id}`}
      draggable={false}
      className="bg-white min-w-[245px] w-[245px] h-[300px] shrink-0 rounded-[28px] shadow-sm relative overflow-hidden flex flex-col items-center justify-between p-5 cursor-pointer text-left transition-transform hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6338F6]"
    >
      <div className="absolute top-4 right-4 w-16 h-16 rounded-full overflow-hidden bg-[#FAF6F5] shadow-sm flex items-center justify-center z-10">
        {logoLoja ? (
          <Image
            src={logoLoja}
            alt={produto.lojaNome}
            fill
            unoptimized
            draggable={false}
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <Store className="h-7 w-7 text-[#6338F6]/60" />
        )}
      </div>

      <div className="relative w-36 h-36 mt-2 rounded-xl overflow-hidden flex items-center justify-center">
        {fotoProduto ? (
          <Image
            src={fotoProduto}
            alt={produto.titulo}
            fill
            unoptimized
            draggable={false}
            sizes="144px"
            className="object-contain"
          />
        ) : (
          <span className="text-zinc-400 text-xs">Sem imagem</span>
        )}
      </div>

      <div className="w-full flex flex-col items-start">
        <h3 className="text-xl font-bold text-black truncate w-full">
          {produto.titulo}
        </h3>
        <p className="text-lg font-bold text-black mt-0.5">
          {formatarPreco(produto.preco)}
        </p>
        <span
          className={`text-xs font-bold uppercase mt-1 ${
            produto.disponivel ? "text-[#c4f000]" : "text-[#A31621]"
          }`}
        >
          {produto.disponivel ? "DISPONÍVEL" : "INDISPONÍVEL"}
        </span>
      </div>
    </Link>
  );
}

export default function PaginaProdutos() {
  const [produtos, setProdutos] = useState<ProdutoCard[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    setCarregando(true);
    setErro("");

    buscarProdutos()
      .then(setProdutos)
      .catch((err) =>
        setErro(mensagemDeErro(err, "Não foi possível carregar os produtos."))
      )
      .finally(() => setCarregando(false));
  }, []);

  // Reaproveita a lógica de filtrarProdutos de @/lib/produtos
  const resultadosBusca = useMemo(() => {
    if (!busca.trim()) return [];

    const todasCategorias = Array.from(
      new Set(produtos.map((p) => p.categoriaSlug))
    );

    return filtrarProdutos(produtos, {
      categoriasAceitas: todasCategorias,
      subcategoria: "",
      busca,
      ordenacao: "",
    });
  }, [produtos, busca]);

  return (
    <div className="min-h-screen bg-[#F5F2E6] pb-20">
      <section className="w-full bg-black text-white px-8 md:px-20 pt-10 pb-14">
        <div className="max-w-[1340px] mx-auto">
          <h1 className="text-3xl font-medium tracking-tight">Categoria</h1>

          <div className="mt-8 flex items-center gap-6 overflow-x-auto pb-2 [scrollbar-width:none]">
            {CATEGORIAS.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="w-[122px] h-[122px] shrink-0 rounded-[32px] bg-white flex flex-col items-center justify-center gap-2 transition-transform hover:scale-[1.03] opacity-95 hover:opacity-100 cursor-pointer"
              >
                {cat.icone}
                <span className="text-sm font-medium text-black">
                  {cat.nome}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1340px] mx-auto px-8 md:px-20 pt-10">
        {/* busca */}
        <div className="relative ml-auto mb-8 w-full md:w-[42%]">
          <input
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Procurar por..."
            aria-label="Buscar produtos"
            className="h-11 w-full rounded-full bg-white pl-6 pr-12 text-roxo outline-none placeholder:text-roxo/50 focus:ring-2 focus:ring-roxo/40"
          />
          <Search
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-roxo/60"
          />
        </div>

        {erro ? (
          <p className="text-lg text-red-600">{erro}</p>
        ) : carregando ? (
          <p className="text-lg font-light text-zinc-600">
            Carregando produtos...
          </p>
        ) : busca.trim() ? (
          <div>
            <h2 className="text-3xl font-medium text-black mb-6">
              Resultados{" "}
              <span className="text-sm font-normal text-black">
                para{" "}
                <span className="text-[#6338F6] font-medium">
                  &ldquo;{busca.trim()}&rdquo;
                </span>
              </span>
            </h2>

            {resultadosBusca.length === 0 ? (
              <p className="text-base font-light text-zinc-500">
                Nenhum produto encontrado para &ldquo;{busca.trim()}&rdquo;.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {resultadosBusca.map((produto) => (
                  <CartaoProduto key={produto.id} produto={produto} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {CATEGORIAS.map((categoria) => {
              const itensDaCategoria = produtos.filter((p) =>
                pertenceACategoria(p, categoria)
              );

              return (
                <div key={categoria.slug}>
                  <div className="flex items-baseline justify-between mb-6">
                    <h2 className="text-3xl font-medium text-black">
                      Produtos{" "}
                      <span className="text-sm font-normal text-black">
                        em{" "}
                        <span className="text-[#6338F6] font-medium">
                          {categoria.nome}
                        </span>
                      </span>
                    </h2>

                    <Link
                      href={`/categoria/${categoria.slug}`}
                      className="text-sm font-medium text-[#6338F6] hover:underline cursor-pointer"
                    >
                      ver mais
                    </Link>
                  </div>

                  {itensDaCategoria.length === 0 ? (
                    <p className="text-base font-light text-zinc-500">
                      Nenhum produto cadastrado na categoria {categoria.nome} ainda.
                    </p>
                  ) : (
                    <CarrosselHorizontal>
                      {itensDaCategoria.map((produto) => (
                        <CartaoProduto key={produto.id} produto={produto} />
                      ))}
                    </CarrosselHorizontal>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}