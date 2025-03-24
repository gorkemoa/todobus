'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  updatedAt: string;
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
  status?: 'AÇIK' | 'KAPALI';
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
  const [creating, setCreating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [bulkTaskText, setBulkTaskText] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [commonAssignee, setCommonAssignee] = useState('');
  const [commonPriority, setCommonPriority] = useState('ORTA');

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
        const currentProject = allProjects.find((p: Project) => p.id === projectId);
        
        if (!currentProject) {
          router.push('/panel');
          return;
        }
        
        // Eğer projenin status özelliği yoksa, varsayılan olarak 'AÇIK' yap
        setProject({
          ...currentProject,
          status: currentProject.status || 'AÇIK'
        });
        
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

    // Eğer proje kapalıysa görev eklemeye izin verme
    if (project?.status === 'KAPALI') {
      setError('Kapalı projelere yeni görev eklenemez. Lütfen önce projeyi açın.');
      return;
    }

    try {
      setCreating(true);
      setError(''); // Hata mesajını temizle

      // Metin kutusunu satırlara böl, boş satırları filtrele
      const taskLines = bulkTaskText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Seçili görevleri kontrol et
      let tasksToCreate = taskLines;
      if (selectedTasks.size > 0) {
        tasksToCreate = taskLines.filter((_, index) => selectedTasks.has(index));
      }

      if (tasksToCreate.length === 0) {
        setError('Lütfen en az bir görev ekleyin veya seçin.');
        setCreating(false);
        return;
      }

      // Tüm görevleri toplu olarak gönder
      const responses = await Promise.all(
        tasksToCreate.map(title => 
          fetch('/api/gorev', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title,
              description: null,
              projectId,
              assigneeId: commonAssignee || null,
              priority: commonPriority,
              status: 'BEKLEMEDE',
            }),
          })
        )
      );

      // Yanıtları kontrol et
      const results = await Promise.all(
        responses.map(async (response, index) => {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`"${tasksToCreate[index]}" görevi oluşturulurken hata: ${errorData.message || 'Bilinmeyen hata'}`);
          }
          return response.json();
        })
      );

      // Başarıyla oluşturulan görevleri ekle
      setTasks([...tasks, ...results]);

      // Formu sıfırla
      setBulkTaskText('');
      setSelectedTasks(new Set());
      setShowNewTask(false);

      // Proje ilerlemesini güncelle
      if (project) {
        const completedTasks = tasks.filter(task => task.status === 'TAMAMLANDI').length;
        const totalTasks = tasks.length + results.length;
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

  const handleToggleProjectStatus = async () => {
    if (!project) return;
    
    try {
      setUpdatingStatus(true);
      setError('');
      
      const newStatus = project.status === 'KAPALI' ? 'AÇIK' : 'KAPALI';
      
      const response = await fetch('/api/proje', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: project.id,
          status: newStatus,
        }),
      });
      
      if (!response.ok) {
        // Yanıt başarısız olduğunda
        let errorMessage = 'Proje durumu güncellenirken bir hata oluştu';
        
        try {
          // Yanıt içeriğini kontrol et
          const text = await response.text();
          if (text && text.trim() !== '') {
            // Geçerli JSON ise ayrıştır
            try {
              const errorData = JSON.parse(text);
              errorMessage = errorData.message || errorMessage;
            } catch {
              // JSON değilse, metin olarak kullan
              errorMessage = text || errorMessage;
            }
          }
        } catch {
          console.error('Hata yanıtı okunamadı');
        }
        
        throw new Error(errorMessage);
      }
      
      // Yanıt başarılı olduğunda
      // Yanıt veri içeriyor mu kontrol et
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          await response.json(); // Eğer JSON varsa, işleme
        } catch {
          console.log('API yanıtı boş veya geçersiz JSON içeriyor, bu durum normal olabilir');
        }
      }
      
      // Yanıta bakılmaksızın proje durumunu güncelle
      setProject({
        ...project,
        status: newStatus,
      });
      
    } catch (error) {
      console.error('Proje durumu güncelleme hatası:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Proje durumu güncellenirken bir hata oluştu');
      }
    } finally {
      setUpdatingStatus(false);
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

  // Yeni görev ekleme formunu göster
  const renderNewTaskForm = () => {
    // Eğer proje kapalıysa formu gösterme
    if (project?.status === 'KAPALI') {
      return null;
    }

    if (!showNewTask) return null;

    // Metin kutusunu satırlara böl ve görüntüle
    const taskLines = bulkTaskText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Tüm görevleri seç/kaldır
    const toggleAllTasks = () => {
      if (selectedTasks.size === taskLines.length) {
        // Tüm seçimleri kaldır
        setSelectedTasks(new Set());
      } else {
        // Tümünü seç
        const allIndexes = new Set<number>();
        taskLines.forEach((_, index) => allIndexes.add(index));
        setSelectedTasks(allIndexes);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
          <h3 className="text-lg font-medium mb-4">Toplu Görev Ekle</h3>
          
          <form onSubmit={handleCreateTask}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Görevler (Her satır bir görev olacak)
                </label>
                <textarea
                  value={bulkTaskText}
                  onChange={(e) => setBulkTaskText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={8}
                  placeholder="Görev 1&#10;Görev 2&#10;Görev 3"
                ></textarea>
              </div>

              {taskLines.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Eklenecek Görevler ({selectedTasks.size}/{taskLines.length})
                    </label>
                    <button
                      type="button"
                      onClick={toggleAllTasks}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {selectedTasks.size === taskLines.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {taskLines.map((task, index) => (
                      <div key={index} className="flex items-center py-1 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedTasks.has(index)}
                          onChange={() => {
                            const newSelection = new Set(selectedTasks);
                            if (newSelection.has(index)) {
                              newSelection.delete(index);
                            } else {
                              newSelection.add(index);
                            }
                            setSelectedTasks(newSelection);
                          }}
                          className="h-4 w-4 text-blue-600 mr-3"
                        />
                        <span className="text-sm">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {group && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tüm Görevler İçin Görevli
                  </label>
                  <select
                    value={commonAssignee}
                    onChange={(e) => setCommonAssignee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Görevli seçin (isteğe bağlı)</option>
                    {group.members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tüm Görevler İçin Öncelik
                </label>
                <select
                  value={commonPriority}
                  onChange={(e) => setCommonPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="DÜŞÜK">Düşük</option>
                  <option value="ORTA">Orta</option>
                  <option value="YÜKSEK">Yüksek</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewTask(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                disabled={creating || taskLines.length === 0 || (selectedTasks.size > 0 && selectedTasks.size === 0)}
              >
                {creating ? 'Ekleniyor...' : `${selectedTasks.size > 0 ? selectedTasks.size : taskLines.length} Görevi Ekle`}
              </button>
            </div>
          </form>
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            {group && (
              <Link href={`/panel/gruplar/${group.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                {group.name}
              </Link>
            )}
            <span className="text-gray-500">/</span>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.status === 'KAPALI' && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Kapalı
              </span>
            )}
          </div>
          {project.description && (
            <p className="text-gray-600 mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {project.status !== 'KAPALI' && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/panel/gorevler/yeni?projectId=${project.id}`}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Görev
              </a>
            </Button>
          )}
          <Button 
            variant={project.status === 'KAPALI' ? 'default' : 'outline'} 
            size="sm"
            onClick={handleToggleProjectStatus}
            disabled={updatingStatus}
          >
            {updatingStatus ? 'İşleniyor...' : project.status === 'KAPALI' ? 'Projeyi Aç' : 'Projeyi Kapat'}
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
      
      {/* Yeni Görev Formu */}
      {renderNewTaskForm()}

      {/* Görevler */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-lg font-medium">Görevler ({tasks.length})</h2>
          
          {project.status !== 'KAPALI' && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm flex items-center"
              onClick={() => setShowNewTask(true)}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Toplu Görev Ekle
            </button>
          )}
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
                          <div className="font-medium text-gray-800">{task.title}</div>
                          {task.dueDate && (
                            <div className="flex items-center text-sm text-gray-600 mt-2">
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
                      <div className="text-sm text-gray-600">Bekleyen görev yok</div>
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
                          <div className="font-medium text-gray-800">{task.title}</div>
                          {task.dueDate && (
                            <div className="flex items-center text-sm text-gray-600 mt-2">
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
                      <div className="text-sm text-gray-600">Devam eden görev yok</div>
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
                          <div className="font-medium text-gray-800">{task.title}</div>
                          {task.updatedAt && task.status === 'COMPLETED' && (
                            <div className="flex items-center text-sm text-gray-600 mt-2">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(task.updatedAt), 'dd MMM yyyy', { locale: tr })}
                            </div>
                          )}
                        </div>
                      ))
                    }
                    {project.tasks.filter(task => task.status === 'COMPLETED').length === 0 && (
                      <div className="text-sm text-gray-600">Tamamlanan görev yok</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-muted rounded-lg">
              <p className="mb-4 text-gray-800">Bu projede henüz görev bulunmuyor.</p>
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
          <div className="text-gray-600">
            Proje zaman çizelgesi yakında eklenecek
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 