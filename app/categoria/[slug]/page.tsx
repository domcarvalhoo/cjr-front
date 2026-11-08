import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buscarCategoria, CATEGORIAS } from "@/lib/categorias";
import HeroCategoria from "../../componentes/hero-categoria";
import ListaProdutos from "../../componentes/lista-produtos";

type Props = {
  params: Promise<{ slug: string }>;
};

// implementação da tela de categoria (/categoria/eletronicos)

// gerando as páginas das categorias cadastradas
export function generateStaticParams() {
  return CATEGORIAS.map((categoria) => ({ slug: categoria.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoria = buscarCategoria(slug);

  return { title: categoria ? `STOCK.IO | ${categoria.nome}` : "STOCK.IO" };
}

export default function PaginaCategoria({ params }: Props) {
  // params lido dentro do Suspense, exigência do Next 16
  return (
    <Suspense>
      <ConteudoCategoria params={params} />
    </Suspense>
  );
}

async function ConteudoCategoria({ params }: Props) {
  const { slug } = await params;
  const categoria = buscarCategoria(slug);

  // categoria que não existe
  if (!categoria) notFound();

  return (
    <>
      <HeroCategoria categoria={categoria} />
      <ListaProdutos categoria={categoria} />
    </>
  );
}
