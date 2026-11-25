"use client";

import { useRef, useState } from "react";

// cor dos detalhes do modal no figma ("azul-stock")
const azulStock = "#6a38f3";

type CampoArquivoProps = {
  texto: string;
  // tipos aceitos no seletor de arquivos, ex.: "image/png,image/jpeg"
  aceita: string;
  // "arquivo" = folha com seta (foto e logo); "imagem" = folha com circulo (banner)
  icone: "arquivo" | "imagem";
  arquivo: File | null;
  aoEscolher: (arquivo: File) => void;
};

// icones do figma (46 x 57.5): folha com o canto dobrado e uma seta para cima
function IconeUpload({ tipo }: { tipo: CampoArquivoProps["icone"] }) {
  return (
    <svg width="46" height="57.5" viewBox="0 0 46 57.5" aria-hidden className="shrink-0">
      <path d="M5 0H29.5L46 16.5V52.5A5 5 0 0 1 41 57.5H5A5 5 0 0 1 0 52.5V5A5 5 0 0 1 5 0Z" fill={azulStock} />
      {tipo === "arquivo" ? (
        <>
          <path d="M26 4.5V19H42Z" fill="white" />
          <path d="M23 27.5L35 39.5H28.5V47H17.5V39.5H11Z" fill="white" />
        </>
      ) : (
        <>
          <circle cx="31" cy="15.5" r="4.5" fill="white" />
          <path d="M23 30.5L32 39H27.5V47H18.5V39H14Z" fill="white" />
        </>
      )}
    </svg>
  );
}

// implementacao da area de anexo do modal: clica ou arrasta o arquivo para dentro
export default function CampoArquivo({ texto, aceita, icone, arquivo, aoEscolher }: CampoArquivoProps) {
  const entrada = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);

  function receber(lista: FileList | null) {
    const escolhido = lista?.[0];
    if (escolhido) aoEscolher(escolhido);
  }

  return (
    <>
    <button
      type="button"
      onClick={() => entrada.current?.click()}
      onDragOver={(evento) => {
        evento.preventDefault();
        setArrastando(true);
      }}
      onDragLeave={() => setArrastando(false)}
      onDrop={(evento) => {
        evento.preventDefault();
        setArrastando(false);
        receber(evento.dataTransfer.files);
      }}
      className={`relative flex h-[150px] w-full flex-col items-center rounded-[10px] pt-[28px] transition-colors sm:h-[177px] sm:pt-[36.5px] ${
        arrastando ? "bg-[#6a38f3]/10" : "hover:bg-[#6a38f3]/5"
      }`}
    >
      {/* borda tracejada igual ao figma: 2px, tracos de 30 e espacos de 30 */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <rect
          width="100%"
          height="100%"
          rx="10"
          fill="none"
          stroke={azulStock}
          strokeWidth="2"
          strokeDasharray="30 30"
        />
      </svg>

      <IconeUpload tipo={icone} />

      {/* depois de escolher, o nome do arquivo aparece no lugar do texto */}
      <span className="mt-[14px] max-w-full truncate px-4 text-[18px] font-light text-black sm:mt-[19.5px] sm:text-[25px]">
        {arquivo ? arquivo.name : texto}
      </span>
    </button>

    {/* seletor de arquivos escondido, aberto pelo clique na area */}
    <input
      ref={entrada}
      type="file"
      accept={aceita}
      className="hidden"
      onChange={(evento) => {
        receber(evento.target.files);
        // limpa para conseguir escolher o mesmo arquivo de novo
        evento.target.value = "";
      }}
    />
    </>
  );
}
