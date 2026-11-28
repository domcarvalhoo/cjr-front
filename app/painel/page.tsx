"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Apple,
  Pill,
  Sparkles,
  Shirt,
  Monitor,
  Baby,
  Home,
  Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import FiltroLojas from "@/components/filtrolojas";
import {
  buscarProdutos,
  filtrarProdutos,
  formatarPreco,
  resolverUrlImagem,
  type ProdutoCard,
} from "@/lib/produtos";
import { buscarLojas, filtrarLojas, type Loja } from "@/lib/lojas";
import { mensagemDeErro } from "@/lib/erro";

const CATEGORIAS_ATALHO = [
  { nome: "Mercado", slug: "mercado", icone: Apple },
  { nome: "Farmácia", slug: "farmacia", icone: Pill },
  { nome: "Beleza", slug: "beleza", icone: Sparkles },
  { nome: "Moda", slug: "moda", icone: Shirt },
  { nome: "Eletrônicos", slug: "eletronicos", icone: Monitor },
  { nome: "Brinquedos", slug: "brinquedos", icone: Baby },
  { nome: "Casa", slug: "casa", icone: Home },
];

const SECOES_FEED = [
  { nome: "Mercado", slug: "mercado" },
  { nome: "Beleza", slug: "beleza" },
  { nome: "Eletrônicos", slug: "eletronicos" },
];

function normalizarChave(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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
      className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide select-none"
    >
      {children}
    </div>
  );
}

function CartaoProdutoFeed({ produto }: { produto: ProdutoCard }) {
  const fotoProduto = resolverUrlImagem(produto.imagemUrl);
  const logoLoja = resolverUrlImagem(produto.lojaLogoUrl);

  return (
    <Link
      href={`/produto/${produto.id}`}
      draggable={false}
      className="bg-white min-w-[250px] w-[250px] h-[300px] shrink-0 rounded-3xl shadow-sm relative overflow-hidden flex flex-col items-center justify-between p-5 cursor-pointer text-left transition-transform hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400"
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
          <Store className="h-7 w-7 text-purple-600/60" />
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
          <span className="text-gray-400 text-xs">Sem imagem</span>
        )}
      </div>

      <div className="w-full flex flex-col items-start">
        <h3 className="text-xl font-bold text-black truncate w-full">
          {produto.titulo}
        </h3>
        <p className="text-lg font-bold text-black mt-1">
          {formatarPreco(produto.preco)}
        </p>
        <span
          className={`text-sm font-bold uppercase mt-1 ${
            produto.disponivel ? "text-[#c4f000]" : "text-[#A31621]"
          }`}
        >
          {produto.disponivel ? "DISPONÍVEL" : "INDISPONÍVEL"}
        </span>
      </div>
    </Link>
  );
}

function CartaoLojaFeed({ loja }: { loja: Loja }) {
  const logo = resolverUrlImagem(loja.logoUrl || loja.fotoUrl);

  return (
    <Link
      href={`/loja/${loja.id}`}
      className="flex flex-col items-center min-w-[136px] group"
    >
      <div className="w-[136px] h-[136px] rounded-full bg-white shadow-sm mb-3 flex items-center justify-center overflow-hidden relative cursor-pointer group-hover:scale-105 transition-transform">
        {logo ? (
          <Image
            src={logo}
            alt={`Logo da loja ${loja.nome}`}
            fill
            unoptimized
            sizes="136px"
            className="object-cover"
          />
        ) : (
          <Store className="h-12 w-12 text-purple-600/60" />
        )}
      </div>
      <span className="text-black font-medium text-center leading-tight group-hover:text-purple-600 transition-colors">
        {loja.nome}
      </span>
      {loja.categoria && (
        <span className="text-purple-600 text-sm lowercase text-center mt-0.5">
          {loja.categoria.nome}
        </span>
      )}
    </Link>
  );
}

