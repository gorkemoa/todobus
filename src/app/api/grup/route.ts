import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

// Yeni grup oluşturma
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    // Kullanıcı ID'sinin tanımlı olduğundan emin olalım
    if (!session.user.id) {
      return NextResponse.json(
        { message: "Kullanıcı kimliği bulunamadı" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Grup adı gerekli" },
        { status: 400 }
      );
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        members: {
          create: {
            user: {
              connect: {
                id: session.user.id
              }
            },
            role: "YÖNETİCİ"
          }
        }
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Grup oluşturma hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Grupları listeleme
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const groups = await prisma.group.findMany({
      where: {
        OR: [
          {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        ],
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
            progress: true,
          },
        },
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Grup listeleme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
} 