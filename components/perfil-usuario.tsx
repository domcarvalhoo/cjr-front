<<<<<<< HEAD
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AtSign, Camera, Mail, Plus, Star, Store } from "lucide-react";

import { api } from "@/lib/api";
import { avaliacoesDoUsuario, type AvaliacaoPerfil } from "@/lib/avaliacoes";
import { mensagemDeErro } from "@/lib/erro";
import { minhasLojas, type Loja } from "@/lib/lojas";
import ModalCriarLoja from "@/components/modal-criar-loja";
import ModalEditarPerfil from "@/components/modal-editar-perfil";
import CardProduto from "@/app/componentes/card-produto";
import { produtosDaPessoa } from "@/lib/perfil";
import type { ProdutoCard } from "@/lib/produtos";

export type UsuarioPerfil = {
    id: number;
    nome: string;
    nomeUsuario: string;
    email: string;
    fotoUrl: string | null;
};

type PerfilUsuarioProps = {
    usuario: UsuarioPerfil;
    ehDono: boolean;
};

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO = 2 * 1024 * 1024;

function iniciais(nome: string) {
    return nome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0].toUpperCase())
        .join("");
}

function CarrosselHorizontal({ children }: { children: React.ReactNode }) {
    const trilhaRef = useRef<HTMLDivElement>(null);
    const arrastando = useRef(false);
    const moveu = useRef(false);
    const inicioX = useRef(0);
    const scrollInicial = useRef(0);

    function aoPressionarMouse(e: React.MouseEvent<HTMLDivElement>) {
        const el = trilhaRef.current;
        if (!el) return;
        arrastando.current = true;
        moveu.current = false;
        inicioX.current = e.pageX - el.offsetLeft;
        scrollInicial.current = el.scrollLeft;
    }

    function aoMoverMouse(e: React.MouseEvent<HTMLDivElement>) {
        if (!arrastando.current || !trilhaRef.current) return;
        e.preventDefault();
        const x = e.pageX - trilhaRef.current.offsetLeft;
        const deslocamento = x - inicioX.current;
        if (Math.abs(deslocamento) > 5) {
            moveu.current = true;
        }
        trilhaRef.current.scrollLeft = scrollInicial.current - deslocamento;
    }

    function aoSoltarMouse() {
        arrastando.current = false;
    }

    function aoCapturarClique(e: React.MouseEvent<HTMLDivElement>) {
        if (moveu.current) {
            e.preventDefault();
            e.stopPropagation();
            moveu.current = false;
        }
    }

    return (
        <div
            ref={trilhaRef}
            onMouseDown={aoPressionarMouse}
            onMouseMove={aoMoverMouse}
            onMouseUp={aoSoltarMouse}
            onMouseLeave={aoSoltarMouse}
            onClickCapture={aoCapturarClique}
            className="mt-6 flex flex-nowrap gap-6 overflow-x-auto pb-4 select-none [scrollbar-width:thin]"
        >
            {children}
        </div>
    );
}

