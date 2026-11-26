import { api } from "./api";

// chamadas da propria conta (rotas /user/me no back)

export type DadosPerfil = {
    nome: string;
    nomeUsuario: string;
    email: string;
};

export type UsuarioAtualizado = DadosPerfil & { id: number; fotoUrl: string | null };

// manda so os campos alterados
export async function atualizarPerfil(dados: Partial<DadosPerfil>) {
    const resposta = await api.patch<UsuarioAtualizado>("/user/me", dados);
    return resposta.data;
}

export async function trocarFoto(arquivo: File) {
    const formulario = new FormData();
    formulario.append("foto", arquivo);
    const resposta = await api.patch<{ fotoUrl: string }>("/user/me/foto", formulario);
    return resposta.data.fotoUrl;
}

export async function alterarSenha(senhaAtual: string, novaSenha: string) {
    await api.patch("/user/me/senha", { senhaAtual, novaSenha });
}

// o back tambem apaga o cookie do login
export async function excluirConta() {
    await api.delete("/user/me");
}
