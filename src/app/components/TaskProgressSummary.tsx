'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type TaskStatsSummary = {
  total: number;
  completed: number;
  inProgress: number;
  waiting: number;
  cancelled: number;
  completionRate: number;
};

type TaskProgressSummaryProps = {
  tasks: any[]; // Görev listesi
  title?: string;
};

const TaskProgressSummary: React.FC<TaskProgressSummaryProps> = ({ 
  tasks, 
  title = "Görev İlerlemesi" 
}) => {
  // İstatistikleri hesapla
  const getTaskStats = (): TaskStatsSummary => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'COMPLETED').length;
    const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length;
    const waiting = tasks.filter(task => task.status === 'WAITING').length;
    const cancelled = tasks.filter(task => task.status === 'CANCELLED').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      waiting,
      cancelled,
      completionRate
    };
  };

  const stats = getTaskStats();

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Tamamlanma Oranı</span>
              <span className="font-medium">{stats.completionRate}%</span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded-lg bg-slate-100 p-2">
              <div className="text-lg font-bold">{stats.total}</div>
              <div className="text-xs text-gray-500">Toplam</div>
            </div>
            <div className="rounded-lg bg-green-50 p-2">
              <div className="text-lg font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-gray-500">Tamamlandı</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-2">
              <div className="text-lg font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-xs text-gray-500">Devam Ediyor</div>
            </div>
            <div className="rounded-lg bg-amber-50 p-2">
              <div className="text-lg font-bold text-amber-600">{stats.waiting}</div>
              <div className="text-xs text-gray-500">Bekliyor</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskProgressSummary; 