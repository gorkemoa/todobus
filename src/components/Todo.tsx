'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Task = {
  id: string;
  title: string;
  completed: boolean;
  project: {
    id: string;
    name: string;
    group: {
      id: string;
      name: string;
    };
  };
};

export default function Todo({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        
        // Kullanıcının tüm görevlerini getir
        // NOT: API'yi oluşturmamız gerekecek
        const response = await fetch(`/api/gorev/kullanici`);
        
        if (!response.ok) {
          throw new Error('Görevler alınamadı');
        }
        
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Görev yükleme hatası:', error);
        setError('Görevler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [userId]);

  const toggleTaskStatus = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch('/api/gorev', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: taskId,
          completed,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Görev güncellenemedi');
      }
      
      // Görev listesini güncelle
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));
      
    } catch (error) {
      console.error('Görev güncelleme hatası:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
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

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-4">Yapılacak Görevler ({pendingTasks.length})</h2>
        
        {pendingTasks.length === 0 ? (
          <p className="text-gray-500 italic">Bekleyen göreviniz bulunmuyor.</p>
        ) : (
          <div className="space-y-2">
            {pendingTasks.map(task => (
              <div key={task.id} className="flex items-start p-3 bg-white rounded-lg shadow-sm">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => toggleTaskStatus(task.id, e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer mt-1 mr-3"
                />
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <div className="text-sm text-gray-500">
                    <Link href={`/panel/projeler/${task.project.id}`} className="text-blue-600 hover:text-blue-800">
                      {task.project.name}
                    </Link>
                    {' • '}
                    <Link href={`/panel/gruplar/${task.project.group.id}`} className="text-blue-600 hover:text-blue-800">
                      {task.project.group.name}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-lg font-medium mb-4">Tamamlanmış Görevler ({completedTasks.length})</h2>
        
        {completedTasks.length === 0 ? (
          <p className="text-gray-500 italic">Tamamlanmış göreviniz bulunmuyor.</p>
        ) : (
          <div className="space-y-2">
            {completedTasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => toggleTaskStatus(task.id, e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer mt-1 mr-3"
                />
                <div>
                  <h3 className="font-medium line-through text-gray-500">{task.title}</h3>
                  <div className="text-sm text-gray-400">
                    <Link href={`/panel/projeler/${task.project.id}`} className="text-gray-500 hover:text-gray-700">
                      {task.project.name}
                    </Link>
                    {' • '}
                    <Link href={`/panel/gruplar/${task.project.group.id}`} className="text-gray-500 hover:text-gray-700">
                      {task.project.group.name}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {completedTasks.length > 5 && (
              <div className="text-center pt-2">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  + {completedTasks.length - 5} tamamlanmış görev daha
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 