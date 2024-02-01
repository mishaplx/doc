import { DataSource, EntityManager } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";

import { AuditOperationTypeEntity } from "../../../entity/#organization/audit/audit-operation-type.entity";
import { auditOperationTypeSeed } from "./default/audit/auditOperationType";

import { ActStatusEntity } from "../../../entity/#organization/actStatus/actStatus.entity";
import { AttributiveSearchElementEntity } from "../../../entity/#organization/attributive-search/attributive_search_element.entity";
import { DeliveryEntity } from "../../../entity/#organization/delivery/delivery.entity";
import { CdocEntity } from "../../../entity/#organization/doc/cdoc.entity";
import { KdocEntity } from "../../../entity/#organization/doc/kdoc.entity";
import { TdocEntity } from "../../../entity/#organization/doc/tdoc.entity";
import { DocPackageStatusEntity } from "../../../entity/#organization/docPackageStatus/docPackageStatus.entity";
import { DocStatusEntity } from "../../../entity/#organization/docstatus/docStatus.entity";
import { EmpEntity } from "../../../entity/#organization/emp/emp.entity";
import { Forwarding_statusEntity } from "../../../entity/#organization/forwarding_status/forwarding_status.entity";
import { Forwarding_viewEntity } from "../../../entity/#organization/forwarding_view/forwarding_view.entity";
import { InventoryNameEntity } from "../../../entity/#organization/inventoryName/inventoryName.entity";
import { InventoryStatusEntity } from "../../../entity/#organization/inventoryStatus/inventoryStatus.entity";
import { JobStatusesEntity } from "../../../entity/#organization/job/jobStatus.entity";
import { LanguageEntity } from "../../../entity/#organization/language/language.entity";
import { MenuOptionsEntity } from "../../../entity/#organization/role/menuOptions.entity";
import { NotifyTypeEntity } from "../../../entity/#organization/notify/notifyType.entity";
import { NotifyTypeGroupEntity } from "../../../entity/#organization/notify/notifyTypeGroup.entity";
import { OperationEntity } from "../../../entity/#organization/role/operation.entity";
import { OrgEntity } from "../../../entity/#organization/org/org.entity";
import { PostEntity } from "../../../entity/#organization/post/post.entity";
import { PrivEntity } from "../../../entity/#organization/priv/priv.entity";
import { ProjectActionEntity } from "../../../entity/#organization/project/ProjectAction.entity";
import { ProjectStatusEntity } from "../../../entity/#organization/project/projectStatus.entity";
import { ProjectSubActionEntity } from "../../../entity/#organization/project/projectSubAction.entity";
import { RegionEntity } from "../../../entity/#organization/region/region.entity";
import { RelTypesEntity } from "../../../entity/#organization/rel/relTypes.entity";
import { ReportTemplateEntity } from "../../../entity/#organization/report/reportTemplate.entity";
import { ReportTemplateTypeEntity } from "../../../entity/#organization/report/reportTemplateType.entity";
import { RolesEntity } from "../../../entity/#organization/role/role.entity";
import { SettingEntity } from "../../../entity/#organization/setting/setting.entity";
import { StaffEntity } from "../../../entity/#organization/staff/staff.entity";
import { TemplateEntity } from "../../../entity/#organization/template/template.entity";
import { TypeOrgEntity } from "../../../entity/#organization/typeorg/typeorg.entity";
import { UnitEntity } from "../../../entity/#organization/unit/unit.entity";
import { UserEntity } from "../../../entity/#organization/user/user.entity";

import { JobsControlTypesEntity } from "../../../entity/#organization/job/jobControlTypes.entity";
import { NumParamEntity } from "../../../entity/#organization/num/numParam.entity";
import { OrgDefaultArr } from "./default/OrgDefault";
import { actStatusArr } from "./default/pack/actStatus";
import { projectSubActionArr } from "./default/project/projectSubAction";
import { attributesArray } from "./default/attributiveSearch";
import { docPackageStatusArr } from "./default/pack/docPackageStatus";
import { docStatusArr } from "./default/doc/docstatus";
import { empDefaultArr } from "./default/empDefault";
import { Forwarding_StatusArr } from "./default/forwarding_status";
import { Forwarding_viewArr } from "./default/forwarding_view";
import { inventoryNameArr } from "./default/pack/inventoryName";
import { inventoryStatusArr } from "./default/pack/inventoryStatus";
import { job_statusesArr } from "./default/job/job_statuses";
import { jobs_control_typesArr } from "./default/job/jobs_control_types";
import { kdocArr } from "./default/doc/kdoc";
import { languageArr } from "./default/language";
import { menuOptionsArr } from "./default/role/menuOption";
import { notifyTypeArr } from "./default/notify/notify_type";
import { notifyTypeGroupArr } from "./default/notify/notify_type_group";
import { numParamArr } from "./default/num_param";
import { operationSeed } from "./default/role/operation";
import { postDefaultArr } from "./default/post";
import { regionArr } from "./default/region";
import { RelTypeArr } from "./default/doc/relType";
import { reportTemplateArr } from "./default/report/reportTemplate";
import { reportTemplateTypeArr } from "./default/report/reportTemplateType";
import { roleArr } from "./default/role/role";
import { staffDefaultArr } from "./default/staffDefault";
import { projectStatusArr } from "./default/project/projectStatus";
import { settingSeed } from "./default/setting";
import { tdocArr } from "./default/doc/tdoc";
import { templateArr } from "./default/pack/template";
import { TypeorgArr } from "./default/typeorg";
import { unitDefaultArr } from "./default/unit";
import { userArr_1, userArr_2 } from "./default/user";
import { updateData } from "./seed.data.util";
import { projectActionArr } from "./default/project/projectAction";
import { privArr } from "./default/doc/priv";
import { deliveryArr } from "./default/doc/delivery";
import { cdocArr } from "./default/doc/cdoc";

