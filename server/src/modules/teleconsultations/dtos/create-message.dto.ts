import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsUUID('4')
  teleconsultationId!: string;

  @IsNotEmpty()
  @IsUUID('4')
  senderId!: string;

  @IsNotEmpty()
  @IsString()
  content!: string;
}

