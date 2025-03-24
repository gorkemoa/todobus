import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }
    
    // Kullanıcının gönderdiği tüm davetleri bul
    const invitations = await prisma.invitation.findMany({
      where: {
        invitedById: session.user.id,
      },
      include: {
        group: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // API yanıtını formatla
    const formattedInvitations = invitations.map(invitation => ({
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      createdAt: invitation.createdAt.toISOString(),
      expiresAt: invitation.expiresAt.toISOString(),
      acceptedAt: invitation.acceptedAt ? invitation.acceptedAt.toISOString() : null,
      groupId: invitation.groupId,
      groupName: invitation.group.name,
    }));
    
    return NextResponse.json(formattedInvitations);
  } catch (error) {
    console.error('Davetleri getirme hatası:', error);
    return NextResponse.json(
      { message: 'Davetler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 