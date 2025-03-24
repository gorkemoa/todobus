import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '@/lib/email';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }
    
    const groupId = params.id;
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { message: 'E-posta adresi gereklidir' },
        { status: 400 }
      );
    }
    
    // Grubun var olup olmadığını ve kullanıcının bu grupta yönetici olup olmadığını kontrol et
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: {
            userId: session.user.id,
            role: 'YÖNETİCİ',
          },
        },
      },
    });
    
    if (!group) {
      return NextResponse.json(
        { message: 'Grup bulunamadı' },
        { status: 404 }
      );
    }
    
    if (group.members.length === 0) {
      return NextResponse.json(
        { message: 'Bu işlem için yönetici olmanız gerekiyor' },
        { status: 403 }
      );
    }
    
    // Kullanıcının kayıtlı olup olmadığını kontrol et
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    });
    
    // Kullanıcının zaten grupta olup olmadığını kontrol et
    if (invitedUser) {
      const existingMember = await prisma.groupMember.findFirst({
        where: {
          groupId,
          userId: invitedUser.id,
        },
      });
      
      if (existingMember) {
        return NextResponse.json(
          { message: 'Bu kullanıcı zaten grubun bir üyesi' },
          { status: 400 }
        );
      }
    }
    
    // Kullanıcının zaten davet aldığını kontrol et
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        groupId,
        email,
        status: 'BEKLEMEDE',
      },
    });
    
    if (existingInvitation) {
      return NextResponse.json(
        { message: 'Bu e-posta adresine zaten bir davet gönderilmiş' },
        { status: 400 }
      );
    }
    
    // Yeni davet oluştur
    const token = uuidv4();
    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        status: 'BEKLEMEDE',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün geçerli
        group: {
          connect: { id: groupId },
        },
        invitedBy: {
          connect: { id: session.user.id },
        },
      },
      include: {
        group: true,
        invitedBy: true,
      },
    });
    
    // E-posta gönder
    const inviteUrl = `${process.env.NEXTAUTH_URL}/davet/${token}`;
    
    await sendEmail({
      to: email,
      subject: `TodoBus: ${group.name} grubuna davet edildiniz`,
      html: `
        <h1>TodoBus Grup Daveti</h1>
        <p>Merhaba,</p>
        <p>${invitation.invitedBy.name} sizi "${group.name}" grubuna davet etti.</p>
        <p>Daveti kabul etmek için aşağıdaki bağlantıya tıklayın:</p>
        <p><a href="${inviteUrl}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Daveti Kabul Et</a></p>
        <p>Bu davet 7 gün boyunca geçerlidir.</p>
        <p>Eğer TodoBus üyesi değilseniz, önce bir hesap oluşturmanız gerekecektir.</p>
        <p>Teşekkürler,<br>TodoBus Ekibi</p>
      `,
    });
    
    return NextResponse.json({ message: 'Davet başarıyla gönderildi' });
  } catch (error) {
    console.error('Davet hatası:', error);
    return NextResponse.json(
      { message: 'Davet gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 