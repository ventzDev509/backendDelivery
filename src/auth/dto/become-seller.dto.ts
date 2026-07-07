import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';
export class BecomeSellerDto {
  @IsString({ message: 'Non boutik/itilizatè a dwe yon chenn karaktè (string).' })
  @IsNotEmpty({ message: 'Fòk ou mete yon non pou boutik la.' })
  username!: string;

  @IsString({ message: 'Biyografi a dwe yon chenn karaktè (string).' })
  @IsOptional()
  bio?: string;

  @IsString({ message: 'Adrès la dwe yon chenn karaktè (string).' })
  @IsNotEmpty({ message: 'Fòk ou rantre adrès kote boutik la ye a.' })
  location!: string;

  @IsNumber({}, { message: 'Latitid dwe yon nimewo valid' })
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  lat!: number;

  @IsNumber({}, { message: 'Lonjitid la dwe yon chif/nimewo valid.' })
  @IsNotEmpty({ message: 'Kowòdone lonjitid la obligatwa pou livrezon an.' })
  @Transform(({ value }) => parseFloat(value))
  lng!: number;

  @IsString({ message: 'Nimewo telefòn lan dwe yon chenn karaktè (string).' })
  @IsNotEmpty({ message: 'Fòk ou bay yon nimewo telefòn pou kliyan ak chofè ka kontakte w.' })
  phone!: string;

  // 👇 NOUVO CHAN POU PYÈS IDANTITE OWA DOKIMAN BIZNIS LAN
  @IsOptional()
  documentUrl!: string[];
}