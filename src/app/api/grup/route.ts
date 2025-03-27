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

    // Debug için kullanıcı bilgileri konsola yazdırılıyor.
    console.log("Session user ID:", session.user.id);
    console.log("Session user:", session.user);

    // Kullanıcı email'inin tanımlı olduğundan emin olalım
    if (!session.user.email) {
      return NextResponse.json(
        { message: "Kullanıcı email adresi bulunamadı" },
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
                // ID yerine email kullanarak kullanıcıyı bağlama
                email: session.user.email
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
    console.error("Hata detayları:", JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { message: "Bir hata oluştu", error: error instanceof Error ? error.message : String(error) },
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