import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }
    
    const token = params.token;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Geçersiz token' },
        { status: 400 }
      );
    }
    
    // Daveti bul
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        group: true,
      },
    });
    
    if (!invitation) {
      return NextResponse.json(
        { message: 'Davet bulunamadı' },
        { status: 404 }
      );
    }
    
    // Davet süresi dolmuş mu kontrol et
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { message: 'Bu davetin süresi dolmuş' },
        { status: 400 }
      );
    }
    
    // Davet zaten kabul edilmiş mi kontrol et
    if (invitation.status === 'KABUL_EDILDI') {
      return NextResponse.json(
        { message: 'Bu davet daha önce kabul edilmiş' },
        { status: 400 }
      );
    }
    
    // Kullanıcının e-posta adresi davet e-postasıyla uyumlu mu kontrol et
    if (invitation.email.toLowerCase() !== session.user.email?.toLowerCase()) {
      return NextResponse.json(
        { message: 'Bu davet sizin için değil' },
        { status: 403 }
      );
    }
    
    // Kullanıcının zaten bu grupta olup olmadığını kontrol et
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId: invitation.groupId,
        userId: session.user.id,
      },
    });
    
    if (existingMember) {
      // Kullanıcı zaten grupta, sadece daveti kabul edildi olarak işaretle
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'KABUL_EDILDI',
          acceptedAt: new Date(),
        },
      });
      
      return NextResponse.json({
        message: 'Zaten grubun bir üyesisiniz',
      });
    }
    
    // Davet kabul işlemleri
    await prisma.$transaction([
      // Daveti kabul edildi olarak işaretle
      prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'KABUL_EDILDI',
          acceptedAt: new Date(),
        },
      }),
      
      // Kullanıcıyı gruba üye olarak ekle
      prisma.groupMember.create({
        data: {
          role: 'ÜYE',
          group: {
            connect: { id: invitation.groupId },
          },
          user: {
            connect: { id: session.user.id },
          },
        },
      }),
    ]);
    
    return NextResponse.json({
      message: 'Davet başarıyla kabul edildi',
      groupId: invitation.groupId,
      groupName: invitation.group.name,
    });
  } catch (error) {
    console.error('Davet kabul hatası:', error);
    return NextResponse.json(
      { message: 'Davet kabul edilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 