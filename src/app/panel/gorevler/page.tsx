import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TaskList from '@/components/TaskList';
import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Görevler | TodoBus',
  description: 'Tüm görevlerinizi görüntüleyin ve yönetin',
};

async function GorevlerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/giris');
  }
  
  // Kullanıcıya atanan görevleri getir
  const assignedTasks = await prisma.task.findMany({
    where: {
      assigneeId: session.user.id,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          groupId: true,
          status: true,
          description: true,
          progress: true,
          group: {
            select: {
              id: true,
              name: true,
              createdAt: true,
              updatedAt: true,
              description: true,
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

  // Kullanıcının üye olduğu projelerdeki görevleri getir
  const projectTasks = await prisma.task.findMany({
    where: {
      project: {
        group: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
      assigneeId: {
        not: session.user.id, // Zaten atanan görevleri ikinci kez getirmemek için
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          groupId: true,
          status: true,
          description: true,
          progress: true,
          group: {
            select: {
              id: true,
              name: true,
              createdAt: true,
              updatedAt: true,
              description: true,
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
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Görevler</h1>
      
      <Tabs defaultValue="assigned" className="w-full mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="assigned">Bana Atanan</TabsTrigger>
          <TabsTrigger value="project">Proje Görevleri</TabsTrigger>
          <TabsTrigger value="all">Tüm Görevler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assigned">
          <h2 className="text-xl font-semibold mb-4">Bana Atanan Görevler</h2>
          <TaskList tasks={assignedTasks} showProject={true} />
        </TabsContent>
        
        <TabsContent value="project">
          <h2 className="text-xl font-semibold mb-4">Projelerimde Bulunan Görevler</h2>
          <TaskList tasks={projectTasks} showProject={true} />
        </TabsContent>
        
        <TabsContent value="all">
          <h2 className="text-xl font-semibold mb-4">Tüm Görevler</h2>
          <TaskList tasks={[...assignedTasks, ...projectTasks]} showProject={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GorevlerPage; 