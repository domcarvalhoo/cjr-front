<<<<<<< HEAD
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
=======
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
>>>>>>> 4582bab4f5558b792f24607f2b642c40d04384f6
