import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

// Tek bir görevin detaylarını getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    // Görevin var olup olmadığını kontrol et
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            group: {
              include: {
                members: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { message: "Görev bulunamadı" },
        { status: 404 }
      );
    }

    // Kullanıcının görev için yetkilendirildiğini kontrol et
    const isAuthorized =
      task.assigneeId === session.user.id ||
      task.project.group.members.some(
        (member) => member.userId === session.user.id
      );

    if (!isAuthorized) {
      return NextResponse.json(
        { message: "Bu göreve erişim izniniz yok" },
        { status: 403 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Görev detayı getirme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Görev durumunu güncelle
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const session = await getServerSession(authOptions);
    const data = await request.json();

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    // Görevin var olup olmadığını kontrol et
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            group: {
              include: {
                members: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { message: "Görev bulunamadı" },
        { status: 404 }
      );
    }

    // Kullanıcının görev için yetkilendirildiğini kontrol et
    const isAuthorized =
      task.assigneeId === session.user.id ||
      task.project.group.members.some(
        (member) => member.userId === session.user.id
      );

    if (!isAuthorized) {
      return NextResponse.json(
        { message: "Bu görevi güncelleme izniniz yok" },
        { status: 403 }
      );
    }

    // Durumu güncelle
    const updateData: Record<string, unknown> = {};
    
    if (data.status) {
      updateData.status = data.status;
      
      // Eğer görev tamamlandıysa, tamamlanma tarihini ayarla
      if (data.status === 'COMPLETED' && task.status !== 'COMPLETED') {
        updateData.completedAt = new Date();
      }
      
      // Eğer görev tamamlanmış durumdan başka bir duruma geçiyorsa, tamamlanma tarihini sıfırla
      if (data.status !== 'COMPLETED' && task.status === 'COMPLETED') {
        updateData.completedAt = null;
      }
    }
    
    // Varsa diğer alanları güncelle
    if (data.priority) updateData.priority = data.priority;
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.assigneeId) updateData.assigneeId = data.assigneeId;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        project: {
          include: {
            group: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Görev güncelleme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
} 