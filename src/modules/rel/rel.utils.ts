import { Brackets, SelectQueryBuilder } from "typeorm";

import { SortEnum } from "../../common/enum/enum";
import { RelEntity } from "../../entity/#organization/rel/rel.entity";
import { RelGet } from "./dto/rel.find.dto";
import { OrderRelEnum, RelOrder } from "./dto/rel.order.dto";

export function setQueryBuiderRel(
  args: RelGet,
  qb: SelectQueryBuilder<RelEntity>,
  orderBy?: RelOrder,
): void {
  const { id, rel_types_id, doc_direct_id, doc_reverse_id, doc_id, del } = args;

  qb.innerJoinAndSelect("rel.RelTypes", "RelTypes")
    .innerJoinAndSelect("rel.DocDirect", "DocDirect")
    .innerJoinAndSelect("rel.DocReverse", "DocReverse")

    .innerJoinAndSelect("DocDirect.Cls", "DocDirectCls")
    .innerJoinAndSelect("DocReverse.Cls", "DocReverseCls")

    .leftJoinAndSelect("DocDirect.org", "DocDirectOrg")
    .leftJoinAndSelect("DocReverse.org", "DocReverseOrg")

    .leftJoinAndSelect("DocDirect.citizen", "DocDirectCitizen")
    .leftJoinAndSelect("DocReverse.citizen", "DocReverseCitizen")

    .where("rel.del = false")
    .andWhere("DocDirect.del = false")
    .andWhere("DocReverse.del = false")
    .andWhere("RelTypes.del = false");

  if (doc_id) {
    qb.andWhere(
      new Brackets((qb) => {
        qb.where("rel.doc_direct_id = :doc_id").orWhere("rel.doc_reverse_id = :doc_id");
      }),
    ).setParameters({ doc_id: doc_id });
  }

  if (id) {
    qb.andWhere("rel.id = :id", { id });
  }

  if (rel_types_id) {
    qb.andWhere("rel.rel_types_id = :rel_types_id", { rel_types_id });
  }

  if (doc_direct_id) {
    qb.andWhere("rel.doc_direct_id = :doc_direct_id", { doc_direct_id });
  }

  if (doc_reverse_id) {
    qb.andWhere("rel.doc_reverse_id = :doc_reverse_id", { doc_reverse_id });
  }

  if (del) {
    qb.andWhere("rel.del = :del", { del });
  }

  switch (orderBy?.value) {
    case OrderRelEnum.ID:
      qb.orderBy("rel.id", orderBy.sortEnum);
      break;
    case OrderRelEnum.DATE_CREATE:
      qb.orderBy("rel.date_create", orderBy.sortEnum);
      break;
    case OrderRelEnum.TYPE:
      qb.orderBy("rel.rel_types_id", orderBy.sortEnum);
      break;
    case OrderRelEnum.NAME:
      qb.orderBy("RelTypes.name_direct", orderBy.sortEnum);
      qb.orderBy("RelTypes.name_reverse", orderBy.sortEnum);
      break;
    default:
      qb.orderBy("rel.id", SortEnum.DESC);
  }
}
