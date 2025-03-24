'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash, Plus, Calendar, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import TaskProgressSummary from '@/app/components/TaskProgressSummary';
import { tr } from 'date-fns/locale';

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
  group: {
    id: string;
    name: string;
  };
  createdAt: string;
  tasks: Task[];
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

  // Görev istatistiklerini hazırla
  const getTaskStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'TAMAMLANDI').length;
    const inProgressTasks = tasks.filter(task => task.status === 'DEVAM_EDIYOR').length;
    const waitingTasks = tasks.filter(task => task.status === 'BEKLEMEDE').length;
    const cancelledTasks = tasks.filter(task => task.status === 'IPTAL').length;
    
    return {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      waiting: waitingTasks,
      cancelled: cancelledTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };
  
  // Görev ilerlemesi için ilerleme çubuğu ekleyelim
  const renderTaskStats = () => {
    const stats = getTaskStats();
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-medium mb-4">Proje İlerlemesi</h2>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Tamamlanma</span>
          <span className="text-sm font-medium">{stats.completionRate}%</span>
        </div>
        
        <div className="w-full h-4 bg-gray-200 rounded-full mb-4">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${stats.completionRate}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-gray-500">Toplam Görev</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-gray-500">Tamamlanan</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-xs text-gray-500">Devam Eden</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.waiting}</div>
            <div className="text-xs text-gray-500">Bekleyen</div>
          </div>
        </div>
      </div>
    );
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/panel/gorevler/yeni?projectId=${project.id}`}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Görev
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/panel/projeler/${project.id}/ayarlar`}>
              <Users className="h-4 w-4 mr-2" />
              Proje Ayarları
            </a>
          </Button>
        </div>
      </div>

      {/* Görev İlerlemesi */}
      {tasks.length > 0 && renderTaskStats()}
      
      {/* Görevler */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-lg font-medium">Görevler ({tasks.length})</h2>
          
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm flex items-center"
            onClick={() => setShowNewTask(true)}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Yeni Görev
          </button>
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
                      <Link href={`/panel/gorevler/${task.id}`} className="hover:underline">
                        <h3 className={`text-lg font-medium ${task.status === 'TAMAMLANDI' ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h3>
                      </Link>
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
                    {task.status === 'TAMAMLANDI' ? 'Tamamlandı' : 
                     task.status === 'BEKLEMEDE' ? 'Bekliyor' :
                     task.status === 'DEVAM_EDIYOR' ? 'Devam Ediyor' : 'İptal'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Görev İlerlemesi Özeti */}
      {project.tasks && project.tasks.length > 0 && (
        <div className="mb-6">
          <TaskProgressSummary tasks={project.tasks} title="Proje İlerlemesi" />
        </div>
      )}

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Görevler</TabsTrigger>
          <TabsTrigger value="timeline">Zaman Çizelgesi</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="mt-4">
          {project.tasks && project.tasks.length > 0 ? (
            <div className="space-y-4">
              {/* Görevleri Duruma Göre Grupla */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Bekleyen Görevler */}
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    Bekliyor
                  </h3>
                  <div className="space-y-2">
                    {project.tasks
                      .filter(task => task.status === 'WAITING')
                      .map(task => (
                        <div 
                          key={task.id} 
                          className="bg-card p-3 rounded-md border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.location.href = `/panel/gorevler/${task.id}`}
                        >
                          <div className="font-medium">{task.title}</div>
                          {task.dueDate && (
                            <div className="flex items-center text-sm text-muted-foreground mt-2">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(task.dueDate), 'dd MMM yyyy', { locale: tr })}
                            </div>
                          )}
                          {task.priority === 'HIGH' && (
                            <div className="mt-2">
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                Yüksek Öncelik
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    }
                    {project.tasks.filter(task => task.status === 'WAITING').length === 0 && (
                      <div className="text-sm text-muted-foreground">Bekleyen görev yok</div>
                    )}
                  </div>
                </div>

                {/* Devam Eden Görevler */}
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Devam Ediyor
                  </h3>
                  <div className="space-y-2">
                    {project.tasks
                      .filter(task => task.status === 'IN_PROGRESS')
                      .map(task => (
                        <div 
                          key={task.id} 
                          className="bg-card p-3 rounded-md border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.location.href = `/panel/gorevler/${task.id}`}
                        >
                          <div className="font-medium">{task.title}</div>
                          {task.dueDate && (
                            <div className="flex items-center text-sm text-muted-foreground mt-2">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(task.dueDate), 'dd MMM yyyy', { locale: tr })}
                            </div>
                          )}
                          {task.priority === 'HIGH' && (
                            <div className="mt-2">
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                Yüksek Öncelik
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    }
                    {project.tasks.filter(task => task.status === 'IN_PROGRESS').length === 0 && (
                      <div className="text-sm text-muted-foreground">Devam eden görev yok</div>
                    )}
                  </div>
                </div>

                {/* Tamamlanan Görevler */}
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Tamamlandı
                  </h3>
                  <div className="space-y-2">
                    {project.tasks
                      .filter(task => task.status === 'COMPLETED')
                      .map(task => (
                        <div 
                          key={task.id} 
                          className="bg-card p-3 rounded-md border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.location.href = `/panel/gorevler/${task.id}`}
                        >
                          <div className="font-medium">{task.title}</div>
                          {task.completedAt && (
                            <div className="flex items-center text-sm text-muted-foreground mt-2">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(task.completedAt), 'dd MMM yyyy', { locale: tr })}
                            </div>
                          )}
                        </div>
                      ))
                    }
                    {project.tasks.filter(task => task.status === 'COMPLETED').length === 0 && (
                      <div className="text-sm text-muted-foreground">Tamamlanan görev yok</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-muted rounded-lg">
              <p className="mb-4">Bu projede henüz görev bulunmuyor.</p>
              <Button asChild>
                <a href={`/panel/gorevler/yeni?projectId=${project.id}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk görevi oluştur
                </a>
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="timeline" className="mt-4">
          <div className="text-muted-foreground">
            Proje zaman çizelgesi yakında eklenecek
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 