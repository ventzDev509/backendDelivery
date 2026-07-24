import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
export class UpdateProfileDto {
  @IsString({ message: 'Non boutik/itilizatè a dwe yon chenn karaktè (string).' })
  @IsNotEmpty({ message: 'Fòk ou mete yon non pou boutik la.' })
  username!: string;

  @IsString({ message: 'Biyografi a dwe yon chenn karaktè (string).' })
  @IsOptional()
  bio?: string;

//   @IsString({ message: 'Adrès la dwe yon chenn karaktè (string).' })
//   @IsNotEmpty({ message: 'Fòk ou rantre adrès kote boutik la ye a.' })
//   location!: string;


  @IsString({ message: 'Nimewo telefòn lan dwe yon chenn karaktè (string).' })
  @IsNotEmpty({ message: 'Fòk ou bay yon nimewo telefòn pou kliyan ak chofè ka kontakte w.' })
  @Matches(
    /^(\+509)?\s?\d{4}[- ]?\d{4}$/,
    { message: 'Tanpri antre yon nimewo telefòn ki valab (egzanp: +509 00000000, 00000000, 0000 0000, oswa 0000-0000)' }
  )
  phone!: string;

}