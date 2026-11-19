import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import TelaComentariosAvaliacao from '@/components/tela-comentario';

type Props = {
  params: Promise<{ id: string }>;
};

export default function PaginaDetalhesAvaliacao({ params }: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white p-10">Carregando...</div>}>
      <ConteudoAvaliacao params={params} />
    </Suspense>
  );
}

async function ConteudoAvaliacao({ params }: Props) {
  const { id } = await params;

  const resposta = await fetch(`http://localhost:3001/avaliacoes-produto/${id}`, {
    cache: 'no-store',
  });

  if (!resposta.ok) {
    notFound();
  }

  const avaliacao = await resposta.json();

  return (
    <TelaComentariosAvaliacao
      avaliacao={avaliacao}
      donoDaLojaId={avaliacao.loja?.donoId}
    />
  );
}