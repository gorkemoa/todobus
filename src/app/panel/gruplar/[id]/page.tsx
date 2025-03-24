'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Project = {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
};

type Group = {
  id: string;
  name: string;
  description: string | null;
  owner: {
    id: string;
    name: string;
  };
  members: {
    id: string;
    name: string;
  }[];
};

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const groupId = params.id as string;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Grup bilgilerini al
        const groupResponse = await fetch('/api/grup');
        if (!groupResponse.ok) {
          throw new Error('Grup bilgileri alınamadı');
        }
        
        const groupsData = await groupResponse.json();
        const currentGroup = groupsData.find((g: Group) => g.id === groupId);
        
        if (!currentGroup) {
          throw new Error('Grup bulunamadı');
        }
        
        setGroup(currentGroup);
        
        // Projeleri al
        const projectsResponse = await fetch(`/api/proje?groupId=${groupId}`);
        if (!projectsResponse.ok) {
          throw new Error('Projeler alınamadı');
        }
        
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
        
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Veriler yüklenirken bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [groupId]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProjectName.trim()) return;
    
    try {
      setCreating(true);
      
      const response = await fetch('/api/proje', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription || null,
          groupId,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Proje oluşturulurken bir hata oluştu');
      }
      
      const newProject = await response.json();
      
      setProjects([...projects, newProject]);
      setNewProjectName('');
      setNewProjectDescription('');
      setShowNewProject(false);
      
    } catch (error) {
      console.error('Proje oluşturma hatası:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Proje oluşturulurken bir hata oluştu');
      }
    } finally {
      setCreating(false);
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

  if (!group) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Grup bulunamadı
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          {group.description && (
            <p className="text-gray-600 mt-1">{group.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowNewProject(!showNewProject)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          + Yeni Proje
        </button>
      </div>

      {/* Yeni proje formu */}
      {showNewProject && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-medium mb-4">Yeni Proje Ekle</h2>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                Proje Adı
              </label>
              <input
                type="text"
                id="projectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="Proje adı"
                required
              />
            </div>

            <div>
              <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama (İsteğe bağlı)
              </label>
              <textarea
                id="projectDescription"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                rows={3}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="Proje hakkında kısa bir açıklama"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewProject(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={creating || !newProjectName.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {creating ? 'Oluşturuluyor...' : 'Proje Oluştur'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projeler listesi */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Projeler ({projects.length})</h2>
        </div>

        {projects.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Bu grupta henüz bir proje bulunmuyor.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {projects.map((project) => (
              <div key={project.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Link 
                      href={`/panel/projeler/${project.id}`}
                      className="text-lg font-medium text-blue-600 hover:text-blue-800"
                    >
                      {project.name}
                    </Link>
                    {project.description && (
                      <p className="text-gray-600 mt-1">{project.description}</p>
                    )}
                    <div className="text-sm text-gray-500 mt-2">
                      {project.tasks.length} görev
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center mb-2">
                      <div className="text-sm font-medium text-gray-900 mr-2">
                        {project.progress}%
                      </div>
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <Link
                      href={`/panel/projeler/${project.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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

      {/* Üye listesi */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Üyeler ({group.members.length})</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {group.members.map((member) => (
              <div key={member.id} className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-600 font-medium">
                    {member.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{member.name}</div>
                  {member.id === group.owner.id && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Grup Yöneticisi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 