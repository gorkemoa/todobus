'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'BEKLEMEDE' | 'DEVAM_EDIYOR' | 'TAMAMLANDI';
  priority: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK';
  dueDate: string | null;
  projectId: string;
  projectName: string;
  groupId: string;
  groupName: string;
};

export default function GorevlerimPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch('/api/gorev/user');
        
        if (!response.ok) {
          throw new Error('Görevler yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        setError('Veriler yüklenirken bir hata oluştu');
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
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

  const filteredTasks = statusFilter 
    ? tasks.filter(task => task.status === statusFilter)
    : tasks;

  const priorityColors = {
    'DÜŞÜK': 'bg-blue-100 text-blue-800',
    'ORTA': 'bg-yellow-100 text-yellow-800',
    'YÜKSEK': 'bg-red-100 text-red-800'
  };

  const statusColors = {
    'BEKLEMEDE': 'bg-gray-100 text-gray-800',
    'DEVAM_EDIYOR': 'bg-purple-100 text-purple-800',
    'TAMAMLANDI': 'bg-green-100 text-green-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Görevlerim</h1>
        <Link
          href="/panel/gorevlerim/yeni"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          + Yeni Görev
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-3 py-1 rounded-full text-sm ${!statusFilter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Tümü
          </button>
          <button
            onClick={() => setStatusFilter('BEKLEMEDE')}
            className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'BEKLEMEDE' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Beklemede
          </button>
          <button
            onClick={() => setStatusFilter('DEVAM_EDIYOR')}
            className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'DEVAM_EDIYOR' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Devam Ediyor
          </button>
          <button
            onClick={() => setStatusFilter('TAMAMLANDI')}
            className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'TAMAMLANDI' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Tamamlandı
          </button>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {statusFilter ? `${statusFilter.toLowerCase().replace('_', ' ')} durumunda görev bulunamadı.` : 'Henüz bir göreviniz bulunmuyor.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Görev
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proje
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Öncelik
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bitiş Tarihi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/panel/gorevlerim/${task.id}`} className="text-blue-600 hover:underline">
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {task.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/panel/projeler/${task.projectId}`} className="text-sm text-gray-900 hover:underline">
                        {task.projectName}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {task.groupName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                        {task.priority.toLowerCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                        {task.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 