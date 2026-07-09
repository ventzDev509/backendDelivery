import { IsString, IsNotEmpty, IsEnum, IsOptional, IsEmail, IsUUID } from 'class-validator';
import { VehicleType } from '@prisma/client';

export class CreateDriverDto {
    @IsString({ message: 'Non an dwe yon tèks' })
    @IsNotEmpty({ message: 'Non an pa ka vid' })
    name!: string;

    @IsString({ message: 'Nimewo telefòn lan dwe yon tèks' })
    @IsNotEmpty({ message: 'Nimewo telefòn lan obligatwa' })
    phone!: string;

    @IsEmail({}, { message: 'Adrès imèl la pa valab' })
    @IsNotEmpty({ message: 'Imèl la obligatwa' })
    email!: string;

   

    @IsEnum(VehicleType, { message: 'Kalite machin nan pa valab' })
    vehicleType!: VehicleType;

    @IsOptional()
    @IsString({ message: 'Plak la dwe yon tèks' })
    vehiclePlate?: string;
}