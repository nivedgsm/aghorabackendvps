import { Controller, Get, Param , Query} from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get('verify/:ticketId')
  verifyTicket(@Param('ticketId') ticketId: string) {
    return this.ticketsService.verifyTicket(ticketId);
  }
  @Get()
  getTicketsByPhone(@Query('phone') phone: string) {
    return this.ticketsService.getTicketsByPhone(phone);
  }
}