import { EntityManager } from "typeorm";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { customError } from "src/common/type/errorHelper.type";
import { FileBlockEntity } from "src/entity/#organization/file/fileBlock.entity";
import { UserSessionEntity } from "src/entity/#organization/user/userSession.entity";
import { EmpEntity } from "src/entity/#organization/emp/emp.entity";

/**
 * файловый блок: пометить как заблокированный для всех кроме сессии
 */
export const setBlockedFile = async (args: {
  manager: EntityManager;
  file_block_id: number;
  user_session_id: number;
}): Promise<void> => {
  verifyBlockedFileOrFail(args);
  await args.manager.update(FileBlockEntity,
    { id: args.file_block_id },
    { block_user_session_id: args.user_session_id }
  );
};


/**
 * файловый блок: разблокировать
 * может:
 * - api-сессия, для которой производилась блокировка
 * - пользователь, создавший api-сессию, для которой производилась блокировка
 * - админ
 */
export const resetBlockedFile = async (args: {
  manager: EntityManager;
  file_block_id: number;
  token: IToken;
}): Promise<boolean> => {
  const { manager, file_block_id, token } = args;

  const fileBlockEntity = await manager.findOneBy(FileBlockEntity, { id: file_block_id });
  if (!fileBlockEntity) customError(`Не найден файловый блок id=${file_block_id}`);

  // если блокировки нет
  if (!fileBlockEntity.block_user_session_id) return true;

  if (
    // если не api-сессия, для которой производилась блокировка
    (fileBlockEntity.block_user_session_id != token.session_id) &&

    // И если не пользователь, создавший api-сессию, для которой производилась блокировка
    (
      !((await manager.find(UserSessionEntity, {
          select: { id: true },
          where: { user_id: token.user_id },
        }
      ))
        ?.map((x) => x.id))
        ?.indexOf(fileBlockEntity.block_user_session_id)
    ) &&

    // И если не admin
    (
      !await manager.findOneBy(EmpEntity, {
        id: token.current_emp_id,
        is_admin: true,
      })
    )
  ) {
    customError(`Нет прав на разблокировку файлового блока id=${file_block_id}`);
  }

  // разблокировать
  await manager.update(FileBlockEntity,
    { id: file_block_id },
    { block_user_session_id: null }
  );

  return true;
};


/**
 * файловый блок: проверить - заблокирован ли для сессии
 * если заблокирован - ошибка с сообщением об блокировке
 * @param(user_session_id) - если не задано: проверять просто наличие блокировки
 */
export const verifyBlockedFileOrFail = async (args: {
  manager?: EntityManager;
  file_block_id?: number;
  fileBlockEntity?: FileBlockEntity;
  user_session_id?: number;
}): Promise<void> => {
  const { manager, file_block_id, user_session_id=0 } = args;
  let fileBlockEntity = args.fileBlockEntity;

  if (file_block_id) {
    fileBlockEntity = await manager.findOneBy(FileBlockEntity, { id: file_block_id});
    if (!fileBlockEntity) customError(`Файловый блок id=${file_block_id} не найден`);
  }

  const blockUserSession = await fileBlockEntity?.BlockUserSession;
  if (blockUserSession && blockUserSession?.id != user_session_id ) {
    const blockUser = await blockUserSession?.User;
    const staff = await blockUser?.Staff;
    customError(`Файловый блок заблокирован пользователем: ${staff?.FIO} до ${blockUserSession.date_expiration}`);
  }
};
