import { ArgsType, Field } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { Readable } from "stream";
import { valid_bool, valid_int } from "../../../common/utils/utils.dto";

export class fileDateDto {
  stream: Readable;
  originalname: string;
}

@ArgsType()
export class fileCreateDto {
  @Field(() => Number, {
    nullable: true,
    description:
      "Если задано - регистрируется новая версия файла, иначе - регистрируется новый файловый блок",
  })
  @Transform(valid_int)
  idFileBlock?: number;

  @Field(() => Boolean, {
    nullable: true,
    description: "Признак: оставить старое имя файла (не актуально если не задан idFileBlock или установлен file_block_one или загружается несколько файлов)",
  })
  @Transform(valid_bool)
  isFileNameOld?: boolean;

  @Field(() => Number, {
    nullable: true,
    description: "id документа",
  })
  @Transform(valid_int)
  idDoc?: number;

  @Field(() => Number, {
    nullable: true,
    description: "id проекта",
  })
  @Transform(valid_int)
  idProject?: number;

  @Field(() => Number, {
    nullable: true,
    description: "id выполнения проекта",
  })
  @Transform(valid_int)
  idProjectExec?: number;

  @Field(() => Number, {
    nullable: true,
    description: "id поручения",
  })
  @Transform(valid_int)
  idJob?: number;

  @Field(() => Number, {
    nullable: true,
    description: "id входящей почты",
  })
  @Transform(valid_int)
  idIncmail?: number;

  @Field(() => Number, {
    nullable: true,
    description: "id отчета",
  })
  @Transform(valid_int)
  idReport?: number;

  @Field(() => Number, {
    nullable: true,
    description: "id описи",
  })
  @Transform(valid_int)
  idInventory?: number;

  @Field(() => Number, {
    nullable: true,
    description: "id дела (внутренней описи)",
  })
  @Transform(valid_int)
  idDocPackage?: number;

  @Field(() => Number, {
    nullable: true,
    description: "id акта",
  })
  @Transform(valid_int)
  idAct?: number;

  @Field(() => Boolean, {
    nullable: true,
    description: "Признак: карточка РКК",
  })
  @Transform(valid_bool)
  rkk?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: "Признак шаблона",
  })
  @Transform(valid_bool)
  isTemplate?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: "Признак: обязательный файл проекта",
  })
  @Transform(valid_bool)
  project_required?: boolean;

  @Field(() => String, {
    nullable: true,
    description: "Подпись",
  })
  sign?: string;

  @Field(() => Boolean, {
    nullable: true,
    description: "Создавать копию PDF",
  })
  @Transform(valid_bool)
  pdfCreate?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description:
      "Признак: хранить только pdf (после создания pdf уничтожить главный файл, сделав pdf главным)",
  })
  @Transform(valid_bool)
  pdfOnly?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description:
      "Признак: уведомлять о завершении выполнения всех отложенных операций над зависимым файлом (конверация, проверка типа и т.п.)",
  })
  @Transform(valid_bool)
  notifyCompleteDepend?: boolean;

  // ПОКА НЕ ИСПОЛЬЗУЕТСЯ
  // @Field(() => Boolean, {
  //   nullable: true,
  //   description: "Признак: хранить только последнюю версию",
  // })
  // @Transform(valid_bool)
  // oneVersion?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: "Сжатие файла в БД",
  })
  @Transform(valid_bool)
  compress?: boolean;

  @Field(() => String, {
    nullable: true,
    description: "Примечание",
  })
  note?: string = "";
}
