import { Injectable } from "@nestjs/common";

import { IViewingAccess, UserService } from "../modules/user/user.service";

@Injectable()
export class AuthAccessService {
  constructor(private userService: UserService) {}

  /**
   * информация о правах доступа пользователя
   */
  async getAuthAccess(args: { emp_id: number; org: string }): Promise<{
    viewing_access: string[];
    menu_ops_viewing: number[];
  }> {
    const access: IViewingAccess = await this.userService.userAccessList(args.emp_id, args.org);
    return {
      viewing_access: access.viewing_access,
      menu_ops_viewing: access.menu_ops_viewing,
    };
  }
}
