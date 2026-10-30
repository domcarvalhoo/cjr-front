import axios from "axios";

// pega a mensagem de erro que o back devolveu, ou usa a mensagem padrão
export function mensagemDeErro(erro: unknown, padrao: string) {
    if (axios.isAxiosError(erro)) {
        const mensagem = erro.response?.data?.message;
        return Array.isArray(mensagem) ? mensagem[0] : (mensagem ?? padrao);
    }
    return padrao;
}
