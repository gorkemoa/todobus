'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Geçersiz e-posta veya şifre');
        setLoading(false);
        return;
      }

      router.push('/panel');
      router.refresh();
    } catch (e) {
      setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md w-full space-y-6 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Giriş Yap</h2>
          <p className="mt-2 text-gray-500 text-sm">TodoBus hesabınıza giriş yapın</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500 shadow-sm border text-sm"
              placeholder="örnek@mail.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500 shadow-sm border text-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-500">
            Hesabınız yok mu?{' '}
            <Link href="/kayit" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
              Kayıt olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 