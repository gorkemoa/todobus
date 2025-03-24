import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Geçersiz token' },
        { status: 400 }
      );
    }
    
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        group: true,
        invitedBy: true,
      },
    });
    
    if (!invitation) {
      return NextResponse.json(
        { message: 'Davet bulunamadı' },
        { status: 404 }
      );
    }
    
    // Davet kabul edilmiş mi kontrol et
    if (invitation.status === 'KABUL_EDILDI') {
      return NextResponse.json({
        status: 'ACCEPTED',
        message: 'Bu davet daha önce kabul edilmiş',
      });
    }
    
    // Davet süresi dolmuş mu kontrol et
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({
        status: 'EXPIRED',
        message: 'Bu davetin süresi dolmuş',
      });
    }
    
    // Geçerli davet bilgilerini döndür
    return NextResponse.json({
      status: 'VALID',
      groupId: invitation.groupId,
      groupName: invitation.group.name,
      inviterId: invitation.invitedById,
      inviterName: invitation.invitedBy.name,
      email: invitation.email,
    });
  } catch (error) {
    console.error('Davet kontrol hatası:', error);
    return NextResponse.json(
      { message: 'Davet kontrol edilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 