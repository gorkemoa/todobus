'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Member = {
  id: string;
  name: string;
  email: string;
  role: 'YÖNETİCİ' | 'ÜYE';
};

type Group = {
  id: string;
  name: string;
  description: string | null;
};

export default function GrupDavetPage() {
  const params = useParams();
  const groupId = params.id as string;
  
  const [email, setEmail] = useState('');
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchGroupAndMembers() {
      try {
        const [groupResponse, membersResponse] = await Promise.all([
          fetch(`/api/grup/${groupId}`),
          fetch(`/api/grup/${groupId}/uyeler`)
        ]);
        
        if (!groupResponse.ok || !membersResponse.ok) {
          throw new Error('Grup veya üye bilgileri yüklenirken bir hata oluştu');
        }
        
        const groupData = await groupResponse.json();
        const membersData = await membersResponse.json();
        
        setGroup(groupData);
        setMembers(membersData);
      } catch (error) {
        setError('Veriler yüklenirken bir hata oluştu');
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGroupAndMembers();
  }, [groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`/api/grup/${groupId}/davet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Davet gönderilirken bir hata oluştu');
      }
      
      setSuccess('Davet başarıyla gönderildi');
      setEmail('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Davet gönderilirken bir hata oluştu');
      }
      console.error('Davet hatası:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Grup bulunamadı
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/panel/gruplar/${groupId}`}
          className="text-blue-600 hover:text-blue-800"
        >
          &larr; Geri
        </Link>
        <h1 className="text-2xl font-bold">{group.name} - Üye Davet Et</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta Adresi
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          
          <button
            type="submit"
            disabled={submitting}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded ${
              submitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Gönderiliyor...' : 'Davet Gönder'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Mevcut Üyeler</h2>
        
        {members.length === 0 ? (
          <p className="text-gray-500">Henüz üye bulunmuyor.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İsim
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-posta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.role === 'YÖNETİCİ' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 