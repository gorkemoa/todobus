import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

// Yeni proje oluşturma
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
    const { name, description, groupId } = body;

    if (!name || !groupId) {
      return NextResponse.json(
        { message: "Proje adı ve grup ID'si gerekli" },
        { status: 400 }
      );
    }

    // Kullanıcının gruba ait olup olmadığını kontrol et
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: groupId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "Bu grupta proje oluşturma yetkiniz yok" },
        { status: 403 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        group: {
          connect: {
            id: groupId,
          },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Proje oluşturma hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Projeleri listeleme
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
    const groupId = searchParams.get("groupId");

    // Eğer groupId belirtilmişse, sadece o gruba ait projeleri getir
    if (groupId) {
      // Kullanıcının gruba ait olup olmadığını kontrol et
      const membership = await prisma.groupMember.findFirst({
        where: {
          groupId: groupId,
          userId: session.user.id,
        },
      });

      if (!membership) {
        return NextResponse.json(
          { message: "Bu grubun projelerini görüntüleme yetkiniz yok" },
          { status: 403 }
        );
      }

      const projects = await prisma.project.findMany({
        where: {
          groupId,
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(projects);
    } 
    // Eğer groupId belirtilmemişse, kullanıcının erişimi olan tüm projeleri getir
    else {
      // Kullanıcının üye olduğu tüm gruplar
      const userGroups = await prisma.groupMember.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          groupId: true,
        },
      });

      const groupIds = userGroups.map(g => g.groupId);

      const projects = await prisma.project.findMany({
        where: {
          groupId: {
            in: groupIds,
          },
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(projects);
    }
  } catch (error) {
    console.error("Proje listeleme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Projeleri güncelleme
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
    const { id, status, name, description } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Proje ID'si gerekli" },
        { status: 400 }
      );
    }

    // Projeyi ve kullanıcının yetkisini kontrol et
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        group: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Proje bulunamadı" },
        { status: 404 }
      );
    }

    // Kullanıcının yetkisi var mı kontrol et
    if (project.group.members.length === 0) {
      return NextResponse.json(
        { message: "Bu projeyi güncelleme yetkiniz yok" },
        { status: 403 }
      );
    }

    // Güncelleme verilerini hazırla
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    // Projeyi güncelle
    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Proje güncelleme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 