'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Project = {
  id: string;
  name: string;
  description: string | null;
  groupName: string;
  groupId: string;
  progress: number;
  taskCount: number;
  dueDate: string | null;
};

export default function ProjelerimPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/proje');
        
        if (!response.ok) {
          throw new Error('Projeler yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        setError('Veriler yüklenirken bir hata oluştu');
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
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
    <div className="space-y-6 text-gray-800">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Projelerim</h1>
        <Link
          href="/panel/projeler/yeni"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          + Yeni Proje
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 mb-4">Henüz bir projeniz bulunmuyor.</p>
          <Link
            href="/panel/projeler/yeni"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            İlk projenizi oluşturun
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
                <Link 
                  href={`/panel/gruplar/${project.groupId}`}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                >
                  {project.groupName}
                </Link>
              </div>
              
              {project.description && (
                <p className="text-gray-600 mb-4">{project.description}</p>
              )}
              
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{project.taskCount} Görev</span>
                  {project.dueDate && (
                    <span>Bitiş: {new Date(project.dueDate).toLocaleDateString('tr-TR')}</span>
                  )}
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">İlerleme</span>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link
                    href={`/panel/projeler/${project.id}`}
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