"use client";

import { useEffect, useRef, useState } from "react";

import { mensagemDeErro } from "@/lib/erro";
import { categoriasDaLoja, criarLoja, type CategoriaLoja, type Loja } from "@/lib/lojas";
import CampoArquivo from "./campo-arquivo";
import Modal from "./modal";

const anexos = [
  {
    campo: "foto",
    texto: "Anexe a foto de perfil de sua loja",
    aceita: "image/jpeg,image/png,image/webp",
    icone: "arquivo",
    erro: "A foto de perfil deve ser JPG, PNG ou WEBP.",
  },
  {
    campo: "logo",
    texto: "Anexe a logo em SVG de sua loja",
    aceita: "image/svg+xml",
    icone: "arquivo",
    erro: "A logo deve ser um arquivo SVG.",
  },
  {
    campo: "banner",
    texto: "Anexe o banner de sua loja",
    aceita: "image/jpeg,image/png,image/webp",
    icone: "imagem",
    erro: "O banner deve ser JPG, PNG ou WEBP.",
  },
] as const;

type Anexo = (typeof anexos)[number];
type Imagens = Record<Anexo["campo"], File | null>;

const tamanhoMaximo = 5 * 1024 * 1024;

const estiloCampo =
  "h-[52px] w-full rounded-full bg-white px-6 text-[18px] font-light text-black outline-none focus:ring-2 focus:ring-[#6a38f3]/40 sm:h-[64px] sm:px-[34px] sm:text-[25px]";

type ModalCriarLojaProps = {
  aoFechar: () => void;
  aoCriar?: (loja: Loja) => void;
};

export default function ModalCriarLoja({ aoFechar, aoCriar }: ModalCriarLojaProps) {
  const [nome, setNome] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [imagens, setImagens] = useState<Imagens>({ foto: null, logo: null, banner: null });
  const [categorias, setCategorias] = useState<CategoriaLoja[]>([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    categoriasDaLoja()
      .then(setCategorias)
      .catch(() => setErro("Não foi possível carregar as categorias."));
  }, []);

  useEffect(() => {
    function clicarFora(evento: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(evento.target as Node)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener("mousedown", clicarFora);
    return () => document.removeEventListener("mousedown", clicarFora);
  }, []);

  const categoriaSelecionada = categorias.find((c) => c.id === categoriaId);

  function anexar(anexo: Anexo, arquivo: File) {
    if (!anexo.aceita.split(",").includes(arquivo.type)) {
      setErro(anexo.erro);
      return;
    }
    if (arquivo.size > tamanhoMaximo) {
      setErro("Cada imagem pode ter no máximo 5 MB.");
      return;
    }
    setErro("");
    setImagens((atuais) => ({ ...atuais, [anexo.campo]: arquivo }));
  }

  async function enviar(evento: React.SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!categoriaId) {
      setErro("Escolha uma categoria.");
      return;
    }

    setErro("");
    setEnviando(true);

    try {
      const loja = await criarLoja({ nome: nome.trim(), categoriaId, ...imagens });
      aoCriar?.(loja);
      aoFechar();
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível adicionar a loja. Tente novamente."));
      setEnviando(false);
    }
  }

  return (
    <Modal titulo="Adicionar loja" aoFechar={aoFechar}>
      <form onSubmit={enviar} className="flex flex-col">
        <input
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          placeholder="Nome da loja"
          aria-label="Nome da loja"
          required
          maxLength={60}
          autoFocus
          className={`${estiloCampo} placeholder:text-black/51`}
        />

        <div ref={dropdownRef} className="relative mt-[23px]">
          <button
            type="button"
            onClick={() => setDropdownAberto((aberto) => !aberto)}
            aria-expanded={dropdownAberto}
            aria-haspopup="listbox"
            className={`${estiloCampo} flex cursor-pointer items-center justify-between text-left ${
              dropdownAberto ? "ring-2 ring-[#6a38f3]/40" : ""
            }`}
          >
            <span className={categoriaSelecionada ? "text-black" : "text-black/51"}>
              {categoriaSelecionada ? categoriaSelecionada.nome : "Categoria"}
            </span>

            <svg
              width="33"
              height="11.5"
              viewBox="0 0 33 11.5"
              aria-hidden
              className={`shrink-0 transition-transform duration-200 ${
                dropdownAberto ? "rotate-180" : ""
              }`}
            >
              <path d="M0.5 0.5L16.5 11L32.5 0.5" fill="none" stroke="black" strokeWidth="1" />
            </svg>
          </button>

          {dropdownAberto && (
            <ul
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-[28px] bg-white py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            >
              {categorias.length === 0 ? (
                <li className="px-6 py-2.5 text-[18px] font-light text-black/50 sm:px-[34px] sm:text-[21px]">
                  Nenhuma categoria cadastrada
                </li>
              ) : (
                categorias.map((categoria) => {
                  const selecionada = categoria.id === categoriaId;
                  return (
                    <li key={categoria.id} role="option" aria-selected={selecionada}>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoriaId(categoria.id);
                          setDropdownAberto(false);
                          setErro("");
                        }}
                        className={`w-full cursor-pointer px-6 py-2.5 text-left text-[18px] font-light text-[#6a38f3] transition-colors hover:bg-[#6a38f3]/10 sm:px-[34px] sm:text-[23px] ${
                          selecionada ? "bg-[#6a38f3]/10 font-normal" : ""
                        }`}
                      >
                        {categoria.nome}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>

        <div className="mt-[30px] flex flex-col gap-[23px]">
          {anexos.map((anexo) => (
            <CampoArquivo
              key={anexo.campo}
              texto={anexo.texto}
              aceita={anexo.aceita}
              icone={anexo.icone}
              arquivo={imagens[anexo.campo]}
              aoEscolher={(arquivo) => anexar(anexo, arquivo)}
            />
          ))}
        </div>

        {erro && <p className="mt-5 text-center text-[16px] text-vermelho">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="mx-auto mt-[30px] h-[50px] w-full max-w-[373px] cursor-pointer rounded-full bg-[#6a38f3] text-[22px] text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#5b2ae6] disabled:cursor-not-allowed disabled:opacity-60 sm:text-[25px]"
        >
          {enviando ? "Adicionando..." : "Adicionar"}
        </button>
      </form>
    </Modal>
  );
}