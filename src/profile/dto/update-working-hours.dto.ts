import { IsString, IsBoolean, IsNotEmpty, IsArray, ValidateNested, Matches } from 'class-validator';
import { Type } from 'class-transformer';

class WorkingHourDto {
  @IsString()
  @IsNotEmpty()
  day!: string; 

  @IsBoolean()
  isOpen!: boolean;

  @Matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/, { 
    message: 'Fòma lè a dwe nan fòma 12h (Eg: 08:00 AM oswa 04:30 PM)' 
  })
  openTime!: string; 

  @IsString()
  @Matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/, { 
    message: 'Fòma lè a dwe nan fòma 12h (Eg: 08:00 AM oswa 04:30 PM)' 
  })
  closeTime!: string;
}

export class UpdateWorkingHoursDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHourDto)
  hours!: WorkingHourDto[];
}