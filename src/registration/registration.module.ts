import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
// import { WhatsAppModule } from 'src/whatsapp/whatsapp.module';


@Module({
  controllers: [RegistrationController],
  providers: [RegistrationService],
    imports: [],

})
export class RegistrationModule {}