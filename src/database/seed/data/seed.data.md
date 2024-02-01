      // FIXME: удалить блок т.к. админ может все без явного указания
      // const operationArr1 = await manager.find(OperationEntity);
      // const res = operationArr1.map((el, index) => {
      //   return {
      //     id: index + 1, // ранее id не задавался и мог быть разным
      //     role_id: 1,
      //     operation_id: el.id,
      //   };
      // });
      // await updateData(manager, RoleOperationsEntity, res);

      // /**
      //  * ВЫПОЛНИТЬ 1 РАЗ
      //  * ПРИВЕДЕНИЕ ВЕРСИЙ ФАЙЛОВ В СООТВЕТСТВИЕ С НОВОЙ СТРУКТУРОЙ
      //  * TODO: ПОТОМ УДАЛИТЬ
      //  */
      // const metaFileVersion = manager.connection.getMetadata(FileVersionEntity);
      // await modifyRecords(manager, FileBlockEntity, async (rec) => {
      //   const ret: Partial<FileBlockEntity> = {};

      //   // получить id максимальной версии и номер версии
      //   const sql = `
      //   SELECT id, version
      //   FROM "${metaFileVersion.schema}"."${metaFileVersion.tableName}"
      //   WHERE
      //     file_block_id=${rec.id} and
      //     version = (
      //       SELECT max(version)
      //       FROM "${metaFileVersion.schema}"."${metaFileVersion.tableName}"
      //       WHERE file_block_id=${rec.id}
      //     )
      //   `;
      //   const recFileVersion = (await manager.queryRunner.query(sql)) ?? [] as FileVersionEntity[];

      //   if (recFileVersion.length == 1) {
      //     if (!rec.file_version_main) ret.file_version_main = recFileVersion[0].id;
      //     if (!rec.file_version_counter) ret.file_version_counter = recFileVersion[0].version;
      //   }

      //   return ret;
      // });


      /**
       * ВЫПОЛНИТЬ 1 РАЗ
       * TODO: ПОТОМ УДАЛИТЬ
       */
      const OP_ID = {
        10022: 242,
        10023: 243,
        10024: 244,
        10025: 245,
        10026: 246,
        10027: 247,
        10028: 248,
        10029: 249,
        10030: 250,
        10031: 251,
        10032: 252,
        10033: 253,
        10034: 254,
        10035: 255,
      };
      const OP_ID_KEYS = Object.keys(OP_ID);
      const metaOperation = manager.connection.getMetadata(OperationEntity);
      for (const key of OP_ID_KEYS) {
        const sql = `
          UPDATE "${metaOperation.schema}"."${metaOperation.tableName}"
          SET id=${OP_ID[key]}
          WHERE id=${key};
        `;
        await manager.queryRunner.query(sql);
      }

      /**
       * ВЫПОЛНИТЬ 1 РАЗ
       * TODO: ПОТОМ УДАЛИТЬ
       */
      await updateData(manager, SettingEntity, settingSeed.filter((x) => [
        Number(SETTING_CONST.TIMEOUT_PDF_VERIFY.id),
        Number(SETTING_CONST.TIMEOUT_PDF_CREATE.id),
      ].includes(x.id)), {
        updateFields: ['value'],
        cb: (rec) => {
          rec.value = "1000";
          return rec;
        }
      });

      /**
       * ВЫПОЛНИТЬ 1 РАЗ
       * TODO: ПОТОМ УДАЛИТЬ
       */
      await updateData(manager, SettingEntity, settingSeed.filter((x) => [35, 36, 46, 47].includes(x.id)), {
        updateFields: ['value'],
        cb: (rec) => {
          switch(rec.value) {
            case '0':
              rec.value = 'false';
              break;
            case '1':
              rec.value = 'true';
              break;
          }
          return rec;
        }
      });

      // /**
      //  * ВЫПОЛНИТЬ 1 РАЗ
      //  * TODO: ПОТОМ УДАЛИТЬ
      //  */
      // await updateData(manager, SettingEntity, settingSeed.filter((x) => [41].includes(x.id)), {
      //   updateFields: ['value'],
      //   cb: (rec) => {
      //     switch(rec.value) {
      //       case '0':
      //         rec.value = 'imap';
      //         break;
      //       case '1':
      //         rec.value = 'pop3';
      //         break;
      //     }
      //     return rec;
      //   }
      // });

      // /**
      //  * ВЫПОЛНИТЬ 1 РАЗ НА БЕЛАЗЕ
      //  * TODO: ПОТОМ УДАЛИТЬ
      //  */
      // await updateData(manager, SettingEntity, settingSeed.filter((x) => [48].includes(x.id)), {
      //   updateFields: ['value'],
      // });



      /**
       * ВЫПОЛНИТЬ 1 РАЗ
       * TODO: ПОТОМ УДАЛИТЬ
       */
      const OP_ID = {
        10022: 242,
        10023: 243,
        10024: 244,
        10025: 245,
        10026: 246,
        10027: 247,
        10028: 248,
        10029: 249,
        10030: 250,
        10031: 251,
        10032: 252,
        10033: 253,
        10034: 254,
        10035: 255,
      };
      const OP_ID_KEYS = Object.keys(OP_ID);
      const metaOperation = manager.connection.getMetadata(OperationEntity);
      for (const key of OP_ID_KEYS) {
        const sql = `
          UPDATE "${metaOperation.schema}"."${metaOperation.tableName}"
          SET id=${OP_ID[key]}
          WHERE id=${key};
        `;
        await manager.queryRunner.query(sql);
      }
