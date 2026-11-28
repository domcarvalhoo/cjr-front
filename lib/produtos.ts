import { api } from "./api";
import { minhasLojas, type Loja } from "./lojas";

// implementação de produtos da categoria

export type ImagemProduto = {
  id: number;
  url: string;
};

// dados que o card usa
export type ProdutoCard = {
    id: number;
    lojaId?: number;
    titulo: string;
    preco: number;
    disponivel: boolean;
    imagemUrl: string | null;
    lojaNome: string;
    lojaLogoUrl: string | null;
    categoriaSlug: string;
    categoriaNome: string;
    criadoEm: string;
};

export type Ordenacao = "" | "menor-preco" | "maior-preco" | "nome";

export const OPCOES_ORDENACAO: { valor: Ordenacao; nome: string }[] = [
    { valor: "", nome: "ordenar por" },
    { valor: "menor-preco", nome: "menor preço" },
    { valor: "maior-preco", nome: "maior preço" },
    { valor: "nome", nome: "nome (a-z)" },
];

// resposta do back em GET /produto
type ProdutoDaApi = {
    id: number;
    lojaId?: number;
    titulo: string;
    // decimal chega como texto
    preco: string | number;
    estoque: number;
    status: string;
    criadoEm: string;
    categoria: { nome: string; slug: string };
    loja: {
        id?: number;
        nome: string;
        logoUrl: string | null;
        fotoUrl?: string | null;
    };
    imagens?: { url: string; ordem: number }[];
};

// convertendo produto da api para o card
function paraCard(produto: ProdutoDaApi): ProdutoCard {
    const primeiraImagem = [...(produto.imagens ?? [])].sort((a, b) => a.ordem - b.ordem)[0];

    return {
        id: produto.id,
        lojaId: produto.lojaId ?? produto.loja?.id,
        titulo: produto.titulo,
        preco: Number(produto.preco),
        disponivel: produto.estoque > 0,
        imagemUrl: primeiraImagem?.url ?? null,
        lojaNome: produto.loja.nome,
        lojaLogoUrl: produto.loja.logoUrl ?? produto.loja.fotoUrl ?? null,
        categoriaSlug: produto.categoria.slug,
        categoriaNome: produto.categoria.nome,
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

// busca os produtos pertencentes às lojas do usuário logado (para o perfil)
export async function produtosDasMinhasLojas(lojasJaCarregadas?: Loja[]): Promise<ProdutoCard[]> {
    const lojas = lojasJaCarregadas ?? (await minhasLojas());
    if (lojas.length === 0) return [];

    const idsLojas = new Set(lojas.map((l) => l.id));
    const nomesLojas = new Set(lojas.map((l) => l.nome));
    const mapaLojas = new Map(lojas.map((l) => [l.id, l]));

    const resposta = await api.get<ProdutoDaApi[]>("/produto");

    return resposta.data
        .filter((produto) => {
            const idLojaProduto = produto.lojaId ?? produto.loja?.id;
            if (idLojaProduto !== undefined) {
                return idsLojas.has(idLojaProduto);
            }
            return nomesLojas.has(produto.loja.nome);
        })
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
        .map((produto) => {
            const card = paraCard(produto);
            const lojaDoMapa = card.lojaId !== undefined ? mapaLojas.get(card.lojaId) : undefined;

            return {
                ...card,
                lojaLogoUrl: card.lojaLogoUrl ?? lojaDoMapa?.logoUrl ?? lojaDoMapa?.fotoUrl ?? null,
            };
        });
}

// monta a URL completa da imagem vinda do backend ou mantém caminhos locais
export function resolverUrlImagem(caminho?: string | null): string | null {
    if (!caminho) return null;
    if (caminho.startsWith("http") || caminho.startsWith("/imagens-")) {
        return caminho;
    }
    if (caminho.startsWith("/")) {
        return `${process.env.NEXT_PUBLIC_API_URL}${caminho}`;
    }
    return `${process.env.NEXT_PUBLIC_API_URL}/${caminho}`;
}

// busca sem acento e sem maiúscula
function semAcento(texto: string) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
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