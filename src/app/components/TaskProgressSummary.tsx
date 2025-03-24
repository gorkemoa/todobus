import React from 'react';

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

interface TaskProgressSummaryProps {
  tasks: Task[];
  title?: string;
}

export default function TaskProgressSummary({ tasks, title = "Görev İlerlemesi" }: TaskProgressSummaryProps) {
  // Görev istatistikleri hesaplama
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
  const waitingTasks = tasks.filter(task => task.status === 'WAITING').length;
  const cancelledTasks = tasks.filter(task => task.status === 'CANCELLED').length;
  
  // Tamamlanma oranı
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
      
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-800">İlerleme ({completionRate}%)</span>
          <span className="text-sm font-medium text-gray-700">{completedTasks}/{totalTasks}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-yellow-700">{waitingTasks}</div>
          <div className="text-sm font-medium text-gray-700">Bekleyen</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-700">{inProgressTasks}</div>
          <div className="text-sm font-medium text-gray-700">Devam Eden</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-700">{completedTasks}</div>
          <div className="text-sm font-medium text-gray-700">Tamamlanan</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-red-700">{cancelledTasks}</div>
          <div className="text-sm font-medium text-gray-700">İptal Edilen</div>
        </div>
      </div>
    </div>
  );
}