export default class SeedDataOrg implements Seeder {

  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    await dataSource.transaction(async (manager: EntityManager) => {

      /**
       * ВНЕСТИ ДАННЫЕ В ТАБЛИЦЫ
       */
      await updateData(manager, AuditOperationTypeEntity, auditOperationTypeSeed, { bDel: true });

      await updateData(manager, AttributiveSearchElementEntity, attributesArray, { bDel: true });
      await updateData(manager, ReportTemplateTypeEntity, reportTemplateTypeArr, { bDel: true });
      await updateData(manager, ReportTemplateEntity, reportTemplateArr, { bDel: true });
      await updateData(manager, Forwarding_viewEntity, Forwarding_viewArr, { bDel: true });
      await updateData(manager, Forwarding_statusEntity, Forwarding_StatusArr, { bDel: true });
      await updateData(manager, TemplateEntity, templateArr, { bStartNew: true });
      await updateData(manager, KdocEntity, kdocArr, { bDel: true });
      await updateData(manager, PrivEntity, privArr, { bStartNew: true });
      await updateData(manager, TdocEntity, tdocArr, { bStartNew: true });
      await updateData(manager, CdocEntity, cdocArr, { bDel: true });

      await updateData(manager, SettingEntity, settingSeed, {
        bDel: true,
        updateFields: [
          // все кроме value
          'description',
          'name',
          'type_value',
          'int_min',
          'int_max',
          'str_mask',
          'smd',
          'common',
          'extra',
          'props',
          'del',
        ]
      });

      await updateData(manager, DocStatusEntity, docStatusArr, { bDel: true });
      await updateData(manager, JobsControlTypesEntity, jobs_control_typesArr, { bStartNew: true });
      await updateData(manager, JobStatusesEntity, job_statusesArr, { bDel: true });
      await updateData(manager, DeliveryEntity, deliveryArr);

      await updateData(manager, ProjectStatusEntity, projectStatusArr, { bDel: true });
      await updateData(manager, ProjectActionEntity, projectActionArr, { bDel: true });
      await updateData(manager, ProjectSubActionEntity, projectSubActionArr, { bDel: true });

      await updateData(manager, PostEntity, postDefaultArr);
      await updateData(manager, UnitEntity, unitDefaultArr);
      await updateData(manager, RegionEntity, regionArr);
      await updateData(manager, TypeOrgEntity, TypeorgArr);
      await updateData(manager, OrgEntity, OrgDefaultArr);
      await updateData(manager, StaffEntity, staffDefaultArr);
      await updateData(manager, UserEntity, userArr_1, { bUser: true });
      await updateData(manager, UserEntity, userArr_2);
      await updateData(manager, EmpEntity, empDefaultArr);

      await updateData(manager, NotifyTypeGroupEntity, notifyTypeGroupArr, { bDel: true });
      await updateData(manager, NotifyTypeEntity, notifyTypeArr, { bDel: true });

      await updateData(manager, RelTypesEntity, RelTypeArr);

      await updateData(manager, MenuOptionsEntity, menuOptionsArr, { bDel: true });
      await updateData(manager, RolesEntity, roleArr);
      await updateData(manager, OperationEntity, operationSeed, { bDel: true });
      // await updateData(manager, RoleOperationsEntity, roleOperationSeed, { bStartEmpty: true });

      await updateData(manager, DocPackageStatusEntity, docPackageStatusArr, { bDel: true });
      await updateData(manager, InventoryStatusEntity, inventoryStatusArr, { bDel: true });
      await updateData(manager, InventoryNameEntity, inventoryNameArr);
      await updateData(manager, LanguageEntity, languageArr, { bDel: true });
      await updateData(manager, ActStatusEntity, actStatusArr, { bDel: true });

      await updateData(manager, NumParamEntity, numParamArr);
    });

    // БД: переустановить sequences
    const sql = `SELECT sad.sequences_update()`;
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.query(sql);
    await queryRunner.release();
  }
}
