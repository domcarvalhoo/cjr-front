// implementação de categorias

export type FiltroCategoria = {
    nome: string;
    // slug da subcategoria no banco
    slug: string;
};

export type CategoriaTela = {
    slug: string;
    nome: string;
    // frase do banner, o destaque fica em negrito
    tituloInicio: string;
    destaque: string;
    tituloFim: string;
    // botões de filtro abaixo da busca
    filtros: FiltroCategoria[];
};

// nova categoria: é só adicionar um item aqui
export const CATEGORIAS: CategoriaTela[] = [
    {
        slug: "eletronicos",
        nome: "Eletrônicos",
        tituloInicio: "O universo da",
        destaque: "tecnologia",
        tituloFim: "em um só lugar",
        filtros: [
            { nome: "Celulares", slug: "celulares" },
            { nome: "Notebooks", slug: "notebooks" },
            { nome: "TVs", slug: "tvs" },
            { nome: "Acessórios", slug: "acessorios" },
            { nome: "Outros", slug: "outros" },
        ],
    },
];

export function buscarCategoria(slug: string) {
    return CATEGORIAS.find((categoria) => categoria.slug === slug);
}
