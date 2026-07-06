import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Tanpri antre yon adrès imèl ki valab.' })
  email!: string;

  @MinLength(6, { message: 'Modpas la dwe gen omwen 6 karaktè.' })
  password!: string;

  @IsOptional()
  @IsString()
  @Matches(
    /^(\+509)?\s?\d{4}[- ]?\d{4}$/, 
    { message: 'Tanpri antre yon nimewo telefòn ki valab (egzanp: +509 00000000, 00000000, 0000 0000, oswa 0000-0000)' }
  )
  telephone?: string;

  @IsString()
  @IsOptional()
  adress?: string;
}