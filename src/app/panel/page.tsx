'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";


type Group = {
  id: string;
  name: string;
  description: string | null;
  projects: {
    id: string;
    name: string;
    progress: number;
  }[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    projects: number;
    members: number;
  };
};

type Task = {
  id: string;
  title: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  project: {
    id: string;
    name: string;
    group: {
      id: string;
      name: string;
    }
  }
};

export default function PanelPage() {
  useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // Grupları getir
        const groupsResponse = await fetch('/api/grup');
        
        if (!groupsResponse.ok) {
          throw new Error('Gruplar yüklenirken bir hata oluştu');
        }
        
        const groupsData = await groupsResponse.json();
        
        // Veri doğrulama kontrolü
        if (Array.isArray(groupsData)) {
          // Veriyi _count özelliğinin varlığını kontrol ederek temizle
          const validGroups = groupsData.map(group => {
            if (!group._count) {
              // _count yoksa ekle
              return {
                ...group,
                _count: { projects: 0, members: 0 }
              };
            }
            return group;
          });
          setGroups(validGroups);
        } else {
          setGroups([]);
          console.error('API geçersiz grup verisi döndürdü:', groupsData);
        }
        
        // Son görevleri getir
        const tasksResponse = await fetch('/api/gorev/son');
        
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          if (Array.isArray(tasksData)) {
            setTasks(tasksData);
          } else {
            setTasks([]);
            console.error('API geçersiz görev verisi döndürdü:', tasksData);
          }
        }
        
      } catch (error) {
        setError('Veriler yüklenirken bir hata oluştu');
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Görev istatistiklerini hazırla
  const getTaskStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
    const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
    const waitingTasks = tasks.filter(task => task.status === 'WAITING').length;
    
    return {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      waiting: waitingTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
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

  const stats = getTaskStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gösterge Paneli</h1>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" asChild className="font-medium text-gray-700 border-gray-400">
            <Link
              href="/panel/gruplar/yeni"
            >
              <Plus className="h-4 w-4 mr-2" />
              + Yeni Grup
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="font-medium text-gray-700 border-gray-400">
            <Link
              href="/panel/gorevler/yeni"
            >
              <Plus className="h-4 w-4 mr-2" />
              + Yeni Görev
            </Link>
          </Button>
        </div>
      </div>

      {/* Görev İstatistikleri */}
      {tasks.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Görevleriniz</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-sm font-medium text-gray-700 mt-1">Toplam Görev</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-700">{stats.completed}</div>
              <div className="text-sm font-medium text-gray-700 mt-1">Tamamlanan</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-700">{stats.inProgress}</div>
              <div className="text-sm font-medium text-gray-700 mt-1">Devam Eden</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-yellow-700">{stats.waiting}</div>
              <div className="text-sm font-medium text-gray-700 mt-1">Bekleyen</div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Link href="/panel/gorevler" className="text-blue-700 hover:text-blue-900 font-semibold text-base">
              Tüm Görevleri Gör &rarr;
            </Link>
          </div>
        </div>
      )}



      {/* Gruplar */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Gruplarınız</h2>
          <Link href="/panel/gruplar" className="text-blue-700 hover:text-blue-900 font-semibold text-base">
            Tümünü Gör &rarr;
          </Link>
        </div>
        
        {groups.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-700 mb-4 font-medium">Henüz bir grubunuz bulunmuyor.</p>
            <Button asChild className="font-medium">
              <Link
                href="/panel/gruplar/yeni"
              >
                <Plus className="h-4 w-4 mr-2" />
                İlk grubunuzu oluşturun
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.filter(group => group !== null && group !== undefined).slice(0, 3).map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>{group.description || 'Açıklama yok'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{group._count?.projects || 0} Proje</span>
                    <span>{group._count?.members || 0} Üye</span>
                  </div>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto mt-2 font-medium text-blue-700" 
                    onClick={() => router.push(`/panel/gruplar/${group.id}`)}
                  >
                    Detayları Görüntüle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Son görevler kısmı */}
      {tasks.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4 mt-8 text-gray-800">Son Görevler</h2>
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <Card key={task.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="py-3">
                  <div className="flex justify-between items-center">
                    <Link 
                      href={`/panel/gorevler/${task.id}`}
                      className="text-base font-medium hover:underline text-gray-800"
                    >
                      {task.title}
                    </Link>
                    <div className="flex items-center space-x-2">
                      {task.status === 'WAITING' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                          Bekliyor
                        </span>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          Devam Ediyor
                        </span>
                      )}
                      {task.status === 'COMPLETED' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Tamamlandı
                        </span>
                      )}
                      {task.status === 'CANCELLED' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          İptal Edildi
                        </span>
                      )}
                      {task.priority === 'HIGH' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Yüksek Öncelik
                        </span>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    <Link 
                      href={`/panel/projeler/${task.project.id}`}
                      className="text-sm hover:underline text-gray-700 font-medium"
                    >
                      {task.project.name} ({task.project.group.name})
                    </Link>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
            {tasks.length > 5 && (
              <div className="text-center mt-4">
                <Button variant="outline" asChild className="font-medium text-gray-700 border-gray-400">
                  <Link href="/panel/gorevlerim">
                    Tüm Görevleri Görüntüle
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 