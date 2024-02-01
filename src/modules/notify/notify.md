## ВАЖНО
- каждый emp имеет доступ только к своим подпискам на уведомления. Обеспечивается подстановкой его emp_id в NotifySubscribe.resolver.ts
- каждый emp имеет доступ только к своим уведомлениям. Обеспечивается подстановкой его emp_id в NotifyType.resolver.ts

- для отправки сообщения об изменении статуса emp по поручению:
  -- запоминаем состояние статусов
  ```ts
    // запомнить emp-статусы по поручению
    const notify = await this.notifyOrgJobService.memoNotifyJobStatus({
      job_id: jobId,
      manager: this.dataSource.manager,
    });
  ```
  -- производим изменения в БД
  -- рассылаем сообщения
  ```ts
    // уведомления об изменении статусов
    await this.notifyOrgJobService.addNotifyJobStatus({
      memo : notify,
      job_emp: [ JobEmpEnum.control_pre ],
    });
  ```

- в иных случаях вызываем
  ```ts
    // уведомление
    await this.notifyOrgJobService.addNotifyJobAny({
      job_id: jobId,
      job_emp: [
        JobEmpEnum.creator,
        JobEmpEnum.author,
        JobEmpEnum.exec_simple,
        JobEmpEnum.exec_respons,
        JobEmpEnum.control_pre,
      ],
      notify_type_id: NotifyTypeEnum.JOB_RESOLV_TERM,
      message: 'Поручение № ' + addNotifyJobAnyNum + ': срок продлен',
      kind: PsBaseEnum.success,
    });
  ```