export default function FeedPage() {
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [produtos, setProdutos] = useState<ProdutoCard[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setCarregando(true);
    setErro("");

    Promise.all([buscarProdutos(), buscarLojas()])
      .then(([listaProdutos, listaLojas]) => {
        setProdutos(listaProdutos);
        setLojas(listaLojas);
      })
      .catch((err) =>
        setErro(mensagemDeErro(err, "Não foi possível carregar o feed."))
      )
      .finally(() => setCarregando(false));
  }, []);

  const resultadosProdutos = useMemo(() => {
    if (!termoPesquisa.trim()) return [];

    const todasCategorias = Array.from(
      new Set(produtos.map((p) => p.categoriaSlug))
    );

    return filtrarProdutos(produtos, {
      categoriasAceitas: todasCategorias,
      subcategoria: "",
      busca: termoPesquisa,
      ordenacao: "",
    });
  }, [produtos, termoPesquisa]);

  const resultadosLojas = useMemo(() => {
    if (!termoPesquisa.trim()) return [];

    return filtrarLojas(lojas, {
      busca: termoPesquisa,
      categoriaSlug: "",
    });
  }, [lojas, termoPesquisa]);

  const pesquisando = termoPesquisa.trim().length > 0;

  return (
    <main className="min-h-screen bg-[#F5F4EE] pb-12">
      <section className="bg-black w-full h-[450px] flex items-center relative overflow-hidden px-8 md:px-12">
        <div className="z-10 w-full lg:w-[55%] flex justify-center mt-[-20px]">
          <h1 className="text-white text-5xl md:text-[3.5rem] font-bold leading-[1.1] text-right">
            Do CAOS à organização, <br />
            em alguns cliques
          </h1>
        </div>
        <div className="hidden lg:block absolute bottom-0 right-[5%] w-[450px] xl:w-[550px] h-full overflow-visible">
          <Image
            src="/imagens-feed/stockleefeed.png"
            alt="Ilustração do Feed"
            fill
            sizes="(max-width: 1024px) 100vw, 550px"
            className="object-contain object-bottom scale-[1.3] xl:scale-[1.5] translate-y-[30%]"
          />
        </div>
      </section>

      <section className="px-12 mt-8 max-w-[1440px] mx-auto">
        <div className="relative ml-auto mb-8 w-full md:w-[42%]">
          <input
            type="search"
            value={termoPesquisa}
            onChange={(evento) => setTermoPesquisa(evento.target.value)}
            placeholder="Procurar por..."
            aria-label="Buscar produtos e lojas"
            className="h-11 w-full rounded-full bg-white pl-6 pr-12 text-roxo outline-none placeholder:text-roxo/50 focus:ring-2 focus:ring-roxo/40"
          />
          <Search
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-roxo/60"
          />
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-6">Categoria</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIAS_ATALHO.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="flex flex-col items-center justify-center bg-white min-w-[120px] h-[120px] rounded-3xl shadow-sm hover:shadow-md hover:scale-[1.03] transition-all cursor-pointer"
              >
                <cat.icone
                  className="w-8 h-8 text-purple-600 mb-2"
                  strokeWidth={1.5}
                />
                <span className="text-sm font-medium text-black">
                  {cat.nome}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {erro ? (
          <p className="py-8 text-lg text-red-600">{erro}</p>
        ) : carregando ? (
          <p className="py-8 text-lg font-light text-zinc-600">
            Carregando...
          </p>
        ) : pesquisando ? (
          <div className="flex flex-col gap-12 mb-12">
            {/* Produtos encontrados */}
            <div>
              <h2 className="text-3xl font-bold text-black mb-6">
                Produtos{" "}
                <span className="text-lg font-semibold text-purple-600 ml-1">
                  para &ldquo;{termoPesquisa.trim()}&rdquo;
                </span>
              </h2>

              {resultadosProdutos.length === 0 ? (
                <p className="text-base font-light text-zinc-500">
                  Nenhum produto encontrado para &ldquo;{termoPesquisa.trim()}&rdquo;.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {resultadosProdutos.map((produto) => (
                    <CartaoProdutoFeed key={produto.id} produto={produto} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">
                Lojas{" "}
                <span className="text-lg font-semibold text-purple-600 ml-1">
                  para &ldquo;{termoPesquisa.trim()}&rdquo;
                </span>
              </h2>

              {resultadosLojas.length === 0 ? (
                <p className="text-base font-light text-zinc-500">
                  Nenhuma loja encontrada para &ldquo;{termoPesquisa.trim()}&rdquo;.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-10 gap-x-8 justify-items-center">
                  {resultadosLojas.map((loja) => (
                    <CartaoLojaFeed key={loja.id} loja={loja} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {SECOES_FEED.map((secao) => {
              const itensDaSecao = produtos.filter(
                (p) =>
                  normalizarChave(p.categoriaSlug || "") === secao.slug ||
                  normalizarChave(p.categoriaNome || "") === secao.slug
              );

              return (
                <div key={secao.slug}>
                  <div className="flex justify-between items-end mb-6">
                    <h2 className="text-3xl font-bold text-black">
                      Produtos{" "}
                      <span className="text-lg font-semibold text-purple-600 ml-1">
                        em {secao.nome}
                      </span>
                    </h2>
                    <Link
                      href={`/categoria/${secao.slug}`}
                      className="text-purple-600 text-sm font-semibold hover:underline mb-1 cursor-pointer"
                    >
                      ver mais
                    </Link>
                  </div>

                  {itensDaSecao.length === 0 ? (
                    <p className="text-base font-light text-zinc-500 pb-4">
                      Nenhum produto cadastrado em {secao.nome} ainda.
                    </p>
                  ) : (
                    <CarrosselHorizontal>
                      {itensDaSecao.map((produto) => (
                        <CartaoProdutoFeed key={produto.id} produto={produto} />
                      ))}
                    </CarrosselHorizontal>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <FiltroLojas />
    </main>
  );
}