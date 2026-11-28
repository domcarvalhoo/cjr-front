"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Gamepad2,
  Home,
  Laptop,
  Pill,
  Search,
  Shirt,
  ShoppingBasket,
  Sparkles,
  ToyBrick,
} from "lucide-react";

import { buscarLojas, filtrarLojas, type Loja } from "@/lib/lojas";
import { mensagemDeErro } from "@/lib/erro";
import FiltraLojas from "@/components/filtrolojas";

const CATEGORIAS_TOPO = [
  { nome: "Mercado", slug: "mercado", icone: <ShoppingBasket className="h-9 w-9 text-[#6338F6]" strokeWidth={1.6} /> },
  { nome: "Farmácia", slug: "farmacia", icone: <Pill className="h-9 w-9 text-[#6338F6]" strokeWidth={1.6} /> },
  { nome: "Beleza", slug: "beleza", icone: <Sparkles className="h-9 w-9 text-[#6338F6]" strokeWidth={1.6} /> },
  { nome: "Moda", slug: "moda", icone: <Shirt className="h-9 w-9 text-[#6338F6]" strokeWidth={1.6} /> },
  { nome: "Eletrônicos", slug: "eletronicos", icone: <Laptop className="h-9 w-9 text-[#6338F6]" strokeWidth={1.6} /> },
  { nome: "Jogos", slug: "jogos", icone: <Gamepad2 className="h-9 w-9 text-[#6338F6]" strokeWidth={1.6} /> },
  { nome: "Brinquedos", slug: "brinquedos", icone: <ToyBrick className="h-9 w-9 text-[#6338F6]" strokeWidth={1.6} /> },
  { nome: "Casa", slug: "casa", icone: <Home className="h-9 w-9 text-[#6338F6]" strokeWidth={1.6} /> },
];

function ConteudoLojas() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoriaNaUrl = searchParams.get("categoria") ?? "";

  const [lojas, setLojas] = useState<Loja[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>(
    categoriaNaUrl ? [categoriaNaUrl] : []
  );

  useEffect(() => {
    setCategoriasSelecionadas(categoriaNaUrl ? [categoriaNaUrl] : []);
  }, [categoriaNaUrl]);

  useEffect(() => {
    setCarregando(true);
    setErro("");

    buscarLojas()
      .then(setLojas)
      .catch((err) =>
        setErro(mensagemDeErro(err, "Não foi possível carregar as lojas."))
      )
      .finally(() => setCarregando(false));
  }, []);

  function atualizarCategorias(novas: string[]) {
    setCategoriasSelecionadas(novas);
    if (novas.length === 1) {
      router.replace(`/lojas?categoria=${novas[0]}`);
    } else {
      router.replace("/lojas");
    }
  }

  // Aplica a mesma lógica de pesquisa sem acento antes de entregar ao FiltraLojas
  const lojasPesquisadas = useMemo(
    () => filtrarLojas(lojas, { busca, categoriaSlug: "" }),
    [lojas, busca]
  );

  return (
    <div className="min-h-screen bg-[#F5F2E6] pb-20">
      {/* SEÇÃO SUPERIOR PRETA: Categorias que direcionam para lojas da categoria */}
      <section className="w-full bg-black text-white px-8 md:px-20 pt-10 pb-14">
        <div className="max-w-[1340px] mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-medium tracking-tight">Categoria</h1>
            {categoriasSelecionadas.length > 0 && (
              <button
                type="button"
                onClick={() => atualizarCategorias([])}
                className="text-sm text-[#c4f000] hover:underline cursor-pointer"
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div className="mt-8 flex items-center gap-6 overflow-x-auto pb-2 [scrollbar-width:none]">
            {CATEGORIAS_TOPO.map((cat) => {
              const ativa = categoriasSelecionadas.includes(cat.slug);
              return (
                <Link
                  key={cat.slug}
                  href={ativa ? "/lojas" : `/lojas?categoria=${cat.slug}`}
                  className={`w-[122px] h-[122px] shrink-0 rounded-[32px] bg-white flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    ativa
                      ? "ring-4 ring-[#c4f000] scale-[1.03]"
                      : "hover:scale-[1.03] opacity-95 hover:opacity-100"
                  }`}
                >
                  {cat.icone}
                  <span className="text-sm font-medium text-black">
                    {cat.nome}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEÇÃO INFERIOR BEGE: Barra de Pesquisa + Componente FiltraLojas */}
      <section className="max-w-[1340px] mx-auto px-8 md:px-20 pt-10">
        <div className="relative ml-auto mb-6 w-full md:w-[42%]">
          <input
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Procurar por..."
            aria-label="Buscar lojas"
            className="h-11 w-full rounded-full bg-white pl-6 pr-12 text-[#6338F6] outline-none placeholder:text-[#6338F6]/50 focus:ring-2 focus:ring-[#6338F6]/40"
          />
          <Search
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6338F6]/60"
          />
        </div>

        {erro ? (
          <p className="py-12 text-center text-lg text-red-600">{erro}</p>
        ) : carregando ? (
          <p className="py-12 text-center text-lg font-light text-zinc-600">
            Carregando lojas...
          </p>
        ) : (
          <FiltraLojas
            lojasExternas={lojasPesquisadas}
            categoriasSelecionadas={categoriasSelecionadas}
            aoAlterarCategorias={atualizarCategorias}
            modoGrade
            mostrarVerMais={false}
            semMargemExterna
          />
        )}
      </section>
    </div>
  );
}

export default function PaginaLojas() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2E6] text-zinc-600">
          Carregando lojas...
        </div>
      }
    >
      <ConteudoLojas />
    </Suspense>
  );
}