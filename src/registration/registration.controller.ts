import {
  Controller,
  Post,
  Body,
  Get,
  BadRequestException,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  // 🔐 Simple Admin Key (change this to something strong)
  private readonly ADMIN_KEY = "SUPER_SECRET_KEY";

  // 🎟️ Create Registration (ONLY after verified payment)
  @Post()
  async create(@Body() dto: CreateRegistrationDto) {
    console.log('📩 Incoming Registration Request:', dto);

    const { name, phone, quantity, paymentId } = dto;

    // 🔒 Basic validation (extra safety layer)
    if (!name || !phone) {
      throw new BadRequestException('Name and phone are required');
    }

    if (!quantity || quantity < 1) {
      throw new BadRequestException('Invalid ticket quantity');
    }

    if (!paymentId) {
      throw new BadRequestException('Payment verification required');
    }

    const result = await this.registrationService.create(dto);

    console.log('✅ Tickets Created:', result.bookingId);

    return result;
  }

  // 📊 Admin: Get All Tickets
  @Get('tickets')
  async getTickets() {
    console.log('📊 Fetching all tickets');
    return this.registrationService.getAllTickets();
  }

  // 📱 Get tickets by phone
  @Get('phone/:phone')
  async getByPhone(@Param('phone') phone: string) {
    return this.registrationService.getTicketsByPhone(phone);
  }

  // 🧹 Admin: Delete tickets by phone (manual cleanup)
  @Delete('admin/delete-by-phone/:phone')
  async deleteByPhone(
    @Param('phone') phone: string,
    @Headers('x-admin-key') key: string,
  ) {
    if (key !== this.ADMIN_KEY) {
      throw new BadRequestException('Unauthorized');
    }

    const result = await this.registrationService.deleteTicketsByPhone(phone);

    return {
      message: 'Tickets deleted successfully',
      deletedCount: result.count,
    };
  }
}