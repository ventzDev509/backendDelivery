import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  adress?: string;
  
  @IsOptional()
  @IsString()
  username?: string;
} 