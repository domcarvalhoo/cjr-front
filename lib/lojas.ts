import { api } from "./api";

// implementacao das chamadas de loja (rotas em back/docs/lojas.md)

export type Loja = {
    id: number;
    nome: string;
    slug: string;
    descricao: string | null;
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
    id: number;
    nome: string;
    slug: string;
};

// o que o modal "adicionar loja" manda (imagens sao opcionais)
export type NovaLoja = {
    nome: string;
    categoriaId: number;
    foto: File | null;
    logo: File | null;
    banner: File | null;
};

// todas as lojas ativas do banco (tela /lojas)
export async function buscarLojas() {
    const resposta = await api.get<Loja[]>("/loja");
    return resposta.data;
}

export async function minhasLojas() {
    const resposta = await api.get<Loja[]>("/loja/minhas");
    return resposta.data;
}

// vai como formdata porque leva as imagens junto
export async function criarLoja(dados: NovaLoja) {
    const formulario = new FormData();
    formulario.append("nome", dados.nome);
    formulario.append("categoriaId", String(dados.categoriaId));

    for (const campo of ["foto", "logo", "banner"] as const) {
        const arquivo = dados[campo];
        if (arquivo) formulario.append(campo, arquivo);
    }

    const resposta = await api.post<Loja>("/loja", formulario);
    return resposta.data;
}

// categorias que uma loja pode ter: so as principais e ativas (sem subcategorias)
export async function categoriasDaLoja() {
    const resposta = await api.get<(CategoriaLoja & { paiId: number | null; ativa: boolean })[]>(
        "/categoria",
    );

    return resposta.data
        .filter((categoria) => !categoria.paiId && categoria.ativa)
        .map(({ id, nome, slug }) => ({ id, nome, slug }));
}

// busca sem acento e sem maiuscula
function semAcento(texto: string) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

type FiltrosLoja = {
    busca: string;
    categoriaSlug: string;
};

// aplicando busca por texto e filtro por categoria nas lojas
export function filtrarLojas(lojas: Loja[], filtros: FiltrosLoja) {
    const termo = semAcento(filtros.busca);
    const catAlvo = semAcento(filtros.categoriaSlug);

    return lojas.filter((loja) => {
        if (catAlvo) {
            const slugLoja = semAcento(loja.categoria?.slug ?? "");
            const nomeCatLoja = semAcento(loja.categoria?.nome ?? "");
            if (slugLoja !== catAlvo && nomeCatLoja !== catAlvo) return false;
        }

        if (termo) {
            const nome = semAcento(loja.nome);
            const categoria = semAcento(loja.categoria?.nome ?? "");
            const descricao = semAcento(loja.descricao ?? "");
            if (
                !nome.includes(termo) &&
                !categoria.includes(termo) &&
                !descricao.includes(termo)
            ) {
                return false;
            }
        }

        return true;
    });
}