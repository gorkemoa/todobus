import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TaskList from '@/components/TaskList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Görevler | TodoBus',
  description: 'Tüm görevlerinizi görüntüleyin ve yönetin',
};

async function GorevlerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/giris');
  }
  
  // Kullanıcının görevlerini getir
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        // Kullanıcıya doğrudan atanmış görevler
        {
          assigneeId: session.user.id,
        },
        // Kullanıcının üye olduğu projelerdeki görevler
        {
          project: {
            group: {
              members: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          },
        },
      ],
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Görevler</h1>
      
      <TaskList tasks={tasks} showProject={true} />
    </div>
  );
}

export default GorevlerPage; 