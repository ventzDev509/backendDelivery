import { IsString, IsEnum, IsOptional, IsEmail, IsNumber } from 'class-validator';
import { VehicleType, DriverStatus } from '@prisma/client';

export class UpdateDriverDto {
    @IsOptional()
    @IsString({ message: 'Non an dwe yon tèks' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'Nimewo telefòn lan dwe yon tèks' })
    phone?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Adrès imèl la pa valab' })
    email?: string;

    @IsOptional()
    @IsEnum(DriverStatus, { message: 'Estati chofè a pa valab' })
    status?: DriverStatus;

    @IsOptional()
    @IsEnum(VehicleType, { message: 'Kalite machin nan pa valab' })
    vehicleType?: VehicleType;

    @IsOptional()
    @IsString({ message: 'Plak la dwe yon tèks' })
    vehiclePlate?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Latitid la dwe yon nimewo' })
    currentLat?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Lonjitid la dwe yon nimewo' })
    currentLng?: number;
}