import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

// Yeni görev oluşturma
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, projectId, assigneeId, priority = "ORTA", status = "BEKLEMEDE", dueDate = null } = body;

    if (!title || !projectId) {
      return NextResponse.json(
        { message: "Görev başlığı ve proje ID'si gerekli" },
        { status: 400 }
      );
    }

    // Projenin varlığını ve kullanıcının erişim yetkisini kontrol et
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        group: {
          OR: [
            { members: { some: { userId: session.user.id } } },
          ],
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Bu projede görev oluşturma yetkiniz yok" },
        { status: 403 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        project: {
          connect: {
            id: projectId,
          },
        },
        ...(assigneeId && {
          assignee: {
            connect: {
              id: assigneeId,
            },
          },
        }),
      },
    });

    // Projenin ilerleme durumunu güncelle
    await updateProjectProgress(projectId);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Görev oluşturma hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Görevleri listeleme
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { message: "Proje ID'si gerekli" },
        { status: 400 }
      );
    }

    // Projenin varlığını ve kullanıcının erişim yetkisini kontrol et
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        group: {
          OR: [
            { members: { some: { userId: session.user.id } } },
          ],
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Bu projenin görevlerini görüntüleme yetkiniz yok" },
        { status: 403 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Görev listeleme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Görev güncelleme (durum değiştirme)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { message: "Görev ID'si ve durum gerekli" },
        { status: 400 }
      );
    }

    // Görevin varlığını ve kullanıcının erişim yetkisini kontrol et
    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
          group: {
            OR: [
              { members: { some: { userId: session.user.id } } },
            ],
          },
        },
      },
      include: {
        project: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { message: "Bu görevi güncelleme yetkiniz yok" },
        { status: 403 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    // Projenin ilerleme durumunu güncelle
    await updateProjectProgress(task.projectId);

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Görev güncelleme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Projenin ilerleme durumunu hesaplama yardımcı fonksiyonu
async function updateProjectProgress(projectId: string) {
  const tasks = await prisma.task.findMany({
    where: {
      projectId,
    },
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "TAMAMLANDI").length;

  // Eğer görev yoksa ilerleme 0
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      progress,
    },
  });
} 