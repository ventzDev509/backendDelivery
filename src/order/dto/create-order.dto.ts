import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsIn, IsInt, IsLatitude, IsLongitude, IsString, IsUUID, Min, MinLength, ValidateNested } from 'class-validator';

export enum OrderPaymentMethod {
  CASH = 'CASH',
  MONCASH = 'MONCASH',
}

export class CreateOrderItemDto {
  @IsUUID()
  menuItemId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsUUID()
  restaurantId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsString()
  @MinLength(5)
  deliveryAddress!: string;

  @Type(() => Number)
  @IsLatitude()
  latitude!: number;

  @Type(() => Number)
  @IsLongitude()
  longitude!: number;

  @IsEnum(OrderPaymentMethod)
  paymentMethod!: OrderPaymentMethod;
}

export class UpdateOrderStatusDto {
  @IsIn(['PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED'])
  status!: 'PREPARING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
}

export class AssignDriverDto {
  @IsUUID()
  driverId!: string;
}
