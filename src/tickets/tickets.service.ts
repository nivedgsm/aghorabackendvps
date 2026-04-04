import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async verifyTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId }, // ✅ using id
    });

    if (!ticket) {
      return { status: 'invalid', message: 'No Entry' };
    }

    if (ticket.used) {
      return { status: 'used', message: 'Already Used' };
    }

    await this.prisma.ticket.update({
      where: { id: ticketId }, // ✅ using id
      data: { used: true },
    });

    return {
      status: 'valid',
      message: 'Entry Allowed',
      name: ticket.name,
    };
  }
  async getTicketsByPhone(phone: string) {
  if (!phone) {
    throw new Error('Phone number is required');
  }

  return this.prisma.ticket.findMany({
    where: { phone },
    orderBy: { createdAt: 'desc' },
  });
}
}