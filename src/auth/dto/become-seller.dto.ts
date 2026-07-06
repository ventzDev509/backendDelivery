import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

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

  @IsNumber({}, { message: 'Latitid la dwe yon chif/nimewo valid.' })
  @IsNotEmpty({ message: 'Kowòdone latitid la obligatwa pou livrezon an.' })
  lat!: number;

  @IsNumber({}, { message: 'Lonjitid la dwe yon chif/nimewo valid.' })
  @IsNotEmpty({ message: 'Kowòdone lonjitid la obligatwa pou livrezon an.' })
  lng!: number;

  @IsString({ message: 'Nimewo telefòn lan dwe yon chenn karaktè (string).' })
  @IsNotEmpty({ message: 'Fòk ou bay yon nimewo telefòn pou kliyan ak chofè ka kontakte w.' })
  phone!: string;

  // 👇 NOUVO CHAN POU PYÈS IDANTITE OWA DOKIMAN BIZNIS LAN
  @IsString({ message: 'Lyen dokiman an dwe yon chenn karaktè (string).' })
  @IsNotEmpty({ message: 'Fòk ou voye yon foto oswa yon kopi pyès idantite w pou verifikasyon.' })
  documentUrl!: string;
}