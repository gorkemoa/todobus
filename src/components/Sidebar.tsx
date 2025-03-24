'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="w-64 bg-white shadow-md p-4 hidden md:block">
      <div className="space-y-2">
        <Link
          href="/panel"
          className={`block px-4 py-2 rounded-md ${
            isActive('/panel')
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Gösterge Paneli
        </Link>
        <Link
          href="/panel/gruplar"
          className={`block px-4 py-2 rounded-md ${
            isActive('/panel/gruplar')
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Gruplarım
        </Link>
        <Link
          href="/panel/projeler"
          className={`block px-4 py-2 rounded-md ${
            isActive('/panel/projeler')
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Projelerim
        </Link>
        <Link
          href="/panel/gorevler"
          className={`block px-4 py-2 rounded-md ${
            isActive('/panel/gorevler')
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Görevlerim
        </Link>
      </div>
    </div>
  );
} 