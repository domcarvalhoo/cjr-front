import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buscarCategoria, CATEGORIAS, type CategoriaTela } from "@/lib/categorias";
import HeroCategoria from "../../componentes/hero-categoria";
import ListaProdutos from "../../componentes/lista-produtos";

type Props = {
  params: Promise<{ slug: string }>;
};

type CategoriaApi = {
  id: number;
  nome: string;
  slug: string;
  ativa: boolean;
  filhas?: { id: number; nome: string; slug: string; ativa: boolean }[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function resolverCategoria(slug: string): Promise<CategoriaTela | null> {
  const baseLocal = buscarCategoria(slug);

  try {
    const res = await fetch(`${API_URL}/categoria`, { cache: "no-store" });
    if (!res.ok) return baseLocal ?? null;

    const doBanco: CategoriaApi[] = await res.json();
    const encontrada = doBanco.find(
      (c) => c.ativa && c.slug.toLowerCase() === slug.toLowerCase(),
    );

    if (!encontrada) return baseLocal ?? null;

    const filtrosBanco = (encontrada.filhas ?? [])
      .filter((f) => f.ativa)
      .map((f) => ({ nome: f.nome, slug: f.slug }));

    if (baseLocal) {
      return {
        ...baseLocal,
        nome: encontrada.nome,
        filtros: filtrosBanco.length > 0 ? filtrosBanco : baseLocal.filtros,
      };
    }

    return {
      slug: encontrada.slug,
      nome: encontrada.nome,
      filtros: filtrosBanco,
    } as CategoriaTela;
  } catch {
    return baseLocal ?? null;
  }
}

export function generateStaticParams() {
  return CATEGORIAS.map((categoria) => ({ slug: categoria.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoria = await resolverCategoria(slug);

  return { title: categoria ? `STOCK.IO | ${categoria.nome}` : "STOCK.IO" };
}

export default function PaginaCategoria({ params }: Props) {
  return (
    <Suspense>
      <ConteudoCategoria params={params} />
    </Suspense>
  );
}

async function ConteudoCategoria({ params }: Props) {
  const { slug } = await params;
  const categoria = await resolverCategoria(slug);

  if (!categoria) notFound();

  return (
    <>
      <HeroCategoria categoria={categoria} />
      <ListaProdutos categoria={categoria} />
    </>
  );
}