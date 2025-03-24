'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Project = {
  id: string;
  name: string;
  groupId: string;
  groupName: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

export default function YeniGorevPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('ORTA');
  const [projects, setProjects] = useState<Project[]>([]);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/proje');
        
        if (!response.ok) {
          throw new Error('Projeler yüklenirken bir hata oluştu');
        }
        
        const projectsData = await response.json();

        // Proje verilerini düzenliyoruz
          const formattedProjects = projectsData.map((project: Project) => {
          const group = project.group || {};
          return {
            id: project.id,
            name: project.name,
            groupId: project.groupId,
            groupName: group.name || 'Bilinmeyen Grup'
          };
        });
        
        setProjects(formattedProjects);
        setLoading(false);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setError('Projeler yüklenirken bir hata oluştu');
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Proje seçildiğinde grup üyelerini getir
  useEffect(() => {
    if (!projectId) {
      setGroupMembers([]);
      return;
    }

    async function fetchGroupMembers() {
      try {
        // Önce projenin grup ID'sini bul
        const selectedProject = projects.find(p => p.id === projectId);
        if (!selectedProject) return;

        const response = await fetch(`/api/grup/${selectedProject.groupId}/uyeler`);
        
        if (!response.ok) {
          throw new Error('Grup üyeleri yüklenirken bir hata oluştu');
        }
        
        const membersData = await response.json();
        
        // Kullanıcı verilerini düzenle
        const users = membersData.map((member: User) => ({
          id: member.id,
          name: member.name,
          email: member.email,
        }));
        
        setGroupMembers(users);
      } catch (error) {
        console.error('Grup üyeleri yükleme hatası:', error);
        setError('Grup üyeleri yüklenirken bir hata oluştu');
      }
    }

    fetchGroupMembers();
  }, [projectId, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !projectId) {
      setError('Görev başlığı ve proje seçimi zorunludur');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const response = await fetch('/api/gorev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          projectId,
          assigneeId: assigneeId || null,
          priority,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Görev oluşturulurken bir hata oluştu');
      }
      
      // Başarıyla oluşturuldu, görevler sayfasına yönlendir
      router.push('/panel/gorevler');
      
    } catch (error) {
      console.error('Görev oluşturma hatası:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Görev oluşturulurken bir hata oluştu');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Yeni Görev Oluştur</h1>
        <Link href="/panel/gorevler" className="text-blue-600 hover:text-blue-800">
          &larr; Görevlere Dön
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Görev Başlığı*
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Görev başlığını girin"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Görev açıklamasını girin"
              rows={4}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
              Proje*
            </label>
            <select
              id="project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Proje Seçin</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.groupName} / {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
              Atanacak Kişi
            </label>
            <select
              id="assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!projectId || groupMembers.length === 0}
            >
              <option value="">Kişi Seçin</option>
              {groupMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
            {projectId && groupMembers.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Bu projede henüz üye bulunmuyor.
              </p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Öncelik
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DUSUK">Düşük</option>
              <option value="ORTA">Orta</option>
              <option value="YUKSEK">Yüksek</option>
            </select>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Oluşturuluyor...' : 'Görevi Oluştur'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 