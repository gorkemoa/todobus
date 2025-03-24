'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: {
    id: string;
    name: string;
  } | null;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  groupId: string;
};

type Group = {
  id: string;
  name: string;
  members: {
    id: string;
    name: string;
  }[];
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('ORTA');
  const [creating, setCreating] = useState(false);

  const projectId = params.id as string;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Önce projeyi getir
        const projectsResponse = await fetch('/api/proje');
        if (!projectsResponse.ok) {
          throw new Error('Projeler alınamadı');
        }
        
        const allProjects = await projectsResponse.json();
        const currentProject = allProjects.find((p: any) => p.id === projectId);
        
        if (!currentProject) {
          router.push('/panel');
          return;
        }
        
        setProject(currentProject);
        
        // Grup bilgilerini al
        const groupsResponse = await fetch('/api/grup');
        if (!groupsResponse.ok) {
          throw new Error('Grup bilgileri alınamadı');
        }
        
        const groupsData = await groupsResponse.json();
        const projectGroup = groupsData.find((g: Group) => g.id === currentProject.groupId);
        
        if (projectGroup) {
          setGroup(projectGroup);
        }
        
        // Görevleri al
        const tasksResponse = await fetch(`/api/gorev?projectId=${projectId}`);
        if (!tasksResponse.ok) {
          throw new Error('Görevler alınamadı');
        }
        
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
        
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
  }, [projectId, router]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) return;
    
    try {
      setCreating(true);
      setError(''); // Hata mesajını temizle
      
      const response = await fetch('/api/gorev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription || null,
          projectId,
          assigneeId: newTaskAssignee || null,
          priority: newTaskPriority,
          status: 'BEKLEMEDE',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Görev oluşturma hatası:', errorData);
        throw new Error(errorData.message || 'Görev oluşturulurken bir hata oluştu');
      }
      
      const newTask = await response.json();
      console.log('Yeni görev oluşturuldu:', newTask);
      
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskAssignee('');
      setNewTaskPriority('ORTA');
      setShowNewTask(false);
      
      // Proje ilerlemesini güncelle
      if (project) {
        const completedTasks = tasks.filter(task => task.status === 'TAMAMLANDI').length + (newTask.status === 'TAMAMLANDI' ? 1 : 0);
        const totalTasks = tasks.length + 1;
        const progress = Math.round((completedTasks / totalTasks) * 100);
        
        setProject({
          ...project,
          progress,
        });
      }
      
    } catch (error) {
      console.error('Görev oluşturma hatası:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Görev oluşturulurken bir hata oluştu');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleToggleTaskStatus = async (taskId: string, completed: boolean) => {
    try {
      const status = completed ? 'TAMAMLANDI' : 'BEKLEMEDE';
      
      const response = await fetch('/api/gorev', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: taskId,
          status,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Görev güncellenirken bir hata oluştu');
      }
      
      // Görev listesini güncelle
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status } : task
      ));
      
      // Proje ilerlemesini güncelle
      if (project) {
        const updatedTasks = tasks.map(task => 
          task.id === taskId ? { ...task, status } : task
        );
        const completedTasks = updatedTasks.filter(task => task.status === 'TAMAMLANDI').length;
        const progress = Math.round((completedTasks / updatedTasks.length) * 100);
        
        setProject({
          ...project,
          progress,
        });
      }
      
    } catch (error) {
      console.error('Görev güncelleme hatası:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Görev güncellenirken bir hata oluştu');
      }
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

  if (!project) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Proje bulunamadı
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.status === 'TAMAMLANDI').length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            {group && (
              <Link href={`/panel/gruplar/${group.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                {group.name}
              </Link>
            )}
            <span className="text-gray-500">/</span>
            <h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
          {project.description && (
            <p className="text-gray-600 mt-1">{project.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowNewTask(!showNewTask)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          + Yeni Görev
        </button>
      </div>

      {/* İlerleme bilgisi */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-medium mb-2">Proje İlerlemesi</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <div className="w-full h-4 bg-gray-200 rounded-full mr-2" style={{ width: '300px' }}>
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <span className="font-medium text-lg">
                  {project.progress}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{tasks.length}</div>
              <div className="text-sm text-gray-500">Toplam</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{pendingTasks}</div>
              <div className="text-sm text-gray-500">Bekliyor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{completedTasks}</div>
              <div className="text-sm text-gray-500">Tamamlandı</div>
            </div>
          </div>
        </div>
      </div>

      {/* Yeni görev formu */}
      {showNewTask && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-medium mb-4">Yeni Görev Ekle</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Görev Başlığı
              </label>
              <input
                type="text"
                id="taskTitle"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="Görev başlığı"
                required
              />
            </div>

            <div>
              <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama (İsteğe bağlı)
              </label>
              <textarea
                id="taskDescription"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={3}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="Görev hakkında kısa bir açıklama"
              />
            </div>

            {group && (
              <div>
                <label htmlFor="taskAssignee" className="block text-sm font-medium text-gray-700 mb-1">
                  Görevli (İsteğe bağlı)
                </label>
                <select
                  id="taskAssignee"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                >
                  <option value="">Görevli seçin</option>
                  {group.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewTask(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={creating || !newTaskTitle.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {creating ? 'Oluşturuluyor...' : 'Görev Oluştur'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Görevler listesi */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Görevler ({tasks.length})</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Bu projede henüz bir görev bulunmuyor.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div key={task.id} className={`p-6 ${task.status === 'TAMAMLANDI' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={task.status === 'TAMAMLANDI'}
                        onChange={(e) => handleToggleTaskStatus(task.id, e.target.checked)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <h3 className={`text-lg font-medium ${task.status === 'TAMAMLANDI' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`mt-1 ${task.status === 'TAMAMLANDI' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      )}
                      {task.assignee && (
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Görevli: {task.assignee.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {task.status === 'TAMAMLANDI' ? 'Tamamlandı' : 'Bekliyor'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 