import axios from "axios";

import { lerToken } from "./sessao";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// envia o token de login em todas as chamadas, quando existir
api.interceptors.request.use((config) => {
    const token = lerToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
