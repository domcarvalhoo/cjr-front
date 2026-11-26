import { api } from "./api";

export type AvaliacaoPerfil = {
  id: string;
  tipo: "loja" | "produto";
  nota: number;
  comentario: string | null;
  criadoEm: string;
  usuarioId: string;
  usuario?: {
    id: string;
    nome: string;
    nomeUsuario: string;
    fotoUrl: string | null;
  };
};

type AvaliacaoApi = Omit<AvaliacaoPerfil, "tipo">;

export async function avaliacoesDoUsuario(usuarioId: string): Promise<AvaliacaoPerfil[]> {
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