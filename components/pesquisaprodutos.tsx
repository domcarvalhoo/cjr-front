"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import axios from "axios";

type StatusProduto = 'DISPONÍVEL' | 'INDISPONÍVEL';
interface Produto {
  id: string;
  lojaId: string;
  categoriaId: string;
  titulo: string;
  slug: string;
  descricao?: string;
  sku?: string;
  preco: number;
  estoque: number;
  status: StatusProduto;
}

export default function PesquisaProdutos({ termo }: { termo: string }) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [termoPesquisa, setTermoPesquisa] = useState("");

  useEffect(() => {
    async function buscarProdutos() {
      try {
        const resposta = await axios.get("http://localhost:3001/produtos", {
          withCredentials: true,
        });
        setProdutos(resposta.data);
      } catch (erro) {
        console.error("Erro ao carregar os produtos:", erro);
      }
    }
    
    buscarProdutos();
  }, []);

  const produtosFiltrados = produtos.filter((produto) =>
    produto.titulo.toLowerCase().includes(termoPesquisa.toLowerCase())
  );

  return (
    <section className="px-12 mt-8 max-w-[1440px] mx-auto">

      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
        {produtosFiltrados.length > 0 ? (
          produtosFiltrados.map((produto) => (
            <div key={produto.id} className="bg-white min-w-[240px] rounded-[2rem] shadow-sm relative flex flex-col p-5">
              
              <div className="absolute top-4 right-4 w-14 h-14 rounded-full overflow-hidden shadow-sm z-10">
                <Image src="/imagens-feed/logocjr.png" alt="Selo da loja" fill sizes="56px" className="object-cover" />
              </div>

              <div className="w-full h-40 bg-gray-50 rounded-xl mb-4 flex items-center justify-center relative">
                <span className="text-gray-400 text-xs">Imagem</span>
              </div>

              <div className="w-full flex flex-col items-start">
                <h3 className="text-xl font-bold text-black truncate w-full">
                  {produto.titulo}
                </h3>
                <p className="text-lg font-bold text-black mt-1">
                  R${produto.preco}
                </p>
                <span className={`text-sm font-bold uppercase mt-2 ${produto.status === 'DISPONÍVEL' ? 'text-[#c4f000]' : 'text-red-500'}`}>
                  {produto.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div></div>
        )}
      </div>
    </section>
  );
}