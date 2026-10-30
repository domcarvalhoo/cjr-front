import Link from "next/link";

// estrutura comum das telas de login, recuperação e redefinição de senha:
// logo e personagem de um lado, cartão escuro com o formulário do outro
export default function TelaAuth({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <main className="login-page">
      <section className="illustration-section">
        <Link href="/" className="logo-container">
          <img
            src="/imagens-tela-inicial/LOGO-inicial.png"
            alt="STOCK.IO LOGO"
            className="logo"
          />
        </Link>

        <div className="character-container">
          <img
            src="/imagens-tela-inicial/personagem-inicial.png"
            alt="Personagem STOCK.IO"
            className="character"
          />
        </div>
      </section>

      <section className="login-section">
        <div className="login-card">
          <h1>{titulo}</h1>
          {children}
        </div>
      </section>
    </main>
  );
}
