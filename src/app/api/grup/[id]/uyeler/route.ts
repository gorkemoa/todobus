import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Grup üyelerini getir
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

    // Grup üyelerini getir
    const members = await prisma.groupMember.findMany({
      where: {
        groupId: groupId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Grup üyeleri getirme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Grup üyesi ekle (doğrudan ekleme, davet değil)
export async function POST(
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
    const { userId, role = "ÜYE" } = await request.json();

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

    // Kullanıcının zaten grupta olup olmadığını kontrol et
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { message: "Bu kullanıcı zaten grubun bir üyesi" },
        { status: 400 }
      );
    }

    // Grup üyesi ekle
    const newMember = await prisma.groupMember.create({
      data: {
        role,
        group: {
          connect: { id: groupId },
        },
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Grup üyesi ekleme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Grup üyesini güncelle (rolünü değiştir)
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
    const { userId, role } = await request.json();

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

    // Kullanıcının kendisini güncellemediğinden emin ol
    if (userId === session.user.id) {
      return NextResponse.json(
        { message: "Kendi rolünüzü değiştiremezsiniz" },
        { status: 400 }
      );
    }

    // Üyeyi güncelle
    const updatedMember = await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      data: {
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Grup üyesi güncelleme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
} 