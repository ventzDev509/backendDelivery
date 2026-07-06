import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @MinLength(6, { message: 'Nouvo modpas la dwe gen omwen 6 karaktè.' })
  newPassword!: string;
}