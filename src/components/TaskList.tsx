'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Task, Project, User, Group } from '@prisma/client';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { CheckCircle, Clock, ArrowUpRight } from 'lucide-react';

type TaskWithRelations = Task & {
  project: (Project & { group: Group }) | null;
  assignees: {
    user: Pick<User, 'id' | 'name' | 'email'>;
  }[];
  createdBy: Pick<User, 'id' | 'name' | 'email'> | null;
};

interface TaskListProps {
  tasks: TaskWithRelations[];
  showProject?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, showProject = false }) => {
  const [filter, setFilter] = useState<'all' | 'open' | 'completed'>('all');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'open') return task.status !== 'TAMAMLANDI';
    if (filter === 'completed') return task.status === 'TAMAMLANDI';
    return true;
  });

  const statusColors: Record<string, string> = {
    BEKLEMEDE: 'bg-yellow-100 text-yellow-800',
    DEVAM_EDIYOR: 'bg-blue-100 text-blue-800',
    TAMAMLANDI: 'bg-green-100 text-green-800',
    IPTAL: 'bg-red-100 text-red-800',
  };

  const priorityColors: Record<string, string> = {
    YUKSEK: 'bg-red-100 text-red-800',
    ORTA: 'bg-yellow-100 text-yellow-800',
    DUSUK: 'bg-green-100 text-green-800',
  };

  if (tasks.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-gray-500 mb-4">Henüz görev bulunamadı.</p>
        <Link href="/panel/gorevler/yeni">
          <Button>Yeni Görev Ekle</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tümü
          </Button>
          <Button
            variant={filter === 'open' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('open')}
          >
            Açık Görevler
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Tamamlananlar
          </Button>
        </div>
        <Link href="/panel/gorevler/yeni">
          <Button>Yeni Görev</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => (
          <Link key={task.id} href={`/panel/gorevler/${task.id}`}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg line-clamp-1">{task.title}</CardTitle>
                  <Badge className={statusColors[task.status]}>
                    {task.status === 'BEKLEMEDE' && 'Beklemede'}
                    {task.status === 'DEVAM_EDIYOR' && 'Devam Ediyor'}
                    {task.status === 'TAMAMLANDI' && 'Tamamlandı'}
                    {task.status === 'IPTAL' && 'İptal'}
                  </Badge>
                </div>
                {showProject && task.project && (
                  <div className="text-sm text-gray-500">
                    {task.project.group.name} / {task.project.name}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-gray-600 line-clamp-2">{task.description}</p>
                <div className="mt-3 flex justify-between">
                  <Badge variant="outline" className={priorityColors[task.priority]}>
                    {task.priority === 'YUKSEK' && 'Yüksek Öncelik'}
                    {task.priority === 'ORTA' && 'Orta Öncelik'}
                    {task.priority === 'DUSUK' && 'Düşük Öncelik'}
                  </Badge>
                  {task.dueDate && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(task.dueDate), 'd MMM yyyy', { locale: tr })}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex -space-x-2">
                  {task.assignees.slice(0, 3).map((assignee) => (
                    <Avatar key={assignee.user.id} className="border-2 border-white h-7 w-7">
                      <AvatarFallback>
                        {assignee.user.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {task.assignees.length > 3 && (
                    <Avatar className="border-2 border-white h-7 w-7">
                      <AvatarFallback>+{task.assignees.length - 3}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {format(new Date(task.createdAt), 'd MMM yyyy', { locale: tr })}
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TaskList; 