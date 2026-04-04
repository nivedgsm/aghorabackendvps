import { Injectable, BadRequestException } from '@nestjs/common';
import Razorpay = require('razorpay');
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  // 🔐 Admin Phone (move to env later if needed)
  private readonly ADMIN_PHONE = "7025010380123";

  constructor(private prisma: PrismaService) {}

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

  // 🎟️ Create Order + Save Lead
  async createOrder(name: string, phone: string, quantity: number) {
    if (!name || !phone || !quantity) {
      throw new BadRequestException('Missing required fields');
    }

    // 🔐 Check admin
    const isAdmin = phone === this.ADMIN_PHONE;

    // ✅ Save lead BEFORE payment
    await this.saveLead(name, phone);

    const NORMAL_PRICE = 499;

    // 💰 Price logic
    const pricePerTicket = isAdmin ? 1 : NORMAL_PRICE;
    const totalAmount = quantity * pricePerTicket;

    // 🎯 Create Razorpay Order
    return this.razorpay.orders.create({
      amount: totalAmount * 100, // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,

      // 🔥 Helpful metadata
      notes: {
        phone,
        isAdmin: String(isAdmin),
        pricePerTicket: String(pricePerTicket),
      },
    });
  }

  // 🔐 Verify Razorpay signature
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