// guarda o token de login no navegador
const CHAVE_TOKEN = "token";

export function salvarToken(token: string) {
    localStorage.setItem(CHAVE_TOKEN, token);
}

export function lerToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(CHAVE_TOKEN);
}

export function limparToken() {
    localStorage.removeItem(CHAVE_TOKEN);
}
