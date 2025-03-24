import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

// Son görevleri getir (dashboard için)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
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
        updatedAt: 'desc',
      },
      take: 20, // Son 20 görevi getir
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Son görevleri getirme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
} 