import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TicketsService {
  private readonly MAX_TICKETS = 2500;

  constructor(private prisma: PrismaService) {}

  // ✅ NEW: Check if tickets can be sold
  async canSellTicket(quantity: number): Promise<boolean> {
    const count = await this.prisma.ticket.count();
    return count + quantity <= this.MAX_TICKETS;
  }

  // ✅ OPTIONAL: Remaining tickets (for frontend)
  async getRemainingTickets() {
    const count = await this.prisma.ticket.count();
    return {
      remaining: this.MAX_TICKETS - count,
      soldOut: count >= this.MAX_TICKETS,
    };
  }

  async verifyTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return { status: 'invalid', message: 'No Entry' };
    }

    if (ticket.used) {
      return { status: 'used', message: 'Already Used' };
    }

    await this.prisma.ticket.update({
      where: { id: ticketId },
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