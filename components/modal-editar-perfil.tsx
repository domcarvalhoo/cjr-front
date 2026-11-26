"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Eye, EyeOff, X } from "lucide-react";

import { mensagemDeErro } from "@/lib/erro";
import { alterarSenha, atualizarPerfil, excluirConta, trocarFoto, type DadosPerfil, type UsuarioAtualizado } from "@/lib/usuario";

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO = 2 * 1024 * 1024;

const estiloCampo =
    "h-[50px] w-full rounded-full bg-white px-4 text-xl text-preto outline-none placeholder:text-cinza focus:ring-2 focus:ring-roxo/40";
const estiloBotao =
    "h-[50px] w-full cursor-pointer rounded-full text-[22px] transition hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";

type ModalEditarPerfilProps = {
    usuario: UsuarioAtualizado;
    aoFechar: () => void;
    aoSalvar: (usuario: UsuarioAtualizado) => void;
};

// cartao cinza do figma (654px, cantos arredondados), sem titulo visivel.
// fecha no x, no esc ou clicando fora
function CartaoModal({ titulo, aoFechar, children }: { titulo: string; aoFechar: () => void; children: React.ReactNode }) {
    const idTitulo = useId();

    useEffect(() => {
        function aoTeclar(evento: KeyboardEvent) {
            if (evento.key === "Escape") aoFechar();
        }
        const rolagemAntes = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", aoTeclar);
        return () => {
            document.body.style.overflow = rolagemAntes;
            document.removeEventListener("keydown", aoTeclar);
        };
    }, [aoFechar]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget) aoFechar();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={idTitulo}
                className="relative max-h-[calc(100vh-2rem)] w-full max-w-[654px] overflow-y-auto rounded-[29px] bg-cinza-claro px-6 pb-14 pt-14 sm:px-[135px]"
            >
                <h2 id={idTitulo} className="sr-only">
                    {titulo}
                </h2>
                <button
                    type="button"
                    onClick={aoFechar}
                    aria-label="Fechar"
                    className="absolute right-6 top-6 text-preto transition-opacity hover:opacity-70 sm:right-8 sm:top-12"
                >
                    <X className="h-10 w-10" strokeWidth={1.75} />
                </button>
                {children}
            </div>
        </div>
    );
}

function iniciais(nome: string) {
    return nome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0].toUpperCase())
        .join("");
}

