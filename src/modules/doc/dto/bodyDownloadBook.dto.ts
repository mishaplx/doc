import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsISO8601, IsOptional, Max, Min, ValidateNested } from "class-validator";
type typePropertyColumn = {
  registr?: boolean;
  regNum?: boolean;
  dateReg?: boolean;
  typeDoc: number;
  priv?: boolean;
  correspondent?: boolean;
  outNum?: boolean;
  outDate?: boolean;
  signature?: boolean;
  note?: boolean;
  status?: boolean;
};
class propertyColumn implements typePropertyColumn {
  @ApiProperty({ type: () => Boolean, nullable: true })
  @IsOptional()
  @IsBoolean({ message: "outDate must be a boolean" })
  registr?: boolean;

  @ApiProperty({ type: () => Boolean, nullable: true })
  @IsOptional()
  @IsBoolean({ message: "outDate must be a boolean" })
  regNum?: boolean;

  @ApiProperty({ type: () => Boolean, nullable: true })
  @IsOptional()
  @IsBoolean({ message: "outDate must be a boolean" })
  dateReg?: boolean;

  @ApiProperty({ type: () => Number, nullable: false })
  @IsInt({ message: "typeDoc must be an integer" })
  @Min(1, { message: "typeDoc must be greater than or equal to 1" })
  @Max(3, { message: "typeDoc must be less than or equal to 3" })
  typeDoc: number;

  @ApiProperty({ type: () => Boolean, nullable: true })
  @IsOptional()
  @IsBoolean({ message: "outDate must be a boolean" })
  priv?: boolean;

  @ApiProperty({ type: () => Boolean, nullable: true })
  @IsOptional()
  @IsBoolean({ message: "outDate must be a boolean" })
  correspondent?: boolean;

  @ApiProperty({ type: () => Boolean, nullable: true })
  @IsOptional()
  @IsBoolean({ message: "outDate must be a boolean" })
  outNum?: boolean;

  @ApiProperty({ type: () => Boolean, nullable: true })
  @IsOptional()
  @IsBoolean({ message: "outDate must be a boolean" })
  outDate?: boolean;

  @ApiProperty({ type: () => Boolean, nullable: true })
  @IsOptional()
  @IsBoolean({ message: "outDate must be a boolean" })
  signature?: boolean;

  @ApiProperty({ type: () => Boolean, nullable: true })
  @IsOptional()
  @IsBoolean({ message: "outDate must be a boolean" })
  note?: boolean;

  @ApiProperty({ type: () => Boolean, nullable: true })
  @IsOptional()
  @IsBoolean({ message: "outDate must be a boolean" })
  status?: boolean;
}

export enum PropertyColumnRusName {
  registr = "Регистратор",
  regNum = "Регистрационный номер",
  dateReg = "Дата регистрации",
  typeDoc = "Вид документа",
  priv = "Доступ",
  correspondent = "Корреспондент",
  outNum = "Исх.№",
  outDate = "Исх.дата",
  signature = "Подписал",
  note = "Примичание",
  status = "Статус",
}

export class bodyDownloadBookDTO {
  @ApiProperty()
  @IsOptional()
  @IsBoolean({ message: "outDate must be a boolean" })
  downloadAll?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  startAt?: string;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  endAt?: string;

  @ApiProperty({ type: () => propertyColumn })
  @Type(() => propertyColumn)
  @ValidateNested()
  property: propertyColumn;
}
