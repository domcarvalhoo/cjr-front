import { api } from "./api";

// implementacao das chamadas de loja (rotas em back/docs/lojas.md)

export type Loja = {
    id: string;
    nome: string;
    // endereco da loja, ex.: "casa-do-cafe"
    slug: string;
    descricao: string | null;
    // caminhos das imagens no back, ex.: "/uploads/lojas/<arquivo>.png"
    fotoUrl: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    emailContato: string;
    telefone: string | null;
    cnpj: string | null;
    status: string;
    criadoEm: string;
    categoria: CategoriaLoja | null;
};

export type CategoriaLoja = {
    id: string;
    nome: string;
    slug: string;
};

// o que o modal "adicionar loja" manda (imagens sao opcionais)
export type NovaLoja = {
    nome: string;
    categoriaId: string;
    foto: File | null;
    logo: File | null;
    banner: File | null;
};

// vai como formdata porque leva as imagens junto
export async function criarLoja(dados: NovaLoja) {
    const formulario = new FormData();
    formulario.append("nome", dados.nome);
    formulario.append("categoriaId", dados.categoriaId);

    for (const campo of ["foto", "logo", "banner"] as const) {
        const arquivo = dados[campo];
        if (arquivo) formulario.append(campo, arquivo);
    }

    const resposta = await api.post<Loja>("/loja", formulario);
    return resposta.data;
}

// categorias que uma loja pode ter: so as principais e ativas (sem subcategorias)
export async function categoriasDaLoja() {
    const resposta = await api.get<(CategoriaLoja & { paiId: string | null; ativa: boolean })[]>(
        "/categoria",
    );

    return resposta.data
        .filter((categoria) => !categoria.paiId && categoria.ativa)
        .map(({ id, nome, slug }) => ({ id, nome, slug }));
}