// implementacao do modal "editar perfil" do figma: foto, nome, username, email,
// e os botoes deletar conta, alterar senha e salvar
export default function ModalEditarPerfil({ usuario, aoFechar, aoSalvar }: ModalEditarPerfilProps) {
    const router = useRouter();
    const inputFoto = useRef<HTMLInputElement>(null);
    const [dados, setDados] = useState<DadosPerfil>({
        nome: usuario.nome,
        nomeUsuario: usuario.nomeUsuario,
        email: usuario.email,
    });
    const [foto, setFoto] = useState<File | null>(null);
    const [previa, setPrevia] = useState<string | null>(null);
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
    const [trocandoSenha, setTrocandoSenha] = useState(false);

    // a previa da foto escolhida ocupa memoria: libera ao trocar ou fechar
    useEffect(() => {
        return () => {
            if (previa) URL.revokeObjectURL(previa);
        };
    }, [previa]);

    const fotoAtual = previa ?? (usuario.fotoUrl ? `${process.env.NEXT_PUBLIC_API_URL}${usuario.fotoUrl}` : null);

    function escolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
        const arquivo = e.target.files?.[0];
        e.target.value = "";
        if (!arquivo) return;
        if (!TIPOS_ACEITOS.includes(arquivo.type)) {
            setErro("A foto deve ser JPG, PNG ou WEBP.");
            return;
        }
        if (arquivo.size > TAMANHO_MAXIMO) {
            setErro("A foto deve ter no máximo 2 MB.");
            return;
        }
        setErro("");
        setFoto(arquivo);
        setPrevia(URL.createObjectURL(arquivo));
    }

    async function salvar(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const campos = {
            nome: dados.nome.trim(),
            nomeUsuario: dados.nomeUsuario.trim().toLowerCase(),
            email: dados.email.trim().toLowerCase(),
        };
        if (!campos.nome || !campos.nomeUsuario || !campos.email) {
            setErro("Preencha nome, username e email.");
            return;
        }

        // so vai para o back o que mudou
        const alterados: Partial<DadosPerfil> = {};
        if (campos.nome !== usuario.nome) alterados.nome = campos.nome;
        if (campos.nomeUsuario !== usuario.nomeUsuario) alterados.nomeUsuario = campos.nomeUsuario;
        if (campos.email !== usuario.email) alterados.email = campos.email;

        setErro("");
        setSalvando(true);
        try {
            let atualizado = usuario;
            if (Object.keys(alterados).length > 0) {
                atualizado = await atualizarPerfil(alterados);
            }
            if (foto) {
                atualizado = { ...atualizado, fotoUrl: await trocarFoto(foto) };
            }
            aoSalvar(atualizado);
            aoFechar();
        } catch (erroApi) {
            setErro(mensagemDeErro(erroApi, "Não foi possível salvar."));
        } finally {
            setSalvando(false);
        }
    }

    async function deletarConta() {
        setErro("");
        setSalvando(true);
        try {
            await excluirConta();
            router.push("/inicial");
            router.refresh();
        } catch (erroApi) {
            setErro(mensagemDeErro(erroApi, "Não foi possível deletar a conta."));
            setSalvando(false);
        }
    }

    if (trocandoSenha) {
        return <ModalAlterarSenha aoVoltar={() => setTrocandoSenha(false)} aoFechar={aoFechar} />;
    }

    return (
        <CartaoModal titulo="Editar perfil" aoFechar={aoFechar}>
            <form onSubmit={salvar} className="flex flex-col items-center">
                <button
                    type="button"
                    onClick={() => inputFoto.current?.click()}
                    aria-label="Trocar foto de perfil"
                    className="relative mb-9 h-[150px] w-[150px] shrink-0"
                >
                    <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-roxo text-5xl font-bold text-bege">
                        {fotoAtual ? (
                            // previa local ou foto do back, por isso <img>
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={fotoAtual} alt="" className="h-full w-full object-cover" />
                        ) : (
                            iniciais(usuario.nome)
                        )}
                    </span>
                    <span className="absolute -bottom-6 left-1/2 flex h-[60px] w-[60px] -translate-x-1/2 items-center justify-center rounded-full bg-white">
                        <Camera className="h-9 w-9 fill-preto text-white" strokeWidth={1.5} />
                    </span>
                </button>
                <input ref={inputFoto} type="file" accept={TIPOS_ACEITOS.join(",")} onChange={escolherFoto} className="hidden" />

                <div className="flex w-full flex-col gap-5">
                    <label className="sr-only" htmlFor="editar-nome">Nome</label>
                    <input
                        id="editar-nome"
                        placeholder="Nome"
                        className={estiloCampo}
                        value={dados.nome}
                        onChange={(e) => setDados({ ...dados, nome: e.target.value })}
                    />
                    <label className="sr-only" htmlFor="editar-username">Username</label>
                    <input
                        id="editar-username"
                        placeholder="Username"
                        className={estiloCampo}
                        value={dados.nomeUsuario}
                        onChange={(e) => setDados({ ...dados, nomeUsuario: e.target.value })}
                    />
                    <label className="sr-only" htmlFor="editar-email">Email</label>
                    <input
                        id="editar-email"
                        type="email"
                        placeholder="Email"
                        className={estiloCampo}
                        value={dados.email}
                        onChange={(e) => setDados({ ...dados, email: e.target.value })}
                    />
                </div>

                <p className="mt-4 min-h-6 text-center text-lg text-vermelho" role="alert">
                    {erro}
                </p>

                <div className="mt-6 flex w-full flex-col gap-2 px-2">
                    {confirmandoExclusao ? (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmandoExclusao(false)}
                                disabled={salvando}
                                className={`${estiloBotao} border border-cinza text-cinza`}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={deletarConta}
                                disabled={salvando}
                                className={`${estiloBotao} bg-vermelho text-white`}
                            >
                                Confirmar
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirmandoExclusao(true)}
                            className={`${estiloBotao} bg-vermelho text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]`}
                        >
                            Deletar conta
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setTrocandoSenha(true)}
                        className={`${estiloBotao} bg-roxo text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]`}
                    >
                        Alterar senha
                    </button>
                    <button type="submit" disabled={salvando} className={`${estiloBotao} bg-roxo text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]`}>
                        {salvando ? "Salvando..." : "Salvar"}
                    </button>
                </div>
                {confirmandoExclusao && (
                    <p className="mt-3 text-center text-base text-vermelho">
                        Tem certeza? Sua conta será apagada e você sairá do site.
                    </p>
                )}
            </form>
        </CartaoModal>
    );
}

