"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Apple, Pill, Sparkles, Shirt, Monitor, Gamepad2, Baby, Home } from "lucide-react";
import Image from 'next/image'; 

const CATEGORIAS_FILTRO = [
  { nome: "Mercado", id: "mercado", icone: Apple },
  { nome: "Farmácia", id: "farmácia", icone: Pill },
  { nome: "Beleza", id: "beleza", icone: Sparkles },
  { nome: "Moda", id: "moda", icone: Shirt },
  { nome: "Eletrônicos", id: "eletrônicos", icone: Monitor },
  { nome: "Brinquedos", id: "brinquedos", icone: Baby },
  { nome: "Casa", id: "casa", icone: Home },
];

const LOJAS = [
  { nome: "CJR", categoria: "mercado", bg: "bg-[#003366]", imagem: "/imagens-feed/logocjr.png" },
  { nome: "Rare Beauty", categoria: "beleza", bg: "bg-pink-50", imagem: "/imagens-feed/logorarebeauty.png" },
];

export default function FiltraLojas() {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);

  const alternarFiltro = (idCategoria: string) => {
    setCategoriasSelecionadas((prev) => 
      prev.includes(idCategoria)
        ? prev.filter((cat) => cat !== idCategoria)
        : [...prev, idCategoria]
    );
  };

  const lojasFiltradas = categoriasSelecionadas.length > 0
    ? LOJAS.filter((loja) => categoriasSelecionadas.includes(loja.categoria))
    : LOJAS;

  return (
    <section className="px-12 mt-16 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-black">Lojas</h2>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <button
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
              className="bg-white rounded-full px-6 py-2.5 text-purple-400 flex items-center justify-between w-[300px] shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-lg">Filtros</span>
              {filtrosAbertos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {filtrosAbertos && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-3xl shadow-xl p-4 z-50 border border-gray-100">
                <ul className="flex flex-col gap-3">
                  {CATEGORIAS_FILTRO.map((cat) => (
                    <li key={cat.id} className="flex items-center gap-3 px-2">
                        <input 
                            type="checkbox" 
                            id={`filtro-${cat.id}`}
                            checked={categoriasSelecionadas.includes(cat.id)}
                            onChange={() => alternarFiltro(cat.id)}
                            className="w-5 h-5 rounded-full border-2 border-[#a855f7] appearance-none checked:bg-[#a855f7] cursor-pointer transition-colors shrink-0"
                        />
                        <label 
                            htmlFor={`filtro-${cat.id}`} 
                            className="flex items-center gap-2 text-purple-500 cursor-pointer hover:text-purple-700 transition-colors"
                        >
                        {cat.nome} 
                        <cat.icone size={16} strokeWidth={2} />
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <button className="text-purple-600 text-sm font-semibold hover:underline cursor-pointer">
            ver mais
          </button>
        </div>
      </div>

      <div className="flex gap-8 overflow-x-auto pb-8 pt-2 scrollbar-hide">
        {lojasFiltradas.length > 0 ? (
          lojasFiltradas.map((loja, index) => (
            <div key={index} className="flex flex-col items-center min-w-[120px]">
                <div className={`w-[120px] h-[120px] rounded-full ${loja.bg} shadow-sm mb-3 flex items-center justify-center overflow-hidden relative cursor-pointer hover:scale-105 transition-transform`}>
                    {loja.imagem ? (
                        <Image 
                        src={loja.imagem} 
                        alt={`Logo da loja ${loja.nome}`} 
                        fill 
                        sizes="120px"
                        className="object-cover" 
                        />
                    ) : (
                        loja.nome === "CJR" && <span className="text-white font-bold text-3xl">CJR</span>
                    )}
                </div>
                <span className="text-black font-medium text-center leading-tight">{loja.nome}</span>
                <span className="text-purple-600 text-sm text-center">{loja.categoria}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm italic py-4">Nenhuma loja encontrada para este filtro.</p>
        )}
      </div>
    </section>
  );
}