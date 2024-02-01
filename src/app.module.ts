import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { PassportModule } from "@nestjs/passport";
import { ScheduleModule } from "@nestjs/schedule";

import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { AccessTokenGuard } from "./auth/guard/acessToken.guard";
import { HttpExceptionFilter } from "./filter/HttpException.filter";
import { graphqlModule } from "./graphql/graphql.module";
import { AccessGuard } from "./modules/access/guard/access.guard";
import { ActModule } from "./modules/act/act.module";
import { ActStatusModule } from "./modules/actStatus/actStatus.module";
import { ArticleModule } from "./modules/article/article.module";
import { AuditModule } from "./modules/audit/audit.module";
import { CitizenModule } from "./modules/citizen/citizen.module";
import { CorrespondentModule } from "./modules/correspondent/correspondent.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { DeliveryModule } from "./modules/delivery/delivery.module";
import { DocModule } from "./modules/doc/doc.module";
import { DocPackageModule } from "./modules/docPackage/docPackage.module";
import { DocPackageDeletedModule } from "./modules/docPackageDeleted/docPackageDeleted.module";
import { DocPackageStatusModule } from "./modules/docPackageStatus/docPackageStatus.module";
import { DocStatusModule } from "./modules/docstatus/docStatus.module";
import { EmpModule } from "./modules/emp/emp.module";
import { FavoritesModule } from "./modules/favorites/favorites.module";
import { FileModule } from "./modules/file/file.module";
import { GroupModule } from "./modules/group/group.module";
import { IncmailModule } from "./modules/incmail/incmail.module";
import { InventoryModule } from "./modules/Inventory/inventory.module";
import { InventoryNameModule } from "./modules/inventoryName/inventoryName.module";
import { InventoryStatusModule } from "./modules/inventoryStatus/inventoryStatus.module";
import { JobsControlTypesModule } from "./modules/job/jobControlTypes/jobControlTypes.module";
import { JobsModule } from "./modules/job/job.module";
import { JobStatusModule } from "./modules/job/jobStatus/jobStatus.module";
import { KdocModule } from "./modules/kdoc/kdoc.module";
import { LanguagesModule } from "./modules/language/language.module";
import { MenuOptionsModule } from "./modules/menuOptions/menuOptions.module";
import { NomenclaturesModule } from "./modules/nomenclatures/nomenclatures.module";
import { NotifyModule } from "./modules/notify/notify.module";
import { NumModule } from "./modules/num/num.module";
import { OperationModule } from "./modules/operation/operation.module";
import { OrgModule } from "./modules/org/org.module";
import { PostModule } from "./modules/post/post.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { ProjectStatusModule } from "./modules/projectStatus/projectStatus.module";
import { ProjectTemplateModule } from "./modules/projectTemplate/projectTemplate.module";
import { ReceiverModule } from "./modules/receiver/receiver.module";
import { RegionModule } from "./modules/region/region.module";
import { RelModule } from "./modules/rel/rel.module";
import { RelTypesModule } from "./modules/rel/relTypes/relTypes.module";
import { ReportModule } from "./modules/report/report.module";
import { RlsModule } from "./modules/rls/rls.module";
import { RoleModule } from "./modules/role/role.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { SignModule } from "./modules/sign/sign.module";
import { StaffModule } from "./modules/staff/staff.module";
import { SubdivisionModule } from "./modules/subdivision/subdivision.module";
import { TemplateContentModule } from "./modules/templateContent/templateContent.module";
import { TermModule } from "./modules/term/term.module";
import { TypesDocModule } from "./modules/typesdoc/typesdoc.module";
import { TypeSendModule } from "./modules/typeSend/typeSend.module";
import { UserModel } from "./modules/user/users.module";
import { WorkerModule } from "./modules/worker/worker.module";
import { PubsubModule } from "./pubsub/pubsub.module";
import { SearchModule } from "./search/search.module";
import { AbonentsModule } from "./smdo/abonents/abonents.module";
import { DocTypesModule } from "./smdo/doc-types/doc-types.module";
import { FileTypesModule } from "./smdo/file-types/file-types.module";
import { PackagesModule } from "./smdo/packages/packages.module";
import { SedListModule } from "./smdo/sed-list/sed-list.module";
import { SmdoModule } from "./smdo/smdo.module";
import { StackModule } from "./smdo/stack/stack.module";
import { CdocModule } from "./modules/cdoc/cdoc.module";

@Module({
  imports: [
    // TypeOrmModule.forRoot(dbConfig),
    ScheduleModule.forRoot(), // расписание
    PubsubModule, // подписки
    // TenancyModule, // доступ к БД
    SettingsModule,
    ArticleModule,
    AdminModule,
    AuthModule,
    CitizenModule,
    CorrespondentModule,
    TypeSendModule,
    ReportModule,
    WorkerModule,
    FileModule,
    DeliveryModule,
    DocModule,
    DocStatusModule,
    RelModule,
    RelTypesModule,
    RlsModule,
    NumModule,
    NotifyModule,
    EmpModule,
    graphqlModule,
    GroupModule,
    IncmailModule,
    SignModule,
    JobsModule,
    JobsControlTypesModule,
    KdocModule,
    NomenclaturesModule,
    OrgModule,
    PassportModule,
    ProjectsModule,
    RegionModule,
    StaffModule,
    TemplateContentModule,
    TermModule,
    SubdivisionModule,
    PostModule,
    TypesDocModule,
    UserModel,
    SearchModule,
    JobStatusModule,
    DashboardModule,
    MenuOptionsModule,
    OperationModule,
    RoleModule,
    ProjectStatusModule,
    // ----------- модули СМДО
    SmdoModule,
    AbonentsModule,
    FileTypesModule,
    DocTypesModule,
    SedListModule,
    PackagesModule,
    StackModule,

    // ----------- конец модулей СМДО
    AuditModule,
    DocPackageStatusModule,
    DocPackageModule,
    InventoryStatusModule,
    InventoryNameModule,
    InventoryModule,
    LanguagesModule,
    ActStatusModule,
    ActModule,
    FavoritesModule,
    ProjectTemplateModule,
    DocPackageDeletedModule,
    ReceiverModule,
    CdocModule,
  ],
  //controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: AccessGuard },
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
  // providers: [AppService], // временно отключаем защиту токеном
})
export class AppModule {}
