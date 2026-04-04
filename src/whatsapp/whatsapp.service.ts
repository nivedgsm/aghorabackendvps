// src/whatsapp/whatsapp.service.ts

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  private readonly PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  private readonly ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  private readonly BASE_URL = `https://graph.facebook.com/v18.0/${this.PHONE_NUMBER_ID}/messages`;

  constructor(private prisma: PrismaService) {}

  async sendTicket(ticketId: string) {
    if (!this.ACCESS_TOKEN || !this.PHONE_NUMBER_ID) {
      this.logger.error('❌ WhatsApp credentials missing');
      return;
    }

    // 🔍 Fetch ticket
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // 🔒 Prevent duplicate send
    if (ticket.whatsappSent) {
      this.logger.warn(`⏭ Already sent for ${ticketId}`);
      return { skipped: true };
    }

    // 📱 Format phone
    const phone = ticket.phone.startsWith('91')
      ? ticket.phone
      : `91${ticket.phone}`;

    try {
      const res = await axios.post(
        this.BASE_URL,
        {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: {
            body: `🎟️ *Aghora Ticket*

Hi ${ticket.name},

Your registration is confirmed.

🆔 Ticket ID: ${ticket.id}

📱 Show your QR at entry.

View Ticket:
https://yourdomain.com/ticket/${ticket.id}
`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // 🔒 Lock sending
      await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { whatsappSent: true },
      });

      this.logger.log(`✅ Sent for ${ticketId}`);
      return res.data;

    } catch (err: any) {
      this.logger.error(
        '❌ WhatsApp failed',
        err?.response?.data || err.message,
      );
      throw err;
    }
  }
}