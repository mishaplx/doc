import { SelectQueryBuilder } from "typeorm";
import { OrderNumEnum, SortEnum } from "../../../../common/enum/enum";
import { NumEntity } from "../../../../entity/#organization/num/num.entity";
import { GetNumArgs, OrderNumInput } from "./num.dto";

export function setQueryBuilderNum(
  args: GetNumArgs,
  orderBy: OrderNumInput,
  queryBuilder: SelectQueryBuilder<NumEntity>,
): void {
  const { num_param_sel, name, kdoc, tdoc, date_start, date_end, note, unit } = args;

  queryBuilder.leftJoinAndSelect("num.NumParamSel", "NumParamSel");
  queryBuilder.leftJoinAndSelect("NumParamSel.NumParam", "NumParam");
  queryBuilder.addCommonTableExpression(
    `
    SELECT "num"."id" AS                                            "s_num_id",
            array_to_string(array_agg("NumParam"."example" ORDER BY "NumParamSel"."id" ASC), '', '') "NumParam_example_str"
    FROM "sad"."num" "num"
      INNER JOIN "sad"."num_param_sel" "NumParamSel" ON "NumParamSel"."num_id" = "num"."id"
      INNER JOIN "sad"."num_param" "NumParam" ON "NumParam"."id" = "NumParamSel"."num_param_id"
    GROUP BY "num"."id"`,
    "s1",
  );
  queryBuilder.leftJoin("s1", "s", 'num.id = "s"."s_num_id"');
  queryBuilder.addSelect('"s"."NumParam_example_str"', "numparam_example_str");
  queryBuilder.leftJoinAndSelect("num.Kdoc", "Kdoc");
  queryBuilder.leftJoinAndSelect("num.Tdocs", "Tdocs");

  if (num_param_sel) {
    queryBuilder.where('"s"."NumParam_example_str" ILIKE :num_param_sel', {
      num_param_sel: `%${num_param_sel}%`,
    });
  }

  if (name) {
    queryBuilder.where("num.name ILIKE :name", { name: `%${name}%` });
  }

  if (kdoc) {
    queryBuilder.andWhere("num.kdoc_id = :kdoc", { kdoc });
  }

  if (tdoc) {
    queryBuilder.addCommonTableExpression(
      `
      SELECT "num"."id"              AS "num_id",
             array_agg("num_Tdocs"."tdoc_id") AS "Tdocs_ids"
      FROM "sad"."num" "num"
            INNER JOIN "sad"."num_tdoc" "num_Tdocs" ON "num_Tdocs"."num_id" = "num"."id"
      GROUP BY "num"."id"`,
      "s2",
    );
    queryBuilder.leftJoin("s2", "s_2", 'num.id = "s_2"."num_id"');
    queryBuilder.andWhere(':tdoc = ANY("s_2"."Tdocs_ids")', { tdoc });
  }

  if (unit) {
    queryBuilder.addCommonTableExpression(
      `
      SELECT "num"."id"                      AS "num_id",
             array_agg("num_Unit"."unit_id") AS "units_ids"
      FROM "sad"."num" "num"
            INNER JOIN "sad"."num_unit" "num_Unit" ON "num_Unit"."num_id" = "num"."id"
      GROUP BY "num"."id"`,
      "s3",
    );
    queryBuilder.leftJoin("s3", "s_3", 'num.id = "s_3"."num_id"');
    queryBuilder.andWhere(':unit = ANY("s_3"."units_ids")', { unit });
  }

  if (date_start) {
    queryBuilder.andWhere("num.date_start::date = :date_start", { date_start });
  }

  if (date_end) {
    queryBuilder.andWhere("num.date_end::date = :date_end", { date_end });
  }

  if (note) {
    queryBuilder.where("num.note ILIKE :note", { note: `%${note}%` });
  }

  getOrderAllNum(queryBuilder, orderBy);
}

function getOrderAllNum(queryBuilder: SelectQueryBuilder<NumEntity>, orderBy: OrderNumInput): void {
  if (!orderBy) {
    queryBuilder.orderBy("num.id", SortEnum.DESC);
    return;
  }

  switch (orderBy.value) {
    case OrderNumEnum.num_param_sel:
      queryBuilder.orderBy("numparam_example_str", orderBy.sortEnum);
      break;
    case OrderNumEnum.name:
      queryBuilder.orderBy("num.name", orderBy.sortEnum);
      break;
    case OrderNumEnum.kdoc:
      queryBuilder.orderBy("Kdoc.nm", orderBy.sortEnum);
      break;
    case OrderNumEnum.date_start:
      queryBuilder.orderBy("num.date_start", orderBy.sortEnum);
      break;
    case OrderNumEnum.date_end:
      queryBuilder.orderBy("num.date_end", orderBy.sortEnum);
      break;
    case OrderNumEnum.note:
      queryBuilder.orderBy("num.note", orderBy.sortEnum);
      break;
    default:
      queryBuilder.orderBy("num.id", SortEnum.DESC);
  }
}
