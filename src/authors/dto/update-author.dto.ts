import { IsOptional, IsString } from 'class-validator';

export class UpdateAuthorDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly biography?: string;
}
