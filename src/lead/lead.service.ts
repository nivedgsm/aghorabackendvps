// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';

// @Injectable()
// export class LeadService {
//   constructor(private prisma: PrismaService) {}

//   async createLead(name: string, phone: string) {
//     return this.prisma.lead.create({
//       data: {
//         name,
//         phone,
//       },
//     });
//   }
// }