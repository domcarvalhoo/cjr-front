import { api } from "./api";
import type { Loja } from "./lojas";
import type { ProdutoCard } from "./produtos";

// produtos da tela de perfil (rota GET /loja/usuario/:usuarioId, que traz as lojas da pessoa com os produtos)

type ProdutoDaLoja = {
    id: number;
    titulo: string;
    // decimal chega como texto
    preco: string | number;
    estoque: number;
    criadoEm: string;
    imagens: { url: string }[];
};

export type LojaDoPerfil = Loja & { produtos: ProdutoDaLoja[] };

// imagem salva no back vem como "/uploads/..."; link externo ja vem completo
export function urlDeImagem(caminho: string | null | undefined) {
    if (!caminho) return null;
    return caminho.startsWith("http") ? caminho : `${process.env.NEXT_PUBLIC_API_URL}${caminho}`;
}

// produtos de todas as lojas da pessoa, no formato do card, mais novos primeiro
export async function produtosDaPessoa(usuarioId: number): Promise<ProdutoCard[]> {
    const { data: lojas } = await api.get<LojaDoPerfil[]>(`/loja/usuario/${usuarioId}`);
    return lojas
        .flatMap((loja) =>
            loja.produtos.map((produto) => ({
                id: produto.id,
                titulo: produto.titulo,
                preco: Number(produto.preco),
                disponivel: produto.estoque > 0,
                imagemUrl: urlDeImagem(produto.imagens[0]?.url),
                lojaNome: loja.nome,
                lojaLogoUrl: urlDeImagem(loja.logoUrl ?? loja.fotoUrl),
                categoriaSlug: loja.categoria?.slug ?? "",
                criadoEm: produto.criadoEm,
            })),
        )
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}
