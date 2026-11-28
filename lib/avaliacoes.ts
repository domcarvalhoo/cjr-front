import { api } from "./api";

export type AvaliacaoPerfil = {
  id: number;
  tipo: "loja" | "produto";
  nota: number;
  comentario: string | null;
  criadoEm: string;
  usuarioId: number;
  usuario?: {
    id: number;
    nome: string;
    nomeUsuario: string;
    fotoUrl: string | null;
  };
};

type AvaliacaoApi = Omit<AvaliacaoPerfil, "tipo">;

export async function avaliacoesDoUsuario(usuarioId: number): Promise<AvaliacaoPerfil[]> {
  const [resLojas, resProdutos] = await Promise.all([
    api.get<AvaliacaoApi[]>("/avaliacoes/lojas").catch(() => ({ data: [] as AvaliacaoApi[] })),
    api.get<AvaliacaoApi[]>("/avaliacoes/produtos").catch(() => ({ data: [] as AvaliacaoApi[] })),
  ]);

  const deLojas: AvaliacaoPerfil[] = resLojas.data
    .filter((item) => item.usuarioId === usuarioId)
    .map((item) => ({ ...item, tipo: "loja" }));

  const deProdutos: AvaliacaoPerfil[] = resProdutos.data
    .filter((item) => item.usuarioId === usuarioId)
    .map((item) => ({ ...item, tipo: "produto" }));

  return [...deLojas, ...deProdutos].sort(
    (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
  );
}

export async function criarAvaliacaoLoja(dados: {
  usuarioId: number;
  lojaId: number;
  nota: number;
  comentario?: string;
}) {
  const resposta = await api.post("/avaliacoes/lojas", dados);
  return resposta.data;
}

export async function editarAvaliacaoLoja(
  id: number,
  dados: { nota?: number; comentario?: string }
) {
  const resposta = await api.patch(`/avaliacoes/lojas/${id}`, dados);
  return resposta.data;
}

export async function excluirAvaliacaoLoja(id: number) {
  await api.delete(`/avaliacoes/lojas/${id}`);
}

export async function criarAvaliacaoProduto(dados: {
  usuarioId: number;
  produtoId: number;
  nota: number;
  comentario?: string;
}) {
  const resposta = await api.post("/avaliacoes/produtos", dados);
  return resposta.data;
}

export async function editarAvaliacaoProduto(
  id: number,
  dados: { nota?: number; comentario?: string }
) {
  const resposta = await api.patch(`/avaliacoes/produtos/${id}`, dados);
  return resposta.data;
}

export async function excluirAvaliacaoProduto(id: string | number) {
  await api.delete(`/avaliacoes/produtos/${id}`);
}
