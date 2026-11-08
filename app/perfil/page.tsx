"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PerfilUsuario, { type UsuarioPerfil } from "@/components/perfil-usuario";
import { api } from "@/lib/api";
import { limparToken } from "@/lib/sessao";

// perfil de quem está logado: /perfil
export default function MeuPerfil() {
    const router = useRouter();
    const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);

    useEffect(() => {
        api
            .get<UsuarioPerfil>("/auth/me")
            .then((resposta) => setUsuario(resposta.data))
            .catch(() => {
                // sem login válido, volta para a tela inicial
                limparToken();
                router.replace("/inicial");
            });
    }, [router]);

    if (!usuario) {
        return null;
    }

    return <PerfilUsuario usuario={usuario} ehDono />;
}
