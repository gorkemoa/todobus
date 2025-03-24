'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Invitation = {
  id: string;
  email: string;
  status: 'BEKLEMEDE' | 'KABUL_EDILDI' | 'REDDEDILDI';
  createdAt: string;
  expiresAt: string;
  groupName: string;
  groupId: string;
};

export default function DavetleriYonetPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchInvitations() {
      try {
        const response = await fetch('/api/davet');
        
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

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/davet/${invitationId}/iptal`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Davet iptal edilirken bir hata oluştu');
      }
      
      // Davet listesini güncelle
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
    } catch (error) {
      setError('Davet iptal edilirken bir hata oluştu');
      console.error('Davet iptal hatası:', error);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/davet/${invitationId}/yeniden-gonder`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Davet yeniden gönderilirken bir hata oluştu');
      }
      
      // İşlem başarılıysa, kullanıcıya bildir
      alert('Davet başarıyla yeniden gönderildi.');
    } catch (error) {
      setError('Davet yeniden gönderilirken bir hata oluştu');
      console.error('Davet yeniden gönderme hatası:', error);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'BEKLEMEDE':
        return 'Beklemede';
      case 'KABUL_EDILDI':
        return 'Kabul Edildi';
      case 'REDDEDILDI':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BEKLEMEDE':
        return 'bg-yellow-100 text-yellow-800';
      case 'KABUL_EDILDI':
        return 'bg-green-100 text-green-800';
      case 'REDDEDILDI':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold">Davetleri Yönet</h1>
        <Link
          href="/panel/gruplar"
          className="text-blue-600 hover:text-blue-800"
        >
          &larr; Gruplarıma Dön
        </Link>
      </div>

      {invitations.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-500">Henüz bir davet göndermediniz.</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-posta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grup
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
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
                      {invitation.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        href={`/panel/gruplar/${invitation.groupId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {invitation.groupName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invitation.status)}`}>
                        {getStatusText(invitation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invitation.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invitation.expiresAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invitation.status === 'BEKLEMEDE' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleResendInvitation(invitation.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Yeniden Gönder
                          </button>
                          <button
                            onClick={() => handleCancelInvitation(invitation.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            İptal Et
                          </button>
                        </div>
                      )}
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