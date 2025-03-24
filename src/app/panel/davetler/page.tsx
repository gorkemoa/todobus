'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Invitation = {
  id: string;
  token: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  groupId: string;
  groupName: string;
  invitedByName: string;
};

export default function GelenDavetlerPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchInvitations() {
      try {
        const response = await fetch('/api/davet/kullanici');
        
        if (!response.ok) {
          throw new Error('Davetler yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        setInvitations(data);
      } catch (error) {
        setError('Veriler yüklenirken bir hata oluştu');
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchInvitations();
  }, []);

  const handleAcceptInvitation = async (token: string) => {
    try {
      router.push(`/davet/${token}`);
    } catch (error) {
      setError('Davet kabul edilirken bir hata oluştu');
      console.error('Davet kabul hatası:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gelen Davetler</h1>
        <Link
          href="/panel"
          className="text-blue-600 hover:text-blue-800"
        >
          &larr; Panele Dön
        </Link>
      </div>

      {invitations.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-500">Henüz bir davet almadınız.</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grup
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Davet Eden
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gönderilme Tarihi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Geçerlilik
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invitations.map((invitation) => (
                  <tr key={invitation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invitation.groupName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invitation.invitedByName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invitation.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invitation.expiresAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleAcceptInvitation(invitation.token)}
                        className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                      >
                        Kabul Et
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 