import { IsString, IsOptional, IsArray, ArrayNotEmpty, IsNotEmpty } from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @IsOptional() 
  readonly title?: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsArray()
  @ArrayNotEmpty() // Ensures array is not empty
  @IsString({ each: true }) // Ensures each element is a string
  @IsNotEmpty({ each: true }) // Ensures no empty strings are present
  readonly authorIds?: string[];
}
