'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, AlertTriangle, CheckCircle, Users, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type Task = {
  id: string;
  title: string;
  description: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  projectId: string;
  assigneeId: string;
  project: {
    id: string;
    name: string;
    group: {
      id: string;
      name: string;
    };
  };
  assignee: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export default function GorevDetayPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/gorev/${params.id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Sunucu hatası: ${response.status}`);
        }
        
        const data = await response.json();
        setTask(data);
      } catch (err) {
        console.error('Görev detayı yükleme hatası:', err);
        setError(err instanceof Error ? err.message : 'Görev yüklenirken beklenmeyen bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTaskDetails();
    }
  }, [params.id]);

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (!task) return;
    
    try {
      setUpdating(true);
      const response = await fetch(`/api/gorev/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const updatedTask = await response.json();

      if (!response.ok) {
        throw new Error(updatedTask.message || 'Durum güncellenirken bir hata oluştu');
      }

      setTask(updatedTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Durum güncellenirken bir hata oluştu');
      console.error('Görev güncelleme hatası:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!task) {
    return <div className="text-center p-4">Görev bulunamadı.</div>;
  }

  // Durum etiketini getir
  const getStatusBadge = () => {
    switch (task.status) {
      case 'WAITING':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Bekliyor</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Devam Ediyor</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Tamamlandı</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">İptal Edildi</Badge>;
      default:
        return null;
    }
  };

  // Öncelik etiketini getir
  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'LOW':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Düşük Öncelik</Badge>;
      case 'MEDIUM':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Orta Öncelik</Badge>;
      case 'HIGH':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Yüksek Öncelik</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <div className="flex items-center text-muted-foreground mt-1">
            <Button 
              variant="link" 
              className="p-0 h-auto text-muted-foreground hover:text-foreground"
              onClick={() => router.push(`/panel/projeler/${task.project.id}`)}
            >
              {task.project.name}
            </Button>
            <span className="mx-2">•</span>
            <Button 
              variant="link" 
              className="p-0 h-auto text-muted-foreground hover:text-foreground"
              onClick={() => router.push(`/panel/gruplar/${task.project.group.id}`)}
            >
              {task.project.group.name}
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          {getStatusBadge()}
          {getPriorityBadge()}
        </div>
      </div>

      {/* Açıklama */}
      {task.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Açıklama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{task.description}</div>
          </CardContent>
        </Card>
      )}

      {/* Durum Değiştirme Butonları */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">Durumu Değiştir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {task.status !== 'WAITING' && (
              <Button 
                variant="outline" 
                size="sm"
                className="bg-amber-50 hover:bg-amber-100"
                disabled={updating}
                onClick={() => handleStatusChange('WAITING')}
              >
                <Clock className="mr-2 h-4 w-4" />
                Beklemeye Al
              </Button>
            )}
            
            {task.status !== 'IN_PROGRESS' && (
              <Button 
                variant="outline" 
                size="sm"
                className="bg-blue-50 hover:bg-blue-100"
                disabled={updating}
                onClick={() => handleStatusChange('IN_PROGRESS')}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Devam Ediyor
              </Button>
            )}
            
            {task.status !== 'COMPLETED' && (
              <Button 
                variant="outline" 
                size="sm"
                className="bg-green-50 hover:bg-green-100"
                disabled={updating}
                onClick={() => handleStatusChange('COMPLETED')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Tamamlandı
              </Button>
            )}
            
            {task.status !== 'CANCELLED' && (
              <Button 
                variant="outline" 
                size="sm"
                className="bg-red-50 hover:bg-red-100"
                disabled={updating}
                onClick={() => handleStatusChange('CANCELLED')}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                İptal Et
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detay Bilgileri */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">Detaylar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Atanan Kişi</div>
                <div className="flex items-center">
                  {task.assignee.image ? (
                    <img 
                      src={task.assignee.image} 
                      alt={task.assignee.name}
                      className="h-6 w-6 rounded-full mr-2"
                    />
                  ) : (
                    <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                  )}
                  <span>{task.assignee.name}</span>
                </div>
              </div>
              
              {task.dueDate && (
                <div>
                  <div className="text-sm font-medium mb-1">Bitiş Tarihi</div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{format(new Date(task.dueDate), 'dd MMMM yyyy', { locale: tr })}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="text-sm text-muted-foreground">
                <div className="mb-2">
                  <span className="font-medium mr-1">Oluşturulma:</span>
                  {format(new Date(task.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                  {task.createdBy && (
                    <span> - {task.createdBy.name} tarafından</span>
                  )}
                </div>
                
                <div className="mb-2">
                  <span className="font-medium mr-1">Son Güncelleme:</span>
                  {format(new Date(task.updatedAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                </div>
                
                {task.completedAt && (
                  <div>
                    <span className="font-medium mr-1">Tamamlanma:</span>
                    {format(new Date(task.completedAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 