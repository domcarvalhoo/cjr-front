"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import PerfilUsuario, { type UsuarioPerfil } from "@/components/perfil-usuario";
import { api } from "@/lib/api";
import { mensagemDeErro } from "@/lib/erro";

// perfil de qualquer usuário: /perfil/<id>
export default function PerfilPublico() {
    // o id da url chega como texto: converte para numero
    const id = Number(useParams<{ id: string }>().id);
    const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
    const [ehDono, setEhDono] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        api
            .get<UsuarioPerfil>(`/user/${id}`)
            .then((resposta) => setUsuario(resposta.data))
            .catch((e) => setErro(mensagemDeErro(e, "Usuário não encontrado.")));

        // se quem esta vendo e o dono do perfil, mostra o "Editar Perfil" (sem login da erro e segue como visitante)
        api
            .get<UsuarioPerfil>("/auth/me")
            .then((resposta) => setEhDono(resposta.data.id === id))
            .catch(() => setEhDono(false));
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

    return <PerfilUsuario key={usuario.id} usuario={usuario} ehDono={ehDono} />;
}
