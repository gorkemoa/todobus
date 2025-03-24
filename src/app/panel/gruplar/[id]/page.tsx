'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CalendarIcon, UserGroupIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

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
    role: string;
  }[];
  createdAt?: string;
};

export default function GroupDetailPage() {
  const params = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('projeler');

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
        console.log('API Yanıtı - Gruplar:', groupsData); // Debug için konsola yazma
        
        const currentGroup = groupsData.find((g: Group) => g.id === groupId);
        
        if (!currentGroup) {
          throw new Error('Grup bulunamadı');
        }
        
        console.log('Seçilen Grup Detayları:', currentGroup); // Debug için grup detaylarını konsola yazma
        console.log('Grup Üyeleri:', currentGroup.members); // Debug için üye listesini konsola yazma
        
        setGroup(currentGroup);
        
        // Projeleri al
        const projectsResponse = await fetch(`/api/proje?groupId=${groupId}`);
        if (!projectsResponse.ok) {
          throw new Error('Projeler alınamadı');
        }
        
        const projectsData = await projectsResponse.json();
        console.log('API Yanıtı - Projeler:', projectsData); // Debug için konsola yazma
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

  const getCompletedTaskCount = (project: Project) => {
    return project.tasks.filter(task => task.completed).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" suppressHydrationWarning>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" suppressHydrationWarning></div>
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
    <div className="max-w-5xl mx-auto">
      {/* Grup başlık alanı */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            {group.description && (
              <p className="mt-2 text-blue-100">{group.description}</p>
            )}
            <div className="mt-4 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              <span>{group.members.length} Üye</span>
              
              <div className="mx-4 h-5 border-l border-blue-300"></div>
              
              <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
              <span>{projects.length} Proje</span>
              
              {group.createdAt && (
                <>
                  <div className="mx-4 h-5 border-l border-blue-300"></div>
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  <span>Oluşturulma: {new Date(group.createdAt).toLocaleDateString('tr-TR')}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowNewProject(!showNewProject)}
            className="bg-white text-blue-700 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg shadow transition duration-200"
          >
            + Yeni Proje
          </button>
        </div>
      </div>

      {/* Yeni proje formu */}
      {showNewProject && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200 animate-fadeIn">
          <h2 className="text-lg font-medium mb-4 text-gray-800">Yeni Proje Ekle</h2>
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

      {/* Sekme menüsü */}
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setSelectedTab('projeler')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              selectedTab === 'projeler' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Projeler
          </button>
          <button
            onClick={() => setSelectedTab('üyeler')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              selectedTab === 'üyeler' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Üyeler
          </button>
          <button
            onClick={() => setSelectedTab('detaylar')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              selectedTab === 'detaylar' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Grup Detayları
          </button>
        </div>
      </div>

      {/* Projeler Sekmesi */}
      {selectedTab === 'projeler' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Projeler ({projects.length})</h2>
            <div>
              <select className="border border-gray-300 rounded-md p-1 text-sm">
                <option>Tümünü Göster</option>
                <option>İsme Göre Sırala</option>
                <option>İlerlemeye Göre Sırala</option>
              </select>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-gray-400 mb-3">
                <ClipboardDocumentCheckIcon className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500 mb-6">Bu grupta henüz bir proje bulunmuyor.</p>
              <button
                onClick={() => setShowNewProject(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
              >
                İlk Projeyi Oluştur
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 p-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-300 overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <Link 
                        href={`/panel/projeler/${project.id}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {project.name}
                      </Link>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {project.progress}%
                      </span>
                    </div>
                    
                    {project.description && (
                      <p className="text-gray-600 mb-4 text-sm">{project.description}</p>
                    )}
                    
                    <div className="mb-3">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            project.progress < 30 ? 'bg-red-500' : 
                            project.progress < 70 ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-500">
                      <div>
                        <span className="font-medium">{getCompletedTaskCount(project)}</span>/{project.tasks.length} görev tamamlandı
                      </div>
                      <Link
                        href={`/panel/projeler/${project.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        Detayları Gör →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Üyeler Sekmesi */}
      {selectedTab === 'üyeler' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Üyeler ({group.members.length})</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {group.members
                .filter(member => member && typeof member === 'object' && member.id)
                .map((member) => (
                <div key={member.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mr-4 text-white font-bold">
                    {member.role ? member.role.substring(0, 2) : 'ÜY'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{member.role || 'Bilinmeyen Rol'}</div>
                    {member.role === 'YÖNETİCİ' || member.id === (group.owner && group.owner.id) ? (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Grup Yöneticisi
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        Üye
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grup Detayları Sekmesi */}
      {selectedTab === 'detaylar' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Grup Detayları</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Grup Adı</h3>
                <p className="text-gray-800 font-medium">{group.name}</p>
              </div>
              
              {group.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Açıklama</h3>
                  <p className="text-gray-800">{group.description}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Grup Yöneticisi</h3>
                <p className="text-gray-800 font-medium">{group.owner.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Üye Sayısı</h3>
                <p className="text-gray-800 font-medium">{group.members.length} Üye</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Proje Sayısı</h3>
                <p className="text-gray-800 font-medium">{projects.length} Proje</p>
              </div>
              
              {group.createdAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Oluşturulma Tarihi</h3>
                  <p className="text-gray-800 font-medium">{new Date(group.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
              )}
              
              <div className="pt-4">
                <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                  Gruptan Ayrıl
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 