import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl font-bold mb-6">TodoBus</h1>
        <p className="text-xl mb-12">
          Startup'lar için basit ve etkili proje takip sistemi
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/giris"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
          >
            Giriş Yap
          </Link>
          <Link
            href="/kayit"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg"
          >
            Kayıt Ol
          </Link>
        </div>
      </div>
    </main>
  );
}
