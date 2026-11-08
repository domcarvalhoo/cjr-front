import { api } from "./api";

// implementação de produtos da categoria

// dados que o card usa
export type ProdutoCard = {
    id: string;
    titulo: string;
    preco: number;
    disponivel: boolean;
    imagemUrl: string | null;
    lojaNome: string;
    lojaLogoUrl: string | null;
    categoriaSlug: string;
    criadoEm: string;
};

export type Ordenacao = "" | "menor-preco" | "maior-preco" | "nome";

export const OPCOES_ORDENACAO: { valor: Ordenacao; nome: string }[] = [
    { valor: "", nome: "ordenar por" },
    { valor: "menor-preco", nome: "menor preço" },
    { valor: "maior-preco", nome: "maior preço" },
    { valor: "nome", nome: "nome (a-z)" },
];

// resposta do back em GET /produto, só o que usamos
type ProdutoDaApi = {
    id: string;
    titulo: string;
    // decimal chega como texto
    preco: string | number;
    estoque: number;
    status: string;
    criadoEm: string;
    categoria: { slug: string };
    loja: { nome: string; logoUrl: string | null };
    imagens?: { url: string; ordem: number }[];
};

// convertendo produto da api para o card
function paraCard(produto: ProdutoDaApi): ProdutoCard {
    const primeiraImagem = [...(produto.imagens ?? [])].sort((a, b) => a.ordem - b.ordem)[0];

    return {
        id: produto.id,
        titulo: produto.titulo,
        preco: Number(produto.preco),
        disponivel: produto.estoque > 0,
        imagemUrl: primeiraImagem?.url ?? null,
        lojaNome: produto.loja.nome,
        lojaLogoUrl: produto.loja.logoUrl,
        categoriaSlug: produto.categoria.slug,
        criadoEm: produto.criadoEm,
    };
}

// única chamada ao back da tela.
// o back ainda não filtra, então filtramos aqui
export async function buscarProdutos() {
    const resposta = await api.get<ProdutoDaApi[]>("/produto");

    return resposta.data
        // só produto ativo aparece
        .filter((produto) => produto.status === "ATIVO")
        .map(paraCard);
}

// busca sem acento e sem maiúscula
function semAcento(texto: string) {
    return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

type Filtros = {
    // categoria da tela + subcategorias
    categoriasAceitas: string[];
    subcategoria: string;
    busca: string;
    ordenacao: Ordenacao;
};

// aplicando busca, filtro e ordenação
export function filtrarProdutos(produtos: ProdutoCard[], filtros: Filtros) {
    const busca = semAcento(filtros.busca.trim());

    const resultado = produtos.filter((produto) => {
        if (!filtros.categoriasAceitas.includes(produto.categoriaSlug)) return false;
        if (filtros.subcategoria && produto.categoriaSlug !== filtros.subcategoria) return false;
        if (busca && !semAcento(produto.titulo).includes(busca)) return false;
        return true;
    });

    // padrão: mais novos primeiro
    return resultado.sort((a, b) => {
        if (filtros.ordenacao === "menor-preco") return a.preco - b.preco;
        if (filtros.ordenacao === "maior-preco") return b.preco - a.preco;
        if (filtros.ordenacao === "nome") return a.titulo.localeCompare(b.titulo, "pt-BR");
        return b.criadoEm.localeCompare(a.criadoEm);
    });
}

// formato R$3.899,99, igual ao layout
export function formatarPreco(valor: number) {
    const numero = valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `R$${numero}`;
}
