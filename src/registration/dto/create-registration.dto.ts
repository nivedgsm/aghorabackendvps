import {
  IsString,
  IsNotEmpty,
  Matches,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRegistrationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Invalid phone number',
  })
  phone: string;

  // 🎟️ Quantity
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'At least 1 ticket required' })
  @Max(10, { message: 'Max 10 tickets allowed per booking' })
  quantity: number;

  // 💳 Payment ID (from Razorpay)
  @IsString()
  @IsNotEmpty()
  paymentId: string;
}