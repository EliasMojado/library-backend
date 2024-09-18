import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty} from 'class-validator';

export class CreateBookDto {
    @IsString()
    @IsNotEmpty()
    readonly title: string;

    @IsString()
    @IsNotEmpty()
    readonly description: string;

    @IsArray()
    @ArrayNotEmpty()
    readonly authorIds: string[];
}