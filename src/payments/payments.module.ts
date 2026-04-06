import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { TicketsModule } from 'src/tickets/tickets.module';

@Module({
  imports: [TicketsModule], // ✅ BEST PRACTICE
  providers: [
    PaymentsService,
    PrismaService,
  ],
  controllers: [PaymentsController],
})
export class PaymentsModule {}