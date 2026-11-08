// token de login guardado em cookie.
// o layout lê o mesmo cookie para mostrar a navbar logada
const NOME_COOKIE = "auth_token";

// mesma validade do token no back (1 dia)
const VALIDADE_SEGUNDOS = 60 * 60 * 24;

export function salvarToken(token: string) {
    // em https o cookie é seguro
    const seguro = location.protocol === "https:" ? "; Secure" : "";

    document.cookie = `${NOME_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${VALIDADE_SEGUNDOS}; SameSite=Lax${seguro}`;
}

export function lerToken() {
    if (typeof document === "undefined") return null;

    const cookie = document.cookie
        .split("; ")
        .find((item) => item.startsWith(`${NOME_COOKIE}=`));

    return cookie ? decodeURIComponent(cookie.slice(NOME_COOKIE.length + 1)) : null;
}

export function limparToken() {
    document.cookie = `${NOME_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
