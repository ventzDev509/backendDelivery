import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class DriverLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(7)
  @Matches(/^[+()\d\s.-]+$/)
  phone!: string;
}
