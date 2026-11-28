"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Apple,
  Baby,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Home,
  Monitor,
  Pill,
  Shirt,
  Sparkles,
  Store,
} from "lucide-react";

import { buscarLojas, type Loja } from "@/lib/lojas";
import { resolverUrlImagem } from "@/lib/produtos";
import { mensagemDeErro } from "@/lib/erro";

const CATEGORIAS_FILTRO = [
  { nome: "Mercado", slug: "mercado", icone: Apple },
  { nome: "Farmácia", slug: "farmacia", icone: Pill },
  { nome: "Beleza", slug: "beleza", icone: Sparkles },
  { nome: "Moda", slug: "moda", icone: Shirt },
  { nome: "Eletrônicos", slug: "eletronicos", icone: Monitor },
  { nome: "Brinquedos", slug: "brinquedos", icone: Baby },
  { nome: "Casa", slug: "casa", icone: Home },
];

function semAcento(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type FiltraLojasProps = {
  lojasExternas?: Loja[];
  categoriasSelecionadas?: string[];
  aoAlterarCategorias?: (novas: string[]) => void;
  modoGrade?: boolean;
  itensPorPagina?: number;
  mostrarVerMais?: boolean;
  semMargemExterna?: boolean;
};

export default function FiltraLojas({
  lojasExternas,
  categoriasSelecionadas: categoriasControladas,
  aoAlterarCategorias,
  modoGrade = false,
  itensPorPagina = 10,
  mostrarVerMais = true,
  semMargemExterna = false,
}: FiltraLojasProps) {
  const [lojasInternas, setLojasInternas] = useState<Loja[]>([]);
  const [carregando, setCarregando] = useState(!lojasExternas);
  const [erro, setErro] = useState("");

  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [categoriasInternas, setCategoriasInternas] = useState<string[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const categoriasAtivas = categoriasControladas ?? categoriasInternas;

  useEffect(() => {
    if (lojasExternas) {
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro("");
    buscarLojas()
      .then(setLojasInternas)
      .catch((err) =>
        setErro(mensagemDeErro(err, "Não foi possível carregar as lojas."))
      )
      .finally(() => setCarregando(false));
  }, [lojasExternas]);

  function alternarFiltro(slugCategoria: string) {
    setPaginaAtual(1);
    const proximas = categoriasAtivas.includes(slugCategoria)
      ? categoriasAtivas.filter((cat) => cat !== slugCategoria)
      : [...categoriasAtivas, slugCategoria];

    if (aoAlterarCategorias) {
      aoAlterarCategorias(proximas);
    } else {
      setCategoriasInternas(proximas);
    }
  }

  const baseLojas = lojasExternas ?? lojasInternas;

  const lojasFiltradas = useMemo(() => {
    if (categoriasAtivas.length === 0) return baseLojas;

    const alvos = new Set(categoriasAtivas.map(semAcento));
    return baseLojas.filter((loja) => {
      const slug = semAcento(loja.categoria?.slug ?? "");
      const nome = semAcento(loja.categoria?.nome ?? "");
      return alvos.has(slug) || alvos.has(nome);
    });
  }, [baseLojas, categoriasAtivas]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(lojasFiltradas.length / itensPorPagina)
  );
  const paginaSegura = Math.min(paginaAtual, totalPaginas);

  const lojasExibidas = useMemo(() => {
    if (!modoGrade) return lojasFiltradas;
    const inicio = (paginaSegura - 1) * itensPorPagina;
    return lojasFiltradas.slice(inicio, inicio + itensPorPagina);
  }, [lojasFiltradas, modoGrade, paginaSegura, itensPorPagina]);

  const nomeCategoriaUnica =
    categoriasAtivas.length === 1
      ? CATEGORIAS_FILTRO.find((c) => c.slug === categoriasAtivas[0])?.nome
      : undefined;

  return (
    <section
      className={
        semMargemExterna ? "w-full" : "px-12 mt-16 max-w-[1440px] mx-auto"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 className="text-3xl font-bold text-black">
          Lojas{" "}
          {nomeCategoriaUnica && (
            <span className="text-sm font-normal text-black">
              em{" "}
              <span className="text-purple-600 font-medium">
                {nomeCategoriaUnica}
              </span>
            </span>
          )}
        </h2>

        <div className="flex items-center gap-6">
          <div className="relative">
            <button
              type="button"
              onClick={() => setFiltrosAbertos((aberto) => !aberto)}
              className="bg-white rounded-full px-6 py-2.5 text-purple-400 flex items-center justify-between w-[300px] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <span className="text-lg">
                {categoriasAtivas.length > 0
                  ? `Filtros (${categoriasAtivas.length})`
                  : "Filtros"}
              </span>
              {filtrosAbertos ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {filtrosAbertos && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-3xl shadow-xl p-4 z-50 border border-gray-100">
                <ul className="flex flex-col gap-3">
                  {CATEGORIAS_FILTRO.map((cat) => (
                    <li key={cat.slug} className="flex items-center gap-3 px-2">
                      <input
                        type="checkbox"
                        id={`filtro-${cat.slug}`}
                        checked={categoriasAtivas.includes(cat.slug)}
                        onChange={() => alternarFiltro(cat.slug)}
                        className="w-5 h-5 rounded-full border-2 border-[#a855f7] appearance-none checked:bg-[#a855f7] cursor-pointer transition-colors shrink-0"
                      />
                      <label
                        htmlFor={`filtro-${cat.slug}`}
                        className="flex items-center gap-2 text-purple-500 cursor-pointer hover:text-purple-700 transition-colors"
                      >
                        {cat.nome}
                        <cat.icone size={16} strokeWidth={2} />
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {mostrarVerMais && (
            <Link
              href="/lojas"
              className="text-purple-600 text-sm font-semibold hover:underline cursor-pointer"
            >
              ver mais
            </Link>
          )}
        </div>
      </div>

      {erro ? (
        <p className="text-red-600 text-sm py-4">{erro}</p>
      ) : carregando ? (
        <p className="text-gray-500 text-sm py-4">Carregando lojas...</p>
      ) : lojasExibidas.length === 0 ? (
        <p className="text-gray-400 text-sm italic py-4">
          Nenhuma loja encontrada para este filtro.
        </p>
      ) : (
        <div
          className={
            modoGrade
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-8 justify-items-center pt-2"
              : "flex gap-8 overflow-x-auto pb-8 pt-2 scrollbar-hide"
          }
        >
          {lojasExibidas.map((loja) => {
            const logo = resolverUrlImagem(loja.logoUrl || loja.fotoUrl);

            return (
              <Link
                key={loja.id}
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
          })}
        </div>
      )}

      {modoGrade && lojasFiltradas.length > 0 && totalPaginas > 1 && (
        <div className="mt-16 flex items-center justify-center gap-6 text-2xl font-light text-black">
          <button
            type="button"
            disabled={paginaSegura === 1}
            onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
            aria-label="Página anterior"
            className="disabled:opacity-30 hover:text-purple-600 cursor-pointer disabled:cursor-default"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
            (pagina) => (
              <button
                key={pagina}
                type="button"
                onClick={() => setPaginaAtual(pagina)}
                className={`cursor-pointer transition-colors ${
                  pagina === paginaSegura
                    ? "font-semibold text-purple-600"
                    : "hover:text-purple-600"
                }`}
              >
                {pagina}
              </button>
            )
          )}

          <button
            type="button"
            disabled={paginaSegura === totalPaginas}
            onClick={() =>
              setPaginaAtual((p) => Math.min(totalPaginas, p + 1))
            }
            aria-label="Próxima página"
            className="disabled:opacity-30 hover:text-purple-600 cursor-pointer disabled:cursor-default"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </div>
      )}
    </section>
  );
}