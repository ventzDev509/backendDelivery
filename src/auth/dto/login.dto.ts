import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Imèl la pa kòrèk.' })
  email!: string;

  @MinLength(6, { message: 'Modpas la kout twòp.' })
  password!: string;
}