export default function PerfilUsuario({ usuario: usuarioInicial, ehDono }: PerfilUsuarioProps) {
    const router = useRouter();
    const inputFoto = useRef<HTMLInputElement>(null);
    // copia local: o modal "Editar Perfil" atualiza a tela sem recarregar
    const [usuario, setUsuario] = useState(usuarioInicial);
    const [editando, setEditando] = useState(false);
    const fotoUrl = usuario.fotoUrl;
    function setFotoUrl(novaFoto: string | null) {
        setUsuario((atual) => ({ ...atual, fotoUrl: novaFoto }));
    }

    const [produtos, setProdutos] = useState<ProdutoCard[]>([]);
    const [carregandoProdutos, setCarregandoProdutos] = useState(true);
    const [erroProdutos, setErroProdutos] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [erroFoto, setErroFoto] = useState("");

    const [lojas, setLojas] = useState<Loja[]>([]);
    const [carregandoLojas, setCarregandoLojas] = useState(true);
    const [erroLojas, setErroLojas] = useState("");
    const [modalLojaAberto, setModalLojaAberto] = useState(false);

    const [avaliacoes, setAvaliacoes] = useState<AvaliacaoPerfil[]>([]);
    const [carregandoAvaliacoes, setCarregandoAvaliacoes] = useState(true);
    const [erroAvaliacoes, setErroAvaliacoes] = useState("");

    useEffect(() => {
        if (!ehDono) return;

        minhasLojas()
            .then(setLojas)
            .catch((err) => {
                setLojas([]);
                setErroLojas(mensagemDeErro(err, "Não foi possível carregar suas lojas."));
            })
            .finally(() => setCarregandoLojas(false));
    }, [ehDono]);

    useEffect(() => {
        produtosDaPessoa(usuario.id)
            .then(setProdutos)
            .catch((err) => {
                setProdutos([]);
                setErroProdutos(mensagemDeErro(err, "Não foi possível carregar os produtos."));
            })
            .finally(() => setCarregandoProdutos(false));
    }, [usuario.id]);

    useEffect(() => {
        avaliacoesDoUsuario(usuario.id)
            .then(setAvaliacoes)
            .catch((err) => {
                setAvaliacoes([]);
                setErroAvaliacoes(mensagemDeErro(err, "Não foi possível carregar suas avaliações."));
            })
            .finally(() => setCarregandoAvaliacoes(false));
    }, [usuario.id]);

    async function trocarFoto(e: React.ChangeEvent<HTMLInputElement>) {
        const arquivo = e.target.files?.[0];
        e.target.value = "";
        if (!arquivo) return;

        if (!TIPOS_ACEITOS.includes(arquivo.type)) {
            setErroFoto("A foto deve ser JPG, PNG ou WEBP.");
            return;
        }
        if (arquivo.size > TAMANHO_MAXIMO) {
            setErroFoto("A foto deve ter no máximo 2 MB.");
            return;
        }

        setErroFoto("");
        setEnviando(true);
        try {
            const dados = new FormData();
            dados.append("foto", arquivo);
            const resposta = await api.patch<{ fotoUrl: string }>("/user/me/foto", dados);
            setFotoUrl(resposta.data.fotoUrl);
        } catch (erro) {
            setErroFoto(mensagemDeErro(erro, "Não foi possível trocar a foto."));
        } finally {
            setEnviando(false);
        }
    }

    const conteudoFoto = fotoUrl ? (
        <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}${fotoUrl}`}
            alt={`Foto de ${usuario.nome}`}
            fill
            unoptimized
            className="object-cover"
        />
    ) : (
        iniciais(usuario.nome)
    );

    const classesFoto =
        "relative flex h-[250px] w-[250px] shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-bege bg-roxo text-7xl font-bold text-bege";

    return (
        <div className="min-h-screen bg-bege pb-20">
            <div className="h-[220px] w-full bg-black" />

            <div className="mx-auto flex w-full max-w-[1280px] gap-8 px-8">
                <div className="w-12 shrink-0 pt-[110px]">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        aria-label="Voltar"
                        className="text-bege transition-colors hover:text-verde"
                    >
                        <ArrowLeft className="h-12 w-12" strokeWidth={2} />
                    </button>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="-mt-[125px] flex items-end justify-between gap-6">
                        {ehDono ? (
                            <button
                                type="button"
                                onClick={() => inputFoto.current?.click()}
                                disabled={enviando}
                                aria-label="Trocar foto de perfil"
                                className={`group cursor-pointer disabled:cursor-wait ${classesFoto}`}
                            >
                                {conteudoFoto}
                                <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-xl font-medium text-bege opacity-0 transition-opacity group-hover:opacity-100 group-disabled:opacity-100">
                                    <Camera className="h-10 w-10" />
                                    {enviando ? "Enviando..." : "Trocar foto"}
                                </span>
                            </button>
                        ) : (
                            <div className={classesFoto}>{conteudoFoto}</div>
                        )}

                        {ehDono && (
                            <button
                                type="button"
                                onClick={() => setEditando(true)}
                                className="mb-4 rounded-full bg-roxo px-20 py-3 text-xl font-medium text-white transition-opacity hover:opacity-90"
                            >
                                Editar Perfil
                            </button>
                        )}
                    </div>

                    {ehDono && (
                        <input
                            ref={inputFoto}
                            type="file"
                            accept={TIPOS_ACEITOS.join(",")}
                            onChange={trocarFoto}
                            className="hidden"
                        />
                    )}

                    {erroFoto && <p className="mt-4 text-xl text-red-600">{erroFoto}</p>}

                    <h1 className="mt-6 text-5xl font-medium text-preto">{usuario.nome}</h1>
                    <p className="mt-3 flex items-center gap-2 text-2xl font-light text-cinza">
                        <AtSign className="h-6 w-6" />
                        {usuario.nomeUsuario}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-2xl font-light text-cinza">
                        <Mail className="h-6 w-6" />
                        {usuario.email}
                    </p>

                    {/* PRODUTOS */}
                    <section className="mt-16">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-medium text-preto">Produtos</h2>
                        </div>
                        {erroProdutos ? (
                            <p className="mt-6 text-xl text-red-600">{erroProdutos}</p>
                        ) : carregandoProdutos ? (
                            <p className="mt-6 text-xl font-light text-cinza">Carregando produtos...</p>
                        ) : produtos.length === 0 ? (
                            <p className="mt-6 text-xl font-light text-cinza">Nenhum produto por aqui ainda.</p>
                        ) : (
                            <CarrosselHorizontal>
                                {produtos.map((produto) => (
                                    <div key={produto.id} className="w-[228px] shrink-0">
                                        <CardProduto produto={produto} />
                                    </div>
                                ))}
                            </CarrosselHorizontal>
                        )}
                    </section>

                    {/* LOJAS */}
                    <section className="mt-16">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-medium text-preto">Lojas</h2>
                            {ehDono && (
                                <button
                                    type="button"
                                    onClick={() => setModalLojaAberto(true)}
                                    aria-label="Criar nova loja"
                                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-roxo text-white transition-opacity hover:opacity-90"
                                >
                                    <Plus className="h-6 w-6" strokeWidth={2.5} />
                                </button>
                            )}
                        </div>

                        {erroLojas ? (
                            <p className="mt-6 text-xl text-red-600">{erroLojas}</p>
                        ) : carregandoLojas ? (
                            <p className="mt-6 text-xl font-light text-cinza">Carregando lojas...</p>
                        ) : lojas.length === 0 ? (
                            <p className="mt-6 text-xl font-light text-cinza">Nenhuma loja por aqui ainda.</p>
                        ) : (
                            <CarrosselHorizontal>
                                {lojas.map((loja) => {
                                    const imagemLoja = loja.fotoUrl || loja.logoUrl;
                                    return (
                                        <Link
                                            key={loja.id}
                                            href={`/loja/${loja.id}`}
                                            draggable={false}
                                            className="flex w-[440px] shrink-0 items-center justify-between gap-4 rounded-[28px] bg-white px-8 py-6 shadow-sm transition-transform hover:-translate-y-0.5"
                                        >
                                            <div className="min-w-0">
                                                <h3 className="truncate text-3xl font-normal text-preto">
                                                    {loja.nome}
                                                </h3>
                                                {loja.categoria && (
                                                    <p className="mt-1 text-2xl font-normal lowercase text-roxo">
                                                        {loja.categoria.nome}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FAF6F5]">
                                                {imagemLoja ? (
                                                    <Image
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${imagemLoja}`}
                                                        alt={loja.nome}
                                                        fill
                                                        unoptimized
                                                        draggable={false}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <Store className="h-10 w-10 text-roxo/60" />
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </CarrosselHorizontal>
                        )}
                    </section>

                    {/* AVALIAÇÕES */}
                    <section className="mt-16">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-medium text-preto">Avaliações</h2>
                        </div>

                        {erroAvaliacoes ? (
                            <p className="mt-6 text-xl text-red-600">{erroAvaliacoes}</p>
                        ) : carregandoAvaliacoes ? (
                            <p className="mt-6 text-xl font-light text-cinza">Carregando avaliações...</p>
                        ) : avaliacoes.length === 0 ? (
                            <p className="mt-6 text-xl font-light text-cinza">Nenhuma avaliação por aqui ainda.</p>
                        ) : (
                            <CarrosselHorizontal>
                                {avaliacoes.map((avaliacao) => {
                                    const nomeAutor = avaliacao.usuario?.nome || usuario.nome;
                                    const fotoAutor = fotoUrl ?? avaliacao.usuario?.fotoUrl ?? null;

                                    return (
                                        <div
                                            key={`${avaliacao.tipo}-${avaliacao.id}`}
                                            className="flex w-[680px] shrink-0 items-stretch gap-6 rounded-[28px] bg-white px-8 py-6 shadow-sm"
                                        >
                                            {/* Avatar circular do autor */}
                                            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center self-center overflow-hidden rounded-full bg-roxo text-3xl font-bold text-bege">
                                                {fotoAutor ? (
                                                    <Image
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${fotoAutor}`}
                                                        alt={nomeAutor}
                                                        fill
                                                        unoptimized
                                                        draggable={false}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    iniciais(nomeAutor)
                                                )}
                                            </div>

                                            {/* Conteúdo central: Nome + Comentário */}
                                            <div className="flex min-w-0 flex-1 flex-col justify-start pt-1">
                                                <h3 className="truncate text-2xl font-medium text-preto">
                                                    {nomeAutor}
                                                </h3>
                                                <p className="mt-2 line-clamp-2 text-lg font-light text-preto">
                                                    {avaliacao.comentario || "Avaliação sem comentário escrito."}
                                                </p>
                                            </div>

                                            {/* Coluna direita: Estrelas no topo e "ver mais" embaixo */}
                                            <div className="flex shrink-0 flex-col items-end justify-between py-1">
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((estrela) => (
                                                        <Star
                                                            key={estrela}
                                                            className={`h-6 w-6 ${
                                                                estrela <= avaliacao.nota
                                                                    ? "fill-[#FFEB3B] text-[#FFEB3B]"
                                                                    : "text-zinc-300"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>

                                                <Link
                                                    href={`/comentario/${avaliacao.id}`}
                                                    draggable={false}
                                                    className="text-lg font-light text-roxo transition-opacity hover:opacity-80"
                                                >
                                                    ver mais
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CarrosselHorizontal>
                        )}
                    </section>
                </div>
            </div>

            {ehDono && editando && (
                <ModalEditarPerfil usuario={usuario} aoFechar={() => setEditando(false)} aoSalvar={setUsuario} />
            )}

            {ehDono && modalLojaAberto && (
                <ModalCriarLoja
                    aoFechar={() => setModalLojaAberto(false)}
                    aoCriar={(novaLoja) => setLojas((atuais) => [novaLoja, ...atuais])}
                />
            )}
        </div>
    );
}
=======
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AtSign, Camera, Mail, Plus, Star, Store } from "lucide-react";

import { api } from "@/lib/api";
import { avaliacoesDoUsuario, type AvaliacaoPerfil } from "@/lib/avaliacoes";
import { mensagemDeErro } from "@/lib/erro";
import { minhasLojas, type Loja } from "@/lib/lojas";
import ModalCriarLoja from "@/components/modal-criar-loja";

export type UsuarioPerfil = {
    id: string;
    nome: string;
    nomeUsuario: string;
    email: string;
    fotoUrl: string | null;
};

type PerfilUsuarioProps = {
    usuario: UsuarioPerfil;
    ehDono: boolean;
};

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO = 2 * 1024 * 1024;

function iniciais(nome: string) {
    return nome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0].toUpperCase())
        .join("");
}

function CarrosselHorizontal({ children }: { children: React.ReactNode }) {
    const trilhaRef = useRef<HTMLDivElement>(null);
    const arrastando = useRef(false);
    const moveu = useRef(false);
    const inicioX = useRef(0);
    const scrollInicial = useRef(0);

    function aoPressionarMouse(e: React.MouseEvent<HTMLDivElement>) {
        const el = trilhaRef.current;
        if (!el) return;
        arrastando.current = true;
        moveu.current = false;
        inicioX.current = e.pageX - el.offsetLeft;
        scrollInicial.current = el.scrollLeft;
    }

    function aoMoverMouse(e: React.MouseEvent<HTMLDivElement>) {
        if (!arrastando.current || !trilhaRef.current) return;
        e.preventDefault();
        const x = e.pageX - trilhaRef.current.offsetLeft;
        const deslocamento = x - inicioX.current;
        if (Math.abs(deslocamento) > 5) {
            moveu.current = true;
        }
        trilhaRef.current.scrollLeft = scrollInicial.current - deslocamento;
    }

    function aoSoltarMouse() {
        arrastando.current = false;
    }

    function aoCapturarClique(e: React.MouseEvent<HTMLDivElement>) {
        if (moveu.current) {
            e.preventDefault();
            e.stopPropagation();
            moveu.current = false;
        }
    }

    return (
        <div
            ref={trilhaRef}
            onMouseDown={aoPressionarMouse}
            onMouseMove={aoMoverMouse}
            onMouseUp={aoSoltarMouse}
            onMouseLeave={aoSoltarMouse}
            onClickCapture={aoCapturarClique}
            className="mt-6 flex flex-nowrap gap-6 overflow-x-auto pb-4 select-none [scrollbar-width:thin]"
        >
            {children}
        </div>
    );
}

export default function PerfilUsuario({ usuario, ehDono }: PerfilUsuarioProps) {
    const router = useRouter();
    const inputFoto = useRef<HTMLInputElement>(null);
    const [fotoUrl, setFotoUrl] = useState(usuario.fotoUrl);
    const [enviando, setEnviando] = useState(false);
    const [erroFoto, setErroFoto] = useState("");

    const [lojas, setLojas] = useState<Loja[]>([]);
    const [carregandoLojas, setCarregandoLojas] = useState(ehDono);
    const [erroLojas, setErroLojas] = useState("");
    const [modalLojaAberto, setModalLojaAberto] = useState(false);

    const [avaliacoes, setAvaliacoes] = useState<AvaliacaoPerfil[]>([]);
    const [carregandoAvaliacoes, setCarregandoAvaliacoes] = useState(true);
    const [erroAvaliacoes, setErroAvaliacoes] = useState("");

    useEffect(() => {
        if (!ehDono) return;

        setCarregandoLojas(true);
        setErroLojas("");
        minhasLojas()
            .then(setLojas)
            .catch((err) => {
                setLojas([]);
                setErroLojas(mensagemDeErro(err, "Não foi possível carregar suas lojas."));
            })
            .finally(() => setCarregandoLojas(false));
    }, [ehDono]);

    useEffect(() => {
        setCarregandoAvaliacoes(true);
        setErroAvaliacoes("");
        avaliacoesDoUsuario(usuario.id)
            .then(setAvaliacoes)
            .catch((err) => {
                setAvaliacoes([]);
                setErroAvaliacoes(mensagemDeErro(err, "Não foi possível carregar suas avaliações."));
            })
            .finally(() => setCarregandoAvaliacoes(false));
    }, [usuario.id]);

    async function trocarFoto(e: React.ChangeEvent<HTMLInputElement>) {
        const arquivo = e.target.files?.[0];
        e.target.value = "";
        if (!arquivo) return;

        if (!TIPOS_ACEITOS.includes(arquivo.type)) {
            setErroFoto("A foto deve ser JPG, PNG ou WEBP.");
            return;
        }
        if (arquivo.size > TAMANHO_MAXIMO) {
            setErroFoto("A foto deve ter no máximo 2 MB.");
            return;
        }

        setErroFoto("");
        setEnviando(true);
        try {
            const dados = new FormData();
            dados.append("foto", arquivo);
            const resposta = await api.patch<{ fotoUrl: string }>("/user/me/foto", dados);
            setFotoUrl(resposta.data.fotoUrl);
        } catch (erro) {
            setErroFoto(mensagemDeErro(erro, "Não foi possível trocar a foto."));
        } finally {
            setEnviando(false);
        }
    }

    const conteudoFoto = fotoUrl ? (
        <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}${fotoUrl}`}
            alt={`Foto de ${usuario.nome}`}
            fill
            unoptimized
            className="object-cover"
        />
    ) : (
        iniciais(usuario.nome)
    );

    const classesFoto =
        "relative flex h-[250px] w-[250px] shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-bege bg-roxo text-7xl font-bold text-bege";

    return (
        <div className="min-h-screen bg-bege pb-20">
            <div className="h-[220px] w-full bg-black" />

            <div className="mx-auto flex w-full max-w-[1280px] gap-8 px-8">
                <div className="w-12 shrink-0 pt-[110px]">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        aria-label="Voltar"
                        className="text-bege transition-colors hover:text-verde"
                    >
                        <ArrowLeft className="h-12 w-12" strokeWidth={2} />
                    </button>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="-mt-[125px] flex items-end justify-between gap-6">
                        {ehDono ? (
                            <button
                                type="button"
                                onClick={() => inputFoto.current?.click()}
                                disabled={enviando}
                                aria-label="Trocar foto de perfil"
                                className={`group cursor-pointer disabled:cursor-wait ${classesFoto}`}
                            >
                                {conteudoFoto}
                                <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-xl font-medium text-bege opacity-0 transition-opacity group-hover:opacity-100 group-disabled:opacity-100">
                                    <Camera className="h-10 w-10" />
                                    {enviando ? "Enviando..." : "Trocar foto"}
                                </span>
                            </button>
                        ) : (
                            <div className={classesFoto}>{conteudoFoto}</div>
                        )}

                        {ehDono && (
                            <button
                                type="button"
                                className="mb-4 rounded-full bg-roxo px-20 py-3 text-xl font-medium text-white transition-opacity hover:opacity-90"
                            >
                                Editar Perfil
                            </button>
                        )}
                    </div>

                    {ehDono && (
                        <input
                            ref={inputFoto}
                            type="file"
                            accept={TIPOS_ACEITOS.join(",")}
                            onChange={trocarFoto}
                            className="hidden"
                        />
                    )}

                    {erroFoto && <p className="mt-4 text-xl text-red-600">{erroFoto}</p>}

                    <h1 className="mt-6 text-5xl font-medium text-preto">{usuario.nome}</h1>
                    <p className="mt-3 flex items-center gap-2 text-2xl font-light text-cinza">
                        <AtSign className="h-6 w-6" />
                        {usuario.nomeUsuario}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-2xl font-light text-cinza">
                        <Mail className="h-6 w-6" />
                        {usuario.email}
                    </p>

                    {/* PRODUTOS */}
                    <section className="mt-16">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-medium text-preto">Produtos</h2>
                        </div>
                        <p className="mt-6 text-xl font-light text-cinza">Nenhum produto por aqui ainda.</p>
                    </section>

                    {/* LOJAS */}
                    <section className="mt-16">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-medium text-preto">Lojas</h2>
                            {ehDono && (
                                <button
                                    type="button"
                                    onClick={() => setModalLojaAberto(true)}
                                    aria-label="Criar nova loja"
                                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-roxo text-white transition-opacity hover:opacity-90"
                                >
                                    <Plus className="h-6 w-6" strokeWidth={2.5} />
                                </button>
                            )}
                        </div>

                        {erroLojas ? (
                            <p className="mt-6 text-xl text-red-600">{erroLojas}</p>
                        ) : carregandoLojas ? (
                            <p className="mt-6 text-xl font-light text-cinza">Carregando lojas...</p>
                        ) : lojas.length === 0 ? (
                            <p className="mt-6 text-xl font-light text-cinza">Nenhuma loja por aqui ainda.</p>
                        ) : (
                            <CarrosselHorizontal>
                                {lojas.map((loja) => {
                                    const imagemLoja = loja.fotoUrl || loja.logoUrl;
                                    return (
                                        <Link
                                            key={loja.id}
                                            href={`/loja/${loja.id}`}
                                            draggable={false}
                                            className="flex w-[440px] shrink-0 items-center justify-between gap-4 rounded-[28px] bg-white px-8 py-6 shadow-sm transition-transform hover:-translate-y-0.5"
                                        >
                                            <div className="min-w-0">
                                                <h3 className="truncate text-3xl font-normal text-preto">
                                                    {loja.nome}
                                                </h3>
                                                {loja.categoria && (
                                                    <p className="mt-1 text-2xl font-normal lowercase text-roxo">
                                                        {loja.categoria.nome}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FAF6F5]">
                                                {imagemLoja ? (
                                                    <Image
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${imagemLoja}`}
                                                        alt={loja.nome}
                                                        fill
                                                        unoptimized
                                                        draggable={false}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <Store className="h-10 w-10 text-roxo/60" />
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </CarrosselHorizontal>
                        )}
                    </section>

                    {/* AVALIAÇÕES */}
                    <section className="mt-16">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-medium text-preto">Avaliações</h2>
                        </div>

                        {erroAvaliacoes ? (
                            <p className="mt-6 text-xl text-red-600">{erroAvaliacoes}</p>
                        ) : carregandoAvaliacoes ? (
                            <p className="mt-6 text-xl font-light text-cinza">Carregando avaliações...</p>
                        ) : avaliacoes.length === 0 ? (
                            <p className="mt-6 text-xl font-light text-cinza">Nenhuma avaliação por aqui ainda.</p>
                        ) : (
                            <CarrosselHorizontal>
                                {avaliacoes.map((avaliacao) => {
                                    const nomeAutor = avaliacao.usuario?.nome || usuario.nome;
                                    const fotoAutor = fotoUrl ?? avaliacao.usuario?.fotoUrl ?? null;

                                    return (
                                        <div
                                            key={`${avaliacao.tipo}-${avaliacao.id}`}
                                            className="flex w-[680px] shrink-0 items-stretch gap-6 rounded-[28px] bg-white px-8 py-6 shadow-sm"
                                        >
                                            {/* Avatar circular do autor */}
                                            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center self-center overflow-hidden rounded-full bg-roxo text-3xl font-bold text-bege">
                                                {fotoAutor ? (
                                                    <Image
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${fotoAutor}`}
                                                        alt={nomeAutor}
                                                        fill
                                                        unoptimized
                                                        draggable={false}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    iniciais(nomeAutor)
                                                )}
                                            </div>

                                            {/* Conteúdo central: Nome + Comentário */}
                                            <div className="flex min-w-0 flex-1 flex-col justify-start pt-1">
                                                <h3 className="truncate text-2xl font-medium text-preto">
                                                    {nomeAutor}
                                                </h3>
                                                <p className="mt-2 line-clamp-2 text-lg font-light text-preto">
                                                    {avaliacao.comentario || "Avaliação sem comentário escrito."}
                                                </p>
                                            </div>

                                            {/* Coluna direita: Estrelas no topo e "ver mais" embaixo */}
                                            <div className="flex shrink-0 flex-col items-end justify-between py-1">
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((estrela) => (
                                                        <Star
                                                            key={estrela}
                                                            className={`h-6 w-6 ${
                                                                estrela <= avaliacao.nota
                                                                    ? "fill-[#FFEB3B] text-[#FFEB3B]"
                                                                    : "text-zinc-300"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>

                                                <Link
                                                    href={`/comentario/${avaliacao.id}`}
                                                    draggable={false}
                                                    className="text-lg font-light text-roxo transition-opacity hover:opacity-80"
                                                >
                                                    ver mais
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CarrosselHorizontal>
                        )}
                    </section>
                </div>
            </div>

            {ehDono && modalLojaAberto && (
                <ModalCriarLoja
                    aoFechar={() => setModalLojaAberto(false)}
                    aoCriar={(novaLoja) => setLojas((atuais) => [novaLoja, ...atuais])}
                />
            )}
        </div>
    );
}
>>>>>>> 4582bab4f5558b792f24607f2b642c40d04384f6
