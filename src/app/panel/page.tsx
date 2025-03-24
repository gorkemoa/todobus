'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type Group = {
  id: string;
  name: string;
  description: string | null;
  projects: {
    id: string;
    name: string;
    progress: number;
  }[];
};

export default function PanelPage() {
  const { data: session } = useSession();
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gösterge Paneli</h1>
        <Link
          href="/panel/gruplar/yeni"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          + Yeni Grup
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 mb-4">Henüz bir grubunuz bulunmuyor.</p>
          <Link
            href="/panel/gruplar/yeni"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            İlk grubunuzu oluşturun
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
              {group.description && (
                <p className="text-gray-600 mb-4">{group.description}</p>
              )}
              
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  {group.projects.length} Proje
                </p>
                
                {group.projects.length > 0 && (
                  <div className="space-y-3">
                    {group.projects.slice(0, 3).map((project) => (
                      <Link
                        key={project.id}
                        href={`/panel/projeler/${project.id}`}
                        className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                      >
                        <span>{project.name}</span>
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {project.progress}%
                          </span>
                        </div>
                      </Link>
                    ))}
                    
                    {group.projects.length > 3 && (
                      <Link
                        href={`/panel/gruplar/${group.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + {group.projects.length - 3} daha
                      </Link>
                    )}
                  </div>
                )}
                
                <div className="mt-4">
                  <Link
                    href={`/panel/gruplar/${group.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Detayları Gör
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 