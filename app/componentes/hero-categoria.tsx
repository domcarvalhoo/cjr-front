import Image from "next/image";

import type { CategoriaTela } from "@/lib/categorias";

// implementação do banner da categoria
export default function HeroCategoria({ categoria }: { categoria: CategoriaTela }) {
  return (
    <section className="flex h-[clamp(190px,31vw,520px)] overflow-hidden bg-black">
      {/* frase */}
      <h1 className="flex flex-1 flex-col justify-center pr-3 text-right text-[clamp(1.5rem,4.2vw,4rem)] font-medium leading-[1.1] text-bege">
        <span>
          {categoria.tituloInicio}{" "}
          <strong className="font-extrabold">{categoria.destaque}</strong>
        </span>
        <span>{categoria.tituloFim}</span>
      </h1>

      {/* personagem, o excesso da imagem é cortado embaixo */}
      <div className="relative mr-[4%] w-[28%] md:mr-[13%] md:w-[20%]">
        <Image
          src="/imagens-categoria/personagem-categoria.webp"
          alt="Personagem STOCK.IO"
          fill
          priority
          sizes="(min-width: 768px) 20vw, 28vw"
          className="object-cover object-top"
        />
      </div>
    </section>
  );
}
