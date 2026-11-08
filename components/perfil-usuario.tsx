"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, AtSign, Camera, Mail } from "lucide-react";

import { api } from "@/lib/api";
import { mensagemDeErro } from "@/lib/erro";

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

// sem foto, mostra as iniciais do nome
function iniciais(nome: string) {
    return nome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0].toUpperCase())
        .join("");
}

export default function PerfilUsuario({ usuario, ehDono }: PerfilUsuarioProps) {
    const router = useRouter();
    const inputFoto = useRef<HTMLInputElement>(null);
    const [fotoUrl, setFotoUrl] = useState(usuario.fotoUrl);
    const [enviando, setEnviando] = useState(false);
    const [erroFoto, setErroFoto] = useState("");

    async function trocarFoto(e: React.ChangeEvent<HTMLInputElement>) {
        const arquivo = e.target.files?.[0];
        // limpa o input para permitir escolher o mesmo arquivo de novo
        e.target.value = "";
        if (!arquivo) {
            return;
        }
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

                <div className="flex-1">
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

                    <section className="mt-16">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-medium text-preto">Produtos</h2>
                        </div>
                        <p className="mt-6 text-xl font-light text-cinza">Nenhum produto por aqui ainda.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
