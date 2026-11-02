"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

import { api } from "../../lib/api";

export default function Cadastro() {
    const router = useRouter();
    const [nome, setNome] = useState("");
    const [nomeUsuario, setNomeUsuario] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [erro, setErro] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (nome.trim() === "") {
            setErro("O nome é obrigatório.");
            return;
        }
        if (nomeUsuario.trim() === "") {
            setErro("O nome de usuário é obrigatório.");
            return;
        }
        if (email.trim() === "") {
            setErro("O email é obrigatório.");
            return;
        }
        if (senha.trim() === "") {
            setErro("A senha é obrigatória.");
            return;
        }
        if (senha.length < 6) {
            setErro("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem.");
            return;
        }
        setErro("");
        setCarregando(true);

        try {
            await api.post("/user", {
                nome,
                nomeUsuario,
                email,
                senha,
            });
            router.push("/inicial");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const mensagem = err.response?.data?.message;
                setErro(Array.isArray(mensagem) ? mensagem[0] : mensagem ?? "Não foi possível criar a conta.");
            } else {
                setErro("Não foi possível criar a conta.");
            }
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#F6F3E4] flex justify-center">
            <main className="relative w-[1440px] h-[1024px] flex justify-between px-[85px] overflow-hidden">
                <div className="font-light text-[25px] leading-none w-[654px] mt-[113px] bg-[#1E1E1E] rounded-t-[40px] px-24 pt-16 flex flex-col items-center">
                    <h1 className="text-white text-4xl font-bold uppercase mb-10">
                        Crie sua conta
                    </h1>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                        <label htmlFor="nome" className="sr-only">Nome completo</label>
                        <input
                            type="text"
                            id="nome"
                            placeholder="Nome Completo"
                            className="w-full rounded-full bg-[#F6F3E4] px-6 py-3 text-[#171918] placeholder:text-[#858585]"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />

                        <label htmlFor="nomeUsuario" className="sr-only">Nome de usuário</label>
                        <input
                            type="text"
                            id="nomeUsuario"
                            placeholder="Username"
                            className="w-full rounded-full bg-[#F6F3E4] px-6 py-3 text-[#171918] placeholder:text-[#858585]"
                            value={nomeUsuario}
                            onChange={(e) => setNomeUsuario(e.target.value)}
                        />

                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Email"
                            className="w-full rounded-full bg-[#F6F3E4] px-6 py-3 text-[#171918] placeholder:text-[#858585]"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <label htmlFor="senha" className="sr-only">Senha</label>
                        <div className="relative">
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                id="senha"
                                placeholder="Senha"
                                className="w-full rounded-full bg-[#F6F3E4] pl-6 pr-14 py-3 text-[#171918] placeholder:text-[#858585]"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
                                className="absolute right-5 top-1/2 -translate-y-1/2 hover:opacity-80"
                            >
                                <Image src="/olho.png" alt="" width={20} height={20} />
                            </button>
                        </div>

                        <label htmlFor="confirmarSenha" className="sr-only">Confirmar senha</label>
                        <div className="relative">
                            <input
                                type={mostrarConfirmar ? "text" : "password"}
                                id="confirmarSenha"
                                placeholder="Confirmar Senha"
                                className="w-full rounded-full bg-[#F6F3E4] pl-6 pr-14 py-3 text-[#171918] placeholder:text-[#858585]"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                                aria-label={mostrarConfirmar ? "Esconder confirmação de senha" : "Mostrar confirmação de senha"}
                                className="absolute right-5 top-1/2 -translate-y-1/2 hover:opacity-80"
                            >
                                <Image src="/olho.png" alt="" width={20} height={20} />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={carregando}
                            className="w-full h-[56px] flex items-center justify-center rounded-full bg-[#6A38F3] text-[#FFFFFF] font-semibold uppercase hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed [text-box:trim-both_cap_alphabetic]"
                        >
                            {carregando ? "Criando..." : "Criar conta"}
                        </button>

                        {erro && <p className="text-[var(--white)] text-[20px] text-center">{erro}</p>}
                    </form>

                    <p className="text-[#FFFFFF] mt-6 self-start">
                        Já possui uma conta?{" "}
                        <Link href="/inicial" className="text-[#6A38F3] font-medium transition-colors hover:text-[#c8f000]">
                            Login
                        </Link>
                    </p>
                </div>

                <div className="hidden lg:flex flex-col items-center justify-between absolute top-0 left-[914px]">
                    <Image src="/logo-stockio.png" alt="Logo Stock.io" width={421} height={222} />
                    <Image src="/stocklee.png" alt="" width={500} height={700} />
                </div>
            </main>
        </div>
    );
}
