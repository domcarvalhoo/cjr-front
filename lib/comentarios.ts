import { api } from "./api";

export type UsuarioComentario = {
  id: string;
  nome: string;
  nomeUsuario: string;
  fotoUrl: string | null;
};

export type Comentario = {
  id: string;
  texto: string;
  criadoEm: string;
  atualizadoEm: string;
  usuarioId: string;
  avaliacaoLojaId?: string | null;
  avaliacaoProdutoId?: string | null;
  produtoId?: string | null;
  usuario: UsuarioComentario;
};

export type FiltrosComentario = {
  avaliacaoLojaId?: string;
  avaliacaoProdutoId?: string;
  produtoId?: string;
};

export type NovoComentario = FiltrosComentario & {
  texto: string;
};

// POST /comentario
export async function criarComentario(dados: NovoComentario) {
  const resposta = await api.post<Comentario>("/comentario", dados);
  return resposta.data;
}

// GET /comentario?avaliacaoLojaId=... — lista os comentários do destino
export async function listarComentarios(filtros: FiltrosComentario) {
  const resposta = await api.get<Comentario[]>("/comentario", {
    params: filtros,
  });
  return resposta.data;
}

// GET /comentario/:id
export async function buscarComentarioPorId(id: string) {
  const resposta = await api.get<Comentario>(`/comentario/${id}`);
  return resposta.data;
}

// PATCH /comentario/:id
export async function editarComentario(id: string, texto: string) {
  const resposta = await api.patch<Comentario>(`/comentario/${id}`, { texto });
  return resposta.data;
}

// DELETE /comentario/:id
export async function excluirComentario(id: string) {
  const resposta = await api.delete<{ mensagem: string }>(`/comentario/${id}`);
  return resposta.data;
}