"use client";

import { useState } from "react";

type CampoSenhaProps = {
  name: string;
  placeholder: string;
  value: string;
  onChange: (valor: string) => void;
  autoComplete: "current-password" | "new-password";
};

// campo de senha com botão para mostrar ou esconder o texto
export default function CampoSenha({
  name,
  placeholder,
  value,
  onChange,
  autoComplete,
}: CampoSenhaProps) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className="password-container">
      <input
        type={mostrar ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      />

      <button
        type="button"
        className="toggle-password"
        onClick={() => setMostrar(!mostrar)}
        aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
      >
        {mostrar ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
            <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 9 5 9 7a10.8 10.8 0 01-3 3.7M6.2 6.2C3.8 7.8 3 10.2 3 12c0 2 4 7 9 7a10.7 10.7 0 004-.8" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
