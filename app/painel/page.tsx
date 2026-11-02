"use client";

import { useState } from "react";
import { Search, Apple, Pill, Sparkles, Shirt, Monitor, Baby, Home } from 'lucide-react';
import Image from 'next/image'; 
import FiltroLojas from '@/components/filtrolojas';
import PesquisaProdutos from '@/components/pesquisaprodutos';

export default function FeedPage() {
  const [termoPesquisa, setTermoPesquisa] = useState("");

  return (
    <main className="min-h-screen bg-[#F5F4EE] pb-12">
      
      <section className="bg-black w-full h-[450px] flex items-center relative overflow-hidden px-8 md:px-12">
        <div className="z-10 w-full lg:w-[55%] flex justify-center mt-[-20px]">
          <h1 className="text-white text-5xl md:text-[3.5rem] font-bold leading-[1.1] text-right">
            Do CAOS à organização, <br />
            em alguns cliques
          </h1>
        </div>
        <div className="hidden lg:block absolute bottom-0 right-[5%] w-[450px] xl:w-[550px] h-full overflow-visible">
          <Image 
            src="/imagens-feed/stockleefeed.png" 
            alt="Ilustração do Feed" 
            fill
            sizes="(max-width: 1024px) 100vw, 550px"
            className="object-contain object-bottom scale-[1.3] xl:scale-[1.5] translate-y-[30%]" 
          />
        </div>
      </section>

      <section className="px-12 mt-8 max-w-[1440px] mx-auto">
        
        {/* Nova Barra de Pesquisa posicionada no topo (substitui a vermelha) */}
        <div className="flex justify-end mb-8">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Procurar por..."
              value={termoPesquisa}
              onChange={(e) => setTermoPesquisa(e.target.value)}
              className="w-full py-3 pl-6 pr-12 rounded-full border border-purple-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400" size={20} />
          </div>
        </div>


        <div className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-6">Categoria</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {[
              { nome: 'Mercado', icone: Apple },
              { nome: 'Farmácia', icone: Pill },
              { nome: 'Beleza', icone: Sparkles },
              { nome: 'Moda', icone: Shirt },
              { nome: 'Eletrônicos', icone: Monitor },
              { nome: 'Brinquedos', icone: Baby },
              { nome: 'Casa', icone: Home },
            ].map((cat, index) => (
              <button key={index} className="flex flex-col items-center justify-center bg-white min-w-[120px] h-[120px] rounded-3xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <cat.icone className="w-8 h-8 text-purple-600 mb-2" strokeWidth={1.5} />
                <span className="text-sm font-medium text-black">{cat.nome}</span>
              </button>
            ))}

          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-bold text-black">
              Produtos <span className="text-lg font-semibold text-purple-600 ml-1">em Mercado</span>
            </h2>
            <button className="text-purple-600 text-sm font-semibold hover:underline mb-1 cursor-pointer">
              ver mais
            </button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
             {/* Cartão de Produto Vazio */}
             {[1].map((item) => (
               <div key={item} className="bg-white min-w-[250px] h-[300px] rounded-3xl shadow-sm relative overflow-hidden flex flex-col items-center justify-center p-4">
                 {/* Selo da loja */}
                  <div className="absolute top-4 right-4 w-18 h-18 rounded-full overflow-hidden shadow-sm">
                    <Image 
                      src="/imagens-feed/logocjr.png"
                      alt="Selo da loja" 
                      fill 
                      sizes="72px"
                      className="object-cover" 
                    />
                  </div>
                  {/* Espaço para imagem do produto */}
                  <div className="w-32 h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400 text-xs">
                    Imagem
                  </div>
                  <div className="w-full flex flex-col items-start">
                    <h3 className="text-xl font-bold text-black truncate w-full">
                      Produto de mercado
                    </h3>
                    <p className="text-lg font-bold text-black mt-1">
                      R$XX,XX
                    </p>
                    <span className="text-sm font-bold text-[#c4f000] uppercase mt-2">
                      DISPONIBILIDADE
                    </span>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-bold text-black">
              Produtos <span className="text-lg font-semibold text-purple-600 ml-1">em Beleza</span>
            </h2>
            <button className="text-purple-600 text-sm font-semibold hover:underline mb-1 cursor-pointer">
              ver mais
            </button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
             {/* Cartão de Produto Vazio */}
             {[1].map((item) => (
               <div key={item} className="bg-white min-w-[250px] h-[300px] rounded-3xl shadow-sm relative overflow-hidden flex flex-col items-center justify-center p-4">
                 {/* Selo da loja */}
                  <div className="absolute top-4 right-4 w-18 h-18 rounded-full overflow-hidden shadow-sm">
                    <Image 
                      src="/imagens-feed/logorarebeauty.png"
                      alt="Selo da loja" 
                      fill 
                      sizes="72px"
                      className="object-cover" 
                    />
                  </div>
                  {/* Espaço para imagem do produto */}
                  <div className="w-32 h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400 text-xs">
                    Imagem
                  </div>
                  <div className="w-full flex flex-col items-start">
                    <h3 className="text-xl font-bold text-black truncate w-full">
                      Produto de beleza
                    </h3>
                    <p className="text-lg font-bold text-black mt-1">
                      R$XX,XX
                    </p>
                    <span className="text-sm font-bold text-[#c4f000] uppercase mt-2">
                      DISPONIBILIDADE
                    </span>
                  </div>
               </div>
             ))}
          </div>
        </div>

      </section>
      <PesquisaProdutos termo={termoPesquisa} />
      <FiltroLojas/>
    </main>
  );
}