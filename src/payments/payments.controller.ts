import { Controller, Post, Body, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService, // ✅ FIXED (inject Prisma)
  ) {}

  // 🎟️ Create order + save lead
  @Post('create-order')
  async createOrder(
    @Body()
    body: {
      name: string;
      phone: string;
      quantity: number;
    },
  ) {
    const { name, phone, quantity } = body;

    return this.paymentsService.createOrder(name, phone, quantity);
  }

  // 🔐 Verify payment
  @Post('verify')
  async verify(@Body() body: any) {
    return this.paymentsService.verifyPayment(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
    );
  }

  // ✅ GET LEADS (clean way)
  @Get('leads')
  async getLeads() {
    return this.prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🔴 ADMIN TOGGLE SALES
  @Post('toggle-sales')
  async toggleSales(@Body() body: { enabled: boolean }) {
    return this.prisma.setting.upsert({
      where: { key: 'ticket_sales_enabled' },
      update: { value: String(body.enabled) },
      create: {
        key: 'ticket_sales_enabled',
        value: String(body.enabled),
      },
    });
  }
}