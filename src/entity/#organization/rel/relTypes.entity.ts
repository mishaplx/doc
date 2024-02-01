import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Справочник типов связок документов" })
@Entity({ name: "rel_types", schema: "sad" })
// обеспечивается логикой relTypes.service с учетом поля del
// @Unique(['name_direct'])
// @Unique(['name_reverse'])
// @Unique(['name_direct', 'name_reverse'])
export class RelTypesEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  /********************************************/
  @Column({ nullable: false, comment: "Прямая связка" })
  @Field({ nullable: false, description: "Прямая связка" })
  name_direct: string;

  /********************************************/
  @Column({ nullable: false, comment: "Обратная связка" })
  @Field({ nullable: false, description: "Обратная связка" })
  name_reverse: string;

  /********************************************/
  @Column({ nullable: true, default: false, comment: "Признак удаления" })
  del: boolean;
  @Column({ nullable: true, default: false, comment: "Признак временной записи" })
  temp: boolean;

  @Column({ nullable: false, default: true, comment: "доступность для изменения" })
  @Field({ nullable: false, description: "доступность для изменения" })
  can_be_edited: boolean;
}
