'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Project = {
  id: string;
  name: string;
  description: string | null;
  progress: number;
};

type Group = {
  members: Array<{ id: string; user: { id: string; name: string; email: string } }>;
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  projectCount: number;
  projects: Project[];
};

export default function GruplarPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError('Veriler yüklenirken bir hata oluştu');
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gruplarım</h1>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/panel/gruplar/davet"
            className="bg-white border border-green-600 text-green-600 hover:bg-green-50 font-medium py-2 px-4 rounded-md transition-colors"
          >
            Davetleri Yönet
          </Link>
          <Link
            href="/panel/gruplar/yeni"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            + Yeni Grup
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-100">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Henüz bir grubunuz bulunmuyor.</p>
          <Link
            href="/panel/gruplar/yeni"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            İlk grubunuzu oluşturun
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">{group.name}</h2>
              {group.description ? (
                <p className="text-gray-600 mb-4 line-clamp-2">{group.description}</p>
              ) : (
                <p className="text-gray-400 italic mb-4 text-sm">Açıklama bulunmuyor</p>
              )}
              
              <div className="flex gap-4 mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>{group.projects.length > 0 ? `${group.projects.length} Proje` : 'Proje yok'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{group.members.length > 0 ? `${group.members.length} Üye` : 'Henüz üye yok'}</span>
                </div>
              </div>
              
              <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                <Link
                  href={`/panel/gruplar/${group.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Detaylar
                </Link>
                
                <Link
                  href={`/panel/gruplar/${group.id}/davet`}
                  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Davet Et
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 