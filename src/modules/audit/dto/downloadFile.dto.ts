import { ApiProperty } from "@nestjs/swagger";

export class DownloadFileDto {
  @ApiProperty()
  date_start: Date;

  @ApiProperty()
  date_end: Date;

  @ApiProperty({
    default: true,
  })
  get_date: boolean;
}
