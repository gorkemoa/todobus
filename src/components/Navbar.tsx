'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/panel" className="flex-shrink-0 flex items-center">
              <span className="text-blue-600 font-bold text-xl">TodoBus</span>
            </Link>
          </div>
          <div className="flex items-center">
            {session?.user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Merhaba, {session.user.name}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md px-3 py-2 text-sm font-medium"
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 