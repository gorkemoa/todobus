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
    
    // Kullanıcının e-posta adresine gönderilen tüm davetleri bul
    const invitations = await prisma.invitation.findMany({
      where: {
        email: session.user.email,
        status: 'BEKLEMEDE'  // Sadece bekleyen davetleri getir
      },
      include: {
        group: {
          select: {
            name: true,
          },
        },
        invitedBy: {
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
      token: invitation.token,
      status: invitation.status,
      createdAt: invitation.createdAt.toISOString(),
      expiresAt: invitation.expiresAt.toISOString(),
      groupId: invitation.groupId,
      groupName: invitation.group.name,
      invitedByName: invitation.invitedBy.name,
    }));
    
    return NextResponse.json(formattedInvitations);
  } catch (error) {
    console.error('Kullanıcı davetlerini getirme hatası:', error);
    return NextResponse.json(
      { message: 'Davetler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 