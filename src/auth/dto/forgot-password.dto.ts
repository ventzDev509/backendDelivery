import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Tanpri antre yon imèl ki valab.' })
  email!: string;
}