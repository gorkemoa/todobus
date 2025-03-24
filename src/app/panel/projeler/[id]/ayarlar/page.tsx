'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash, Save } from 'lucide-react';

type Project = {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  groupId: string;
  group: {
    id: string;
    name: string;
  };
  createdAt: string;
};

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState('');

  const projectId = params.id as string;

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        
        const projectsResponse = await fetch('/api/proje');
        if (!projectsResponse.ok) {
          throw new Error('Projeler alınamadı');
        }
        
        const allProjects = await projectsResponse.json();
        const currentProject = allProjects.find((p: Project) => p.id === projectId);
        
        if (!currentProject) {
          router.push('/panel');
          return;
        }
        
        setProject(currentProject);
        setName(currentProject.name);
        setDescription(currentProject.description || '');
        
      } catch (error) {
        console.error('Proje bilgileri alınamadı:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Proje bilgileri yüklenirken bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchProject();
  }, [projectId, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Proje adı gereklidir');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/proje', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: projectId,
          name,
          description: description || null,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Proje güncellenirken bir hata oluştu');
      }
      
      const updatedProject = await response.json();
      setProject(updatedProject);
      setSuccess('Proje başarıyla güncellendi');
      
    } catch (error) {
      console.error('Proje güncelleme hatası:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Proje güncellenirken bir hata oluştu');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError('');
      
      const response = await fetch('/api/proje', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: projectId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Proje silinirken bir hata oluştu');
      }
      
      router.push('/panel');
      
    } catch (error) {
      console.error('Proje silme hatası:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Proje silinirken bir hata oluştu');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Proje bulunamadı
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/panel/projeler/${projectId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Projeye Dön
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Proje Ayarları</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Proje Bilgileri</h2>
        
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Proje Adı</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Proje adı girin"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Proje açıklaması girin (isteğe bağlı)"
              rows={4}
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-current rounded-full"></span>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Değişiklikleri Kaydet
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-red-500">
        <h2 className="text-lg font-medium mb-4">Tehlikeli İşlemler</h2>
        
        <p className="text-gray-600 mb-4">
          Bu işlemler geri alınamaz. Lütfen dikkatli olun.
        </p>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={deleting}>
              <Trash className="h-4 w-4 mr-2" />
              Projeyi Sil
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Projeyi silmek istediğinizden emin misiniz?</AlertDialogTitle>
              <AlertDialogDescription>
                Bu işlem geri alınamaz. Bu projeye ait tüm görevler ve veriler kalıcı olarak silinecektir.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
              >
                {deleting ? 'Siliniyor...' : 'Projeyi Sil'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
} 