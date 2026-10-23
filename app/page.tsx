
"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    alert("Seja bem-vindo ao STOCK.IO!");
  }

  return (
    <main className="login-page">
      <section className="illustration-section">
        <a href="/" className="logo-container">
          <img
            src="/imagens-tela-inicial/LOGO-inicial.png"
            alt="STOCK.IO LOGO"
            className="logo"
          />
        </a>

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
          <h1>BEM VINDO DE VOLTA!</h1>

          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              name="email"
              placeholder="Email"
              aria-label="Email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <div className="password-container">
              <input
                type={mostrarSenha ? "text" : "password"}
                name="senha"
                placeholder="Senha"
                aria-label="Senha"
                autoComplete="current-password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? (
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
                    <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 9 5 9 7a10.8 10.8 0 01-3 3.7M6.2 6.2C3.8 7.8 3 10.2 3 12c0 2 4 7 9 7a10.7 10.7 0 004-.8" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <a href="/recuperar-senha" className="forgot-password">
              Esqueceu sua senha?
            </a>

            <button type="submit" className="login-button">
              ENTRAR
            </button>
          </form>

          <p className="register-text">
            Não possui uma conta?{" "}
            <a href="/cadastro">Cadastre-se</a>
          </p>
        </div>
      </section>
    </main>
  );
}