import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Grup detaylarını getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { id: groupId } = await params;

    // Önce kullanıcının bu gruba üye olup olmadığını kontrol et
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: groupId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "Bu gruba erişim izniniz yok" },
        { status: 403 }
      );
    }

    // Grup detaylarını getir
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            progress: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { message: "Grup bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error("Grup detayı getirme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Grup güncelleme
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { id: groupId } = await params;
    const { name, description } = await request.json();

    // Kullanıcının yönetici olup olmadığını kontrol et
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: groupId,
        userId: session.user.id,
        role: "YÖNETİCİ",
      },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "Bu işlem için yönetici olmanız gerekiyor" },
        { status: 403 }
      );
    }

    const updatedGroup = await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error("Grup güncelleme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Grup silme
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { id: groupId } = await params;

    // Kullanıcının yönetici olup olmadığını kontrol et
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: groupId,
        userId: session.user.id,
        role: "YÖNETİCİ",
      },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "Bu işlem için yönetici olmanız gerekiyor" },
        { status: 403 }
      );
    }

    // Grup silme işlemi
    await prisma.group.delete({
      where: {
        id: groupId,
      },
    });

    return NextResponse.json({ message: "Grup başarıyla silindi" });
  } catch (error) {
    console.error("Grup silme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
} 