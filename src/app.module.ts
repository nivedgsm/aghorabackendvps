import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistrationModule } from './registration/registration.module';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentsModule } from './payments/payments.module';
import { TicketsModule } from './tickets/tickets.module';
// import {LeadModule} from './lead/lead.module'

@Module({
  imports: [RegistrationModule, PrismaModule, PaymentsModule, TicketsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