function CampoSenha({ id, placeholder, valor, aoMudar }: { id: string; placeholder: string; valor: string; aoMudar: (valor: string) => void }) {
    const [visivel, setVisivel] = useState(false);
    return (
        <div className="relative">
            <label className="sr-only" htmlFor={id}>{placeholder}</label>
            <input
                id={id}
                type={visivel ? "text" : "password"}
                placeholder={placeholder}
                className={`${estiloCampo} pr-14`}
                value={valor}
                onChange={(e) => aoMudar(e.target.value)}
            />
            <button
                type="button"
                onClick={() => setVisivel(!visivel)}
                aria-label={visivel ? "Esconder senha" : "Mostrar senha"}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-cinza hover:text-preto"
            >
                {visivel ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
        </div>
    );
}

// alterar senha: mesmo cartao, abre a partir do "Alterar senha" do editar perfil
function ModalAlterarSenha({ aoVoltar, aoFechar }: { aoVoltar: () => void; aoFechar: () => void }) {
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState(false);
    const [salvando, setSalvando] = useState(false);

    async function salvar(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!senhaAtual) {
            setErro("Informe a senha atual.");
            return;
        }
        if (novaSenha.length < 6) {
            setErro("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (novaSenha !== confirmar) {
            setErro("As senhas não coincidem.");
            return;
        }
        setErro("");
        setSalvando(true);
        try {
            await alterarSenha(senhaAtual, novaSenha);
            setSucesso(true);
        } catch (erroApi) {
            setErro(mensagemDeErro(erroApi, "Não foi possível alterar a senha."));
        } finally {
            setSalvando(false);
        }
    }

    return (
        <CartaoModal titulo="Alterar senha" aoFechar={aoFechar}>
            <p className="mb-9 text-center text-4xl text-preto">Alterar senha</p>
            {sucesso ? (
                <div className="flex flex-col items-center gap-8">
                    <p className="text-center text-xl text-preto">Senha alterada com sucesso!</p>
                    <button type="button" onClick={aoFechar} className={`${estiloBotao} bg-roxo text-white`}>
                        Fechar
                    </button>
                </div>
            ) : (
                <form onSubmit={salvar} className="flex flex-col">
                    <div className="flex flex-col gap-5">
                        <CampoSenha id="senha-atual" placeholder="Senha atual" valor={senhaAtual} aoMudar={setSenhaAtual} />
                        <CampoSenha id="senha-nova" placeholder="Nova senha" valor={novaSenha} aoMudar={setNovaSenha} />
                        <CampoSenha id="senha-confirmar" placeholder="Confirmar nova senha" valor={confirmar} aoMudar={setConfirmar} />
                    </div>
                    <p className="mt-4 min-h-6 text-center text-lg text-vermelho" role="alert">
                        {erro}
                    </p>
                    <div className="mt-6 flex flex-col gap-2 px-2">
                        <button type="button" onClick={aoVoltar} className={`${estiloBotao} border border-roxo text-roxo`}>
                            Voltar
                        </button>
                        <button type="submit" disabled={salvando} className={`${estiloBotao} bg-roxo text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]`}>
                            {salvando ? "Salvando..." : "Salvar"}
                        </button>
                    </div>
                </form>
            )}
        </CartaoModal>
    );
}
