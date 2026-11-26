import TelaComentariosAvaliacao from '@/components/tela-comentario';
import ModalEditarComentario, {
  type UsuarioResumo
} from '@/components/editar-comentario';
export interface Avaliacao {
  id: string;
  nota: number;
  comentario: string | null;
  criadoEm: string;
  usuarioId: string;
  usuario: UsuarioResumo;
  loja?: {
    donoId?: string;
  };
}

export default function PaginaDetalhesComentarioMock() {
  const avaliacaoMock: Avaliacao = {
    id: '00000000-0000-0000-0000-000000000001',
    nota: 5,
    comentario:
      'Adorei o produto. Funcionou muito na minha pele. Estou muito contente e com toda certeza irei comprar mais produtos da marca. Que orgulhoooooooo! Arrasaram',
    criadoEm: '2026-11-21T02:00:00.000Z',
    usuarioId: 'user-sofia-id',
    usuario: {
      id: 'user-sofia-id',
      nome: 'Sofia Figueiredo',
      nomeUsuario: 'sofiafig',
      fotoUrl: null,
    },
    loja: {
      donoId: 'user-selena-id',
    },
  };

  return (
    <TelaComentariosAvaliacao
      avaliacao={avaliacaoMock}
      usuarioLogadoId="user-sofia-id"
      donoDaLojaId="user-selena-id"
    />
  );
}