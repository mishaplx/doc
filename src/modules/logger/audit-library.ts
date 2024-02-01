export class AuditLibrary {
  async graphQLOperationsByName(
    name: string,
    event: string,
    description: string,
    docId,
    req,
    response,
    request,
  ): Promise<any> {
    switch (name) {
      // Файлы
      case "deleteFileVersion":
        event = "Удаление файла";
        description = `ID файла: ${req.body.variables.id}`;
        break;
      case "deleteFileBlock":
        event = "Удаление блока файлов";
        description = `ID файлового блока: ${req.body.variables.id}`;
        break;
      case "fullTextSearch":
        event = "Полнотекстовый поиск";
        description = `Поиск текста: ${req.body.variables.text}`;
        break;
      case "attributiveDocSearch":
        event = "Атрибутивный поиск по документам";
        break;
      case "attributiveJobSearch":
        event = "Атрибутивный поиск по поручениям";
        break;
      case "attributiveProjectSearch":
        event = "Атрибутивный поиск по проектам";
        break;
      case "getAudit":
        event = "Просмотр журнала аудита";
        response = null;
        break;
      case "logOut":
        event = "Выход из системы";
        response = null;
        break;
      case "changePasswordFromOld":
        event = "Смена пароля";
        break;
      case "changePassword":
        event = "Смена пароля в справочнике";
        break;
      case "changePhoneNumber":
        event = `Смена номера телефона`;
        break;
      case "SignIn": {
        event = `Вход в систему`;
        (request = null), (response = null);
        break;
      }
      // документы
      case "getAllDoc":
        event = "Получение списка документов";
        break;
      case "findByIdDoc":
        event = "Получение определенного документа";
        docId = req.body.variables.id;
        break;
      case "sendDocToDocPackage":
        event = "Направить документ в дело";
        description = `ID документа: ${req.body.variables.docId}`;
        break;
      case "sendMail":
        event = "Отправка документа по почте";
        docId = req?.body?.variables?.docId;
        break;
      case "getAllFileForDoc":
        event = "Получение всех файлов относящихся к документу";
        docId = req.body.variables.id;
        break;
      case "getAllFileForDocByIncmail":
        event = "Получение всех файлов относящихся к документу почтового импорта";
        break;
      case "importIncmail":
        description = `ID писем: ${req.body.variables.toDocIncmailInput.ids}`;
        event = "Импорт писем";
        break;
      case "incmailDelete":
        description = `ID писем: ${req.body.variables.incmail_ids}`;
        event = "Импорт писем";
        break;
      case "clearAudit":
        event = "Очистка журнала аудита";
        break;
      // почтовый импорт
      case "getAllIncmail":
        event = "Получение списка писем";
        break;
      case "getIncmailById":
        event = "Просмотр письма";
        description = `ID письма: ${req.body.variables.id}`;
        break;
      // СМДО
      case "smdoPackages":
        event = "История отправки/Лог сообщений СМДО";
        break;
      // Проекты
      case "getAllProjects":
        event = "Получение списка проектов";
        break;
      case "getProjectsById":
        event = "Просмотр проекта";
        description = `ID проекта: ${req.body.variables.id}`;
        break;
      case "createProject":
        event = "Создание проекта";
        break;
      case "updateProject":
        event = "Изменение проекта";
        description = `ID проекта: ${req.body.variables.projectItem?.id}`;
        break;
      case "deleteProject":
        event = "Удаление проекта";
        description = `ID проекта: ${req.body.variables.id}`;
        break;
      case "sendToRoute":
        event = "Отправка проекта по маршруту";
        description = `ID проекта: ${req.body.variables.id}`;
        break;
      case "closeProject":
        event = "Закрытие проекта";
        description = `ID проекта: ${req.body.variables.id}`;
        break;

      case "stageWithConfirm":
        event = "Согласование этапа проекта";
        description = `ID проекта: ${req.body.variables.id}, ID этапа: ${req.body.variables.id_stage}`;
        break;

      case "closeProject":
        event = "Закрытие проекта";
        description = `ID проекта: ${req.body.variables.id}`;
        break;
      // Поручения
      case "getAllJobs":
        event = "Получение списка поручений";
        break;
      case "deleteJobs":
        event = "Удаление поручения";
        description = `ID поручения: ${req.body.variables.jobId}`;
        break;
      case "createJob":
        event = "Создание поручения";
        break;
      case "getJobsById":
        event = "Просмотр поручения";
        description = `ID поручения: ${req.body.variables.id}`;
        break;
      case "updateJob":
        event = "Изменение поручения";
        description = `ID поручения: ${req.body.variables.jobId}`;
        break;
      case "sendForApprove":
        event = "Отправка поручения на утверждение";
        description = `ID поручения: ${req.body.variables.job_id}`;
        break;
      case "askForApprove":
        event = "Утверждение поручения";
        description = `ID поручения: ${req.body.variables.job_id}`;
        break;
      case "reworkForApprove":
        event = "Возврат поручения на доработку";
        description = `ID поручения: ${req.body.variables.job_id}`;
        break;
      case "sendToExecution":
        event = "Отправка поручения на исполнение";
        description = `ID поручения: ${req.body.variables.jobId}`;
        break;
      case "createReport":
        event = "Создание отчета по поручению";
        description = `ID поручения: ${req.body.variables.job_id}`;
        break;
      case "returnToExecJobControl":
        event = "Возврат поручения на исполнение";
        description = `ID поручения: ${req.body.variables.returnToExecJobControlInput.jobId}`;
        break;
      case "getOutOfControl":
        event = "Снятие поручение с контроля";
        description = `ID поручения: ${req.body.variables.getOutOfControlInput.jobId}`;
        break;

      // Системные настройки
      case "GetAllSetting":
        event = "Просмотр системных настроек";
        break;
      case "updateSetting":
        event = "Изменение системных настроек";
        description = `ID настройки: ${req.body.variables.updateSystemSettingsInput?.id}, значение: ${req.body.variables.updateSystemSettingsInput?.value}`;
        break;
      // Справочники
      case "getAllViewDoc":
        event = "Просмотр справочника";
        description = "Виды документов";
        break;
      case "createViewDoc":
        event = "Добавление записи в справочник";
        description = `Вид документа: ${req.body.variables.viewdocInput?.nm}`;
        break;
      case "updateViewDoc":
        event = "Изменение записи в справочнике";
        description = `Вид документа: ${req.body.variables.input?.nm}, ID: ${req.body.variables.input?.id}`;
        break;
      case "deleteViewDoc":
        event = "Удаление записи из справочника";
        description = `Вид документа ID: ${req.body.variables?.id}`;
        break;

      case "getAllTypeDoc":
        event = "Просмотр справочника";
        description = "Типы документов";
        break;

      case "getAllTypeJob":
        event = "Просмотр справочника";
        description = "Типы поручений";
        break;
      case "createTypeJob":
        event = "Добавление записи в справочник";
        description = `Тип поручения: ${req.body.variables.CreateTypeOrgDto?.nm}`;
        break;
      case "updateTypeJob":
        event = "Изменение записи в справочнике";
        description = `Тип поручения: ${req.body.variables.updateTypeJobInput?.nm}, ID: ${req.body.variables.updateTypeJobInput?.id}`;
        break;
      case "removeTypeJob":
        event = "Удаление записи из справочника";
        description = `Тип поручения ID: ${req.body.variables?.id}`;
        break;

      case "deliveries":
        event = "Просмотр справочника";
        description = "Типы доставки";
        break;
      case "createDelivery":
        event = "Добавление записи в справочник";
        description = `Тип доставки: ${req.body.variables.input?.nm}`;
        break;
      case "updateDelivery":
        event = "Изменение записи в справочнике";
        description = `Тип доставки: ${req.body.variables.update?.nm}, ID: ${req.body.variables.update?.id}`;
        break;
      case "deleteDelivery":
        event = "Удаление записи из справочника";
        description = `Тип доставки ID: ${req.body.variables?.id}`;
        break;

      case "getAllJobsControlTypes":
        event = "Просмотр справочника";
        description = "Типы контроля";
        break;
      case "addJobsControlType":
        event = "Добавление записи в справочник";
        description = `Тип контроля: ${req.body.variables.createCtrlInput?.nm}`;
        break;
      case "updateJobsControlType":
        event = "Изменение записи в справочнике";
        description = `Тип контроля: ${req.body.variables.jobsControlTypeItem?.nm}, ID: ${req.body.variables.jobsControlTypeItem?.id}`;
        break;
      case "deleteJobsControlTypesBy":
        event = "Удаление записи из справочника";
        description = `Тип контроля ID: ${req.body.variables?.id}`;
        break;

      case "getRelTypes":
        event = "Просмотр справочника";
        description = "Типы cвязкок";
        break;
      case "createRelTypes":
        event = "Добавление записи в справочник";
        description = `Тип cвязки. Прямая связь: ${req.body.variables.name_direct}, Обратная связь: ${req.body.variables.name_reverse}`;
        break;
      case "updateRelTypes":
        event = "Изменение записи в справочнике";
        description = `Тип cвязки. Прямая связь: ${req.body.variables.name_direct}, Обратная связь: ${req.body.variables.name_reverse}, ID: ${req.body.variables.id}`;
        break;
      case "deleteRelTypes":
        event = "Удаление записи из справочника";
        description = `Тип cвязки ID: ${req.body.variables?.id}`;
        break;

      case "getAllArticle":
        event = "Просмотр справочника";
        description = "Типы cтатей хранения";
        break;
      case "createArticle":
        event = "Добавление записи в справочник";
        description = `Тип статьи хранения. Наименование: ${req.body.variables.createArticleInput.nm}, Статья хранения: ${req.body.variables.updateArticleInput.cd}, ID Актуальности: ${req.body.variables.updateArticleInput.term_id}`;
        break;
      case "updateArticle":
        event = "Изменение записи в справочнике";
        description = `Тип статьи хранения. Наименование: ${req.body.variables.updateArticleInput.nm}, ID: ${req.body.variables.updateArticleInput.id}, Статья хранения: ${req.body.variables.updateArticleInput.cd}, ID Актуальности: ${req.body.variables.updateArticleInput.term_id}`;
        break;
      case "removeArticle":
        event = "Удаление записи из справочника";
        description = `Тип статьи хранения ID: ${req.body.variables?.id}`;
        break;

      case "getAllTerm":
        event = "Просмотр справочника";
        description = "Сроки хранения";
        break;
      case "createTerm":
        event = "Добавление записи в справочник";
        description = `Срок хранения: ${req.body.variables.createTermInput?.nm}`;
        break;
      case "updateTerm":
        event = "Изменение записи в справочнике";
        description = `Срок хранения: ${req.body.variables.updateTermInput?.nm}, ID: ${req.body.variables.updateTermInput?.id}`;
        break;
      case "removeTerm":
        event = "Удаление записи из справочника";
        description = `Срок хранения ID: ${req.body.variables?.id}`;
        break;

      case "getAllNomenclatures":
        event = "Просмотр справочника";
        description = "Номенклатуры";
        break;
      case "addNomenclature":
        event = "Добавление записи в справочник";
        description = `Номенклатура: ${req.body.variables?.name}`;
        break;
      case "updateNomenclature":
        event = "Изменение записи в справочнике";
        description = `Номенклатура: ${req.body.variables?.name}, ID: ${req.body.variables?.id}`;
        break;
      case "deleteNomenclature":
        event = "Удаление записи из справочника";
        description = `Номенклатура ID: ${req.body.variables?.id}`;
        break;
      case "addElementNomenclature":
        event = "Добавление записи в справочник";
        description = `Элемент номенклатуры: ${req.body.variables?.name}`;
        break;

      case "copyNomenclature":
        event = "Копирование номенклатуры";
        description = `ID номенклатуры-источника: ${req.body.variables?.id}, Имя добавленной номенклатуры: ${req.body.variables?.name}`;
        break;

      case "getAllProjectsTemplateRoute":
        event = "Просмотр справочника";
        description = "Шаблоны маршрута";
        break;
      case "addTemplateRouteProject":
        event = "Добавление записи в справочник";
        description = `Шаблон маршрута: ${req.body.variables?.addTemplateRouteDto.name}`;
        break;
      case "deleteTemplateRouteProject":
        event = "Удаление записи из справочника";
        description = `Шаблон маршрута ID: ${req.body.variables?.id}`;
        break;

      case "listNum":
        event = "Просмотр справочника";
        description = "Нумераторы";
        break;
      case "createNum":
        event = "Добавление записи в справочник";
        description = `Нумератор: ${req.body.variables?.name}`;
        break;
      case "updateNum":
        event = "Изменение записи в справочнике";
        description = `Нумератор: ${req.body.variables?.name}, ID: ${req.body.variables?.id}`;
        break;
      case "deleteNum":
        event = "Удаление записи из справочника";
        description = `Нумератор ID: ${req.body.variables?.id}`;
        break;

      case "getAllTemplateContent":
        event = "Просмотр справочника";
        description = "Содержания";
        break;
      case "createTemplateContent":
        event = "Добавление записи в справочник";
        description = `Содержание: ${req.body.variables?.createOrgInput.text}`;
        break;
      case "updateTemplateContent":
        event = "Изменение записи в справочнике";
        description = `Содержание: ${req.body.variables?.updateTmpConInput.text}, ID: ${req.body.variables?.updateTmpConInput.id}`;
        break;
      case "removeTemplateContent":
        event = "Удаление записи из справочника";
        description = `Содержание ID: ${req.body.variables?.id}`;
        break;

      case "getAllPost":
        event = "Просмотр справочника";
        description = "Должности";
        break;
      case "createPost":
        event = "Добавление записи в справочник";
        description = `Должность: ${req.body.variables?.createPostInput.text}`;
        break;
      case "updatePost":
        event = "Изменение записи в справочнике";
        description = `Должность: ${req.body.variables?.updatePostInput.nm}, ID: ${req.body.variables?.updatePostInput.id}`;
        break;
      case "removePost":
        event = "Удаление записи из справочника";
        description = `Должность ID: ${req.body.variables?.id}`;
        break;

      case "getAllStaff":
        event = "Просмотр справочника";
        description = "Сотрудники";
        break;
      case "createStaff":
        event = "Добавление записи в справочник";
        description = `Сотрудник: ${req.body.variables?.createStaffInput.ln} ${req.body.variables?.createStaffInput.nm} ${req.body.variables?.createStaffInput.mn} `;
        break;
      case "updateStaff":
        event = "Изменение записи в справочнике";
        description = `Сотрудник: ${req.body.variables?.updateStaffInput.ln} ${req.body.variables?.updateStaffInput.nm} ${req.body.variables?.updateStaffInput.mn}, ID: ${req.body.variables?.updateStaffInput.id}`;
        break;
      case "removeStaff":
        event = "Удаление записи из справочника";
        description = `Сотрудник: ${req.body.variables?.id}`;
        break;

      case "SignList":
        event = "Просмотр справочника";
        description = "Пользователи";
        break;
      case "SingUp":
        event = "Добавление записи в справочник";
        description = `Пользователь: ${req.body.variables?.LoginUserInputUp.username}, ID Сотрудника: ${req.body.variables?.LoginUserInputUp.staff_id}`;
        break;
      case "deactivatedUser":
        if (req.body.variables?.flag) event = "Деактивация пользователя";
        else event = "Активация пользователя";
        description = `ID пользователя: ${req.body.variables?.id}`;
        break;

      case "getAllEmp":
        event = "Просмотр справочника";
        description = "Текущие назначения";
        break;
      case "createEmp":
        event = "Добавление записи в справочник";
        description = `Текущее назначение. ID Сотрудника: ${req.body.variables?.createEmpInput.staff_id}, ID Должности: ${req.body.variables?.createEmpInput.post_id}, ID Подразделения: ${req.body.variables?.createEmpInput.unit_id}`;
        break;
      case "updateEmp":
        event = "Изменение записи в справочнике";
        description = `Текущее назначение. ID Назначения: ${req.body.variables?.updateEmpInput.id}`;
        break;
      case "removeEmp":
        event = "Удаление записи из справочника";
        description = `Текущее назначение. ID Назначения: ${req.body.variables?.id}`;
        break;

      case "getAllUnit":
        event = "Просмотр справочника";
        description = "Подразделения";
        break;
      case "createUnit":
        event = "Добавление записи в справочник";
        description = `Подразделение: ${req.body.variables?.input.nm}`;
        break;
      case "updateUnit":
        event = "Изменение записи в справочнике";
        description = `Подразделение: ${req.body.variables?.update.nm}, ID: ${req.body.variables?.update.id}`;
        break;
      case "deleteUnit":
        event = "Удаление записи из справочника";
        description = `Подразделение ID: ${req.body.variables?.id}`;
        break;

      case "getAllRoles":
        event = "Просмотр справочника";
        description = "Роли";
        break;
      case "updateRole":
        event = "Изменение записи в справочнике";
        description = `Роль: ${req.body.variables?.updateRoleInput.name}, ID: ${req.body.variables?.updateRoleInput.id}`;
        break;
      case "removeRole":
        event = "Удаление записи из справочника";
        description = `ID роли: ${req.body.variables?.id}`;
        break;
      case "copyRole":
        event = "Копирование роли";
        description = `Роль-источник: ${req.body.variables?.role_id}, Добавленная роль: ${req.body.variables?.nameRole}`;
        break;

      case "getAllEmpReplace":
        event = "Просмотр справочника";
        description = "Замещения";
        break;
      case "createEmpReplace":
        event = "Добавление записи в справочник";
        description = `Замещение. Заменяемый: ${req.body.variables?.CreateEmpReplaceDto.emp_who}, Заменяющий: ${req.body.variables?.CreateEmpReplaceDto.emp_whom}`;
        break;
      case "updateEmpReplace":
        event = "Изменение записи в справочнике";
        description = `Замещение: ${req.body.variables?.updateEmpReplaceDTO.id}`;
        break;
      case "deleteEmpReplace":
        event = "Удаление записи из справочника";
        description = `Замещение ID: ${req.body.variables?.id}`;
        break;

      case "getGroupDictionary":
        event = "Просмотр справочника";
        description = "Группы";
        break;
      case "addUserInGroup":
        event = "Добавление записи в справочник";
        description = `Группа: ${
          req.body.variables?.nameGroupe
        }. Пользователи: ${req.body.variables?.idUserArr.toString()}`;
        break;
      case "deleteGroup":
        event = "Удаление записи из справочника";
        description = `Группа ID: ${req.body.variables?.id}`;
        break;

      case "getAllOrgs":
        event = "Просмотр справочника";
        description = "Организации";
        break;
      case "createOrg":
        event = "Добавление записи в справочник";
        description = `Организация: ${req.body.variables?.createOrgInput.nm}`;
        break;
      case "updateOrg":
        event = "Изменение записи в справочнике";
        description = `Организация: ${req.body.variables?.updateOrgInput.nm}, ID: ${req.body.variables?.updateOrgInput.idOrg}`;
        break;
      case "removeOrg":
        event = "Удаление записи из справочника";
        description = `Организация: ${req.body.variables?.id}`;
        break;

      case "getAllCitizen":
        event = "Просмотр справочника";
        description = "Физ. лица";
        break;
      case "createCitizen":
        event = "Добавление записи в справочник";
        description = `Физ. лицо: ${req.body.variables?.createCitizenInput.ln} ${req.body.variables?.createCitizenInput.nm} ${req.body.variables?.createCitizenInput.mn}`;
        break;
      case "updateCitizen":
        event = "Изменение записи в справочнике";
        description = `Физ. лицо: ${req.body.variables?.updateOrgInput.ln} ${req.body.variables?.updateOrgInput.nm} ${req.body.variables?.updateOrgInput.mn}, ID: ${req.body.variables?.updateOrgInput.id}`;
        break;
      case "deleteCitizen":
        event = "Удаление записи из справочника";
        description = `Физ. лицо ID: ${req.body.variables?.id}`;
        break;

      case "smdoAbonents":
        event = "Просмотр справочника";
        description = "Абоненты СМДО";
        break;
      case "smdoDocTypes":
        event = "Просмотр справочника";
        description = "Виды документов СМДО";
        break;
      case "smdoFileTypes":
        event = "Просмотр справочника";
        description = "Типы файлов СМДО";
        break;
      case "smdoSedList":
        event = "Просмотр справочника";
        description = "Организации СЭД в СМДО";
        break;

      case "regions":
        event = "Просмотр справочника";
        description = "Регионы";
        break;
      case "createRegion":
        event = "Добавление записи в справочник";
        description = `Регион: ${req.body.variables?.createRegionInput.nm}`;
        break;
      case "updateRegion":
        event = "Изменение записи в справочнике";
        description = `Регион: ${req.body.variables?.updateRegionInput.nm}, ID: ${req.body.variables?.updateRegionInput.idOrg}`;
        break;
      case "removeRegion":
        event = "Удаление записи из справочника";
        description = `Регион: ${req.body.variables?.id}`;
        break;

      case "projectTemplateDelete":
        event = "Удаление шаблона проекта";
        description = `ID шаблона: ${req.body.variables?.id}`;
        break;

      // Дела
      case "excludeDocs":
        event = "Исключения документа из дела";
        description = `ID документа: ${req.body.variables.ids}`;
        break;
      case "getAllInventory":
        event = "Получение списка описей дел";
        break;
      case "getInventoryById":
        event = "Просмотр описи дела";
        description = `ID описи дела: ${req.body.variables.id}`;
        break;
      case "createInventory":
        event = "Создание описи дела";
        break;
      case "deleteInventory":
        event = "Удаление описи дела";
        description = `ID описи дела: ${req.body.variables.id}`;
        break;
      case "updateInventory":
        event = "Изменение описи дела";
        description = `ID описи дела: ${req.body.variables.updateInventoryInput?.id}`;
        break;
      case "getAllDocPackages":
        event = "Получение списка дел";
        break;
      case "formInnerInventoryDocPackages":
        event = "Формирование внутренней описи на дело";
        description = `ID дела: ${req.body.variables.ids}`;
        break;
      case "signInnerInventoryDocPackage":
        event = "Генерация ЭЦП на внутреннюю опись дела";
        description = `ID дела: ${req.body.variables.id}`;
        break;
      case "getAllAct":
        event = "Получение списка актов";
        break;
      case "getActById":
        description = `ID акта: ${req.body.variables.id}`;
        event = "Просмотр акта";
        break;
      case "createAct":
        event = "Создание акта";
        break;
      case "updateAct":
        description = `ID акта: ${req.body.variables.updateActInput?.id}`;
        event = "Изменение акта";
        break;
      case "deleteAct":
        description = `ID акта: ${req.body.variables.id}`;
        event = "Удаление акта";
        break;
      case "signAct":
        description = `ID акта: ${req.body.variables.id}`;
        event = "Генерация ЭЦП на акт";
        break;
      case "deleteDocPackageByAct":
        description = `ID акта: ${req.body.variables.id}`;
        event = "Удаление дел по акту";
        break;
      // Отчеты
      case "listReportTemplate":
        event = "Получение списка отчетов";
        break;
      case "reportStatCreate":
        event = "Формирование отчета";
        break;
    }
    return { event, description, docId, response, request };
  }
}
