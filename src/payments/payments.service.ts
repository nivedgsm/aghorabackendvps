import { Injectable, BadRequestException } from '@nestjs/common';
import Razorpay = require('razorpay');
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TicketsService } from 'src/tickets/tickets.service';

@Injectable()
export class PaymentsService {
  private razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,          // ✅ FIXED
    key_secret: process.env.RAZORPAY_KEY_SECRET!,  // ✅ FIXED
  });

  private readonly ADMIN_PHONE = "7025010380123";

  constructor(
    private prisma: PrismaService,
    private ticketsService: TicketsService,
  ) {}

  // ✅ Save Lead
  async saveLead(name: string, phone: string) {
    return this.prisma.lead.upsert({
      where: { phone },
      update: {},
      create: {
        name,
        phone,
      },
    });
  }

  // ✅ Check Admin Toggle (manual stop)
  async isSalesEnabled(): Promise<boolean> {
    const setting = await this.prisma.setting.findUnique({
      where: { key: 'ticket_sales_enabled' },
    });

    if (!setting) return true; // default ON

    return setting.value === 'true';
  }

  // 🎟️ Create Order
  async createOrder(name: string, phone: string, quantity: number) {
    if (!name || !phone || !quantity) {
      throw new BadRequestException('Missing required fields');
    }

    const isAdmin = phone === this.ADMIN_PHONE;

    // ✅ Always save lead
    await this.saveLead(name, phone);

    // 🔴 STEP 1: ADMIN FORCE STOP
    const isEnabled = await this.isSalesEnabled();

    if (!isEnabled && !isAdmin) {
      return {
        success: false,
        message: 'Ticket sales are closed',
        isLead: true,
      };
    }

    // 🔴 STEP 2: TICKET LIMIT CHECK
    if (!isAdmin) {
      const canSell = await this.ticketsService.canSellTicket(quantity);

      if (!canSell) {
        return {
          success: false,
          message: 'Tickets sold out',
          isLead: true,
        };
      }
    }

    // 💰 Pricing
    const NORMAL_PRICE = 499;
    const pricePerTicket = isAdmin ? 1 : NORMAL_PRICE;
    const totalAmount = quantity * pricePerTicket;

    // 🎯 Create Razorpay Order
    return this.razorpay.orders.create({
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,

      notes: {
        phone,
        isAdmin: String(isAdmin),
        pricePerTicket: String(pricePerTicket),
        quantity: String(quantity),
      },
    });
  }

  // 🔐 Verify Payment
  verifyPayment(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
  ) {
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    return {
      success: true,
      paymentId: razorpay_payment_id,
    };
  }
}