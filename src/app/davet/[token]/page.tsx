'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type InvitationStatus = 'LOADING' | 'VALID' | 'EXPIRED' | 'ACCEPTED' | 'ERROR';

export default function DavetSayfasi() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  
  const [invitationStatus, setInvitationStatus] = useState<InvitationStatus>('LOADING');
  const [groupName, setGroupName] = useState('');
  const [inviterName, setInviterName] = useState('');
  const [error, setError] = useState('');
  
  const token = params.token as string;

  useEffect(() => {
    async function checkInvitation() {
      try {
        const response = await fetch(`/api/davet/${token}/kontrol`);
        const data = await response.json();
        
        if (!response.ok) {
          setInvitationStatus('ERROR');
          setError(data.message || 'Davet bilgileri alınırken bir hata oluştu');
          return;
        }
        
        if (data.status === 'EXPIRED') {
          setInvitationStatus('EXPIRED');
          return;
        }
        
        if (data.status === 'ACCEPTED') {
          setInvitationStatus('ACCEPTED');
          return;
        }
        
        setGroupName(data.groupName);
        setInviterName(data.inviterName);
        setInvitationStatus('VALID');
      } catch (error) {
        setInvitationStatus('ERROR');
        setError('Davet bilgileri alınırken bir hata oluştu');
        console.error('Davet kontrol hatası:', error);
      }
    }
    
    if (token) {
      checkInvitation();
    }
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (sessionStatus !== 'authenticated') {
      // Kullanıcı giriş yapmadıysa, giriş sayfasına yönlendir
      router.push(`/giris?redirect=/davet/${token}`);
      return;
    }
    
    try {
      setInvitationStatus('LOADING');
      
      const response = await fetch(`/api/davet/${token}/kabul`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setInvitationStatus('ERROR');
        setError(data.message || 'Davet kabul edilirken bir hata oluştu');
        return;
      }
      
      // Başarılı kabul sonrası panele yönlendir
      router.push('/panel');
    } catch (error) {
      setInvitationStatus('ERROR');
      setError('Davet kabul edilirken bir hata oluştu');
      console.error('Davet kabul hatası:', error);
    }
  };

  if (invitationStatus === 'LOADING') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Davet Kontrol Ediliyor</h2>
          <p className="text-gray-600">Lütfen bekleyin...</p>
        </div>
      </div>
    );
  }

  if (invitationStatus === 'ERROR') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-500 text-center mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-center">Hata Oluştu</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <Link href="/panel" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (invitationStatus === 'EXPIRED') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-yellow-500 text-center mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm0-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-center">Davet Süresi Dolmuş</h2>
          <p className="text-gray-600 text-center mb-6">Bu davet artık geçerli değil. Lütfen yeni bir davet isteyin.</p>
          <div className="flex justify-center">
            <Link href="/panel" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (invitationStatus === 'ACCEPTED') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-green-500 text-center mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-center">Davet Zaten Kabul Edilmiş</h2>
          <p className="text-gray-600 text-center mb-6">Bu davet daha önce kabul edilmiş.</p>
          <div className="flex justify-center">
            <Link href="/panel" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
              Panele Git
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2 text-center">Grup Daveti</h2>
        <p className="text-gray-600 text-center mb-6">
          <span className="font-semibold">{inviterName}</span> sizi <span className="font-semibold">{groupName}</span> grubuna davet etti.
        </p>
        
        {sessionStatus === 'loading' ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : sessionStatus === 'authenticated' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center mb-4">
              {session?.user?.email} hesabınızla gruba katılacaksınız.
            </p>
            <button
              onClick={handleAcceptInvitation}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Daveti Kabul Et
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center mb-4">
              Daveti kabul etmek için giriş yapmalısınız.
            </p>
            <Link
              href={`/giris?redirect=/davet/${token}`}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-center"
            >
              Giriş Yap
            </Link>
            <Link
              href={`/kayit?redirect=/davet/${token}`}
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded text-center"
            >
              Kayıt Ol
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 