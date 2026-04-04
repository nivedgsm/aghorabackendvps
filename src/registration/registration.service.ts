import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { TicketStatus, Ticket } from '@prisma/client';
import * as QRCode from 'qrcode';

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  // 🔐 Hidden Admin Phone
  private readonly ADMIN_PHONE = "7025010380123";

  // 🎟️ Create Tickets ONLY after payment
  async create(dto: CreateRegistrationDto) {
    const { name, phone, quantity, paymentId } = dto;

    if (!quantity || quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    if (!paymentId) {
      throw new BadRequestException('Payment ID missing');
    }

    // 🔐 Check if admin test number
    const isAdmin = phone === this.ADMIN_PHONE;

    // 🚫 Prevent same payment reuse (skip for admin if you want repeated testing)
    if (!isAdmin) {
      const existingPayment = await this.prisma.ticket.findFirst({
        where: { paymentId },
      });

      if (existingPayment) {
        throw new BadRequestException('Payment already used');
      }
    }

    const bookingId = `AGH-${Date.now()}`;
    const tickets: Ticket[] = [];

    for (let i = 0; i < quantity; i++) {
      // 1️⃣ Create ticket
      const ticket = await this.prisma.ticket.create({
        data: {
          name,
          phone,
          bookingId,
          paymentId,
          status: TicketStatus.VALID,
        },
      });

      // 2️⃣ Generate QR (transparent bg)
      const qrCode = await QRCode.toDataURL(ticket.id, {
        color: {
          dark: "#000000",
          light: "#00000000",
        },
      });

      // 3️⃣ Save QR
      const updatedTicket = await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: { qrCode },
      });

      tickets.push(updatedTicket);
    }

    return {
      message: isAdmin
        ? 'Admin test tickets created (₹1 flow)'
        : 'Tickets created after payment',

      bookingId,
      totalTickets: tickets.length,

      // 👇 expose flag to frontend if needed
      isAdmin,

      tickets: tickets.map((t) => ({
        id: t.id,
        qrCode: t.qrCode,
      })),
    };
  }

  // 📊 Admin: Get all tickets
  async getAllTickets() {
    const tickets = await this.prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map((t) => ({
      id: t.id,
      name: t.name,
      phone: t.phone,
      bookingId: t.bookingId,
      paymentId: t.paymentId,
      status: t.status,
      used: t.used,
      qrCode: t.qrCode,
      createdAt: t.createdAt,
    }));
  }

  // 📱 Get tickets by phone
  async getTicketsByPhone(phone: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map((t) => ({
      id: t.id,
      name: t.name,
      phone: t.phone,
      bookingId: t.bookingId,
      status: t.status,
      used: t.used,
      qrCode: t.qrCode,
      createdAt: t.createdAt,
    }));
  }

  // 🧹 Manual Admin Cleanup (we'll wire in controller later)
  async deleteTicketsByPhone(phone: string) {
    return this.prisma.ticket.deleteMany({
      where: { phone },
    });
  }
}