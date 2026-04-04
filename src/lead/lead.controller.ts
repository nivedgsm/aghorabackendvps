// import { Controller, Post, Body } from '@nestjs/common';
// import { LeadService } from './lead.service';

// @Controller('leads')
// export class LeadController {
//   constructor(private readonly leadService: LeadService) {}

//   @Post()
//   async createLead(
//     @Body() body: { name: string; phone: string },
//   ) {
//     return this.leadService.createLead(body.name, body.phone);
//   }
// }