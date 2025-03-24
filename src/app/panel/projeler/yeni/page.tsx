'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Group = {
  id: string;
  name: string;
};

export default function YeniProjePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('/api/grup');
        
        if (!response.ok) {
          throw new Error('Gruplar yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        setError('Gruplar yüklenirken bir hata oluştu');
        console.error('Grup yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !groupId) {
      setError('Proje adı ve grup seçimi zorunludur');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const response = await fetch('/api/proje', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          groupId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Proje oluşturulurken bir hata oluştu');
      }
      
      // Başarıyla oluşturuldu, projeler sayfasına yönlendir
      router.push('/panel/projeler');
      
    } catch (error) {
      console.error('Proje oluşturma hatası:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Proje oluşturulurken bir hata oluştu');
      }
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Yeni Proje Oluştur</h1>
        <Link href="/panel/projeler" className="text-blue-600 hover:text-blue-800">
          &larr; Projelere Dön
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {groups.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 mb-4">Proje oluşturmak için en az bir gruba üye olmanız gerekiyor.</p>
          <Link
            href="/panel/gruplar/yeni"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Önce bir grup oluşturun
          </Link>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Proje Adı*
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Proje adını girin"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Proje açıklamasını girin"
                rows={4}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
                Grup*
              </label>
              <select
                id="group"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Grup Seçin</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting || groups.length === 0}>
                {submitting ? 'Oluşturuluyor...' : 'Projeyi Oluştur'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 