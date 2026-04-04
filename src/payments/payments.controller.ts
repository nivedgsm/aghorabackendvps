import { Controller, Post, Body, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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

  // ✅ GET LEADS
  @Get('leads')
  async getLeads() {
    return this.paymentsService['prisma'].lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}