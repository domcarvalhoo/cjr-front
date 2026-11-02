'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Store, User, LogOut } from 'lucide-react';
import { api } from '@/lib/api';

interface NavbarProps {
  isLoggedIn: boolean;
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
    const router = useRouter();

    async function handleLogout() {
        try {
        await api.post('/auth/logout'); 
        
        router.refresh(); 
        router.push('/inicial');
        } catch (error) {
        console.error('Erro ao fazer logout', error);
        }
    }
  return (
    <nav className="w-full h-20 bg-black flex items-center justify-between px-8">
      <div className="flex items-center">
        <Link href="/painel">
          <span className="text-3xl font-black text-white tracking-tighter">
            STOCK.I<span className="text-lime-400">O</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-8">
        <button className="text-white hover:text-[#c4f000] transition-colors duration-200 cursor-pointer">
          <ShoppingBag strokeWidth={2.5} className="w-6 h-6" />
        </button>
        <button className="text-white hover:text-[#c4f000] transition-colors duration-200 cursor-pointer">
          <Store strokeWidth={2.5} className="w-6 h-6" />
        </button>

        {isLoggedIn ? (
          <>
            <button className="text-white hover:text-[#c4f000] transition-colors duration-200 cursor-pointer">
              <User strokeWidth={2.5} className="w-6 h-6" />
            </button>
            <button 
              onClick={handleLogout} 
              className="text-white hover:text-red-600 transition-colors duration-200 cursor-pointer"
            >
              <LogOut strokeWidth={2.5} className="w-6 h-6" />
            </button>
          </>
        ) : (
          <>
            <Link 
              href="/inicial" 
              className="text-white font-bold text-sm hover:text-[#7c3aed] transition-colors duration-200 uppercase"
            >
              Login
            </Link>
            <Link 
              href="/cadastro" 
              className="bg-[#7c3aed] text-white font-bold text-sm px-6 py-2 rounded-full hover:bg-white hover:text-[#7c3aed] transition-all duration-200 uppercase"
            >
              Cadastre-se
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}