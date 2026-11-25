"use client";

import { useEffect, useState } from "react";

import { mensagemDeErro } from "@/lib/erro";
import { categoriasDaLoja, criarLoja, type CategoriaLoja, type Loja } from "@/lib/lojas";
import CampoArquivo from "./campo-arquivo";
import Modal from "./modal";

// as tres areas de anexo do figma, na ordem da tela. anexo novo = uma linha nova aqui
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

// mesmo limite do back
const tamanhoMaximo = 5 * 1024 * 1024;

// campos brancos em pilula do figma (826 x 64, texto de 25px light)
const estiloCampo =
  "h-[52px] w-full rounded-full bg-white px-6 text-[18px] font-light text-black outline-none focus:ring-2 focus:ring-[#6a38f3]/40 sm:h-[64px] sm:px-[34px] sm:text-[25px]";

type ModalCriarLojaProps = {
  aoFechar: () => void;
  // recebe a loja criada (ex.: para colocar na lista da pagina de lojas)
  aoCriar?: (loja: Loja) => void;
};

// implementacao do modal "adicionar loja" do figma.
// uso: {aberto && <ModalCriarLoja aoFechar={() => setAberto(false)} aoCriar={...} />}
export default function ModalCriarLoja({ aoFechar, aoCriar }: ModalCriarLojaProps) {
  const [nome, setNome] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [imagens, setImagens] = useState<Imagens>({ foto: null, logo: null, banner: null });
  const [categorias, setCategorias] = useState<CategoriaLoja[]>([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // as opcoes do campo categoria vem do banco
  useEffect(() => {
    categoriasDaLoja()
      .then(setCategorias)
      .catch(() => setErro("Não foi possível carregar as categorias."));
  }, []);

  // confere tipo e tamanho antes de aceitar o arquivo
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
    setErro("");
    setEnviando(true);

    try {
      const loja = await criarLoja({ nome: nome.trim(), categoriaId, ...imagens });
      aoCriar?.(loja);
      // como no prototipo do figma: adicionou, o modal fecha
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

        <div className="relative mt-[23px]">
          <select
            value={categoriaId}
            onChange={(evento) => setCategoriaId(evento.target.value)}
            aria-label="Categoria"
            required
            className={`${estiloCampo} cursor-pointer appearance-none pr-20`}
          >
            <option value="" disabled hidden>
              Categoria
            </option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>

          {/* seta do figma: 33 x 11.5, traco preto de 1px */}
          <svg
            width="33"
            height="11.5"
            viewBox="0 0 33 11.5"
            aria-hidden
            className="pointer-events-none absolute right-[22px] top-1/2 -translate-y-1/2 sm:right-[30px] sm:top-[32px] sm:translate-y-0"
          >
            <path d="M0.5 0.5L16.5 11L32.5 0.5" fill="none" stroke="black" strokeWidth="1" />
          </svg>
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
          className="mx-auto mt-[30px] h-[50px] w-full max-w-[373px] rounded-full bg-[#6a38f3] text-[22px] text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#5b2ae6] disabled:cursor-not-allowed disabled:opacity-60 sm:text-[25px]"
        >
          {enviando ? "Adicionando..." : "Adicionar"}
        </button>
      </form>
    </Modal>
  );
}
