"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import PerfilUsuario, { type UsuarioPerfil } from "@/components/perfil-usuario";
import { api } from "@/lib/api";
import { mensagemDeErro } from "@/lib/erro";
import { lerToken } from "@/lib/sessao";

// perfil de qualquer usuário: /perfil/<id>
export default function PerfilPublico() {
    const { id } = useParams<{ id: string }>();
    const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
    const [ehDono, setEhDono] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        api
            .get<UsuarioPerfil>(`/user/${id}`)
            .then((resposta) => setUsuario(resposta.data))
            .catch((e) => setErro(mensagemDeErro(e, "Usuário não encontrado.")));

        // se quem está vendo é o dono do perfil, mostra o botão "Editar Perfil"
        if (lerToken()) {
            api
                .get<UsuarioPerfil>("/auth/me")
                .then((resposta) => setEhDono(resposta.data.id === id))
                .catch(() => setEhDono(false));
        }
    }, [id]);

    if (erro) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bege">
                <p className="text-2xl text-preto">{erro}</p>
            </div>
        );
    }

    if (!usuario) {
        return null;
    }

    return <PerfilUsuario usuario={usuario} ehDono={ehDono} />;
}
