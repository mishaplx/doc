// import { Injectable } from "@nestjs/common";
//
// import { UserService } from "../modules/user/user.service";
// import { AuthTokenService } from "./token/auth.token.service";
// import { AuthUserService } from "./user/auth.user.service";
//
// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly usersService: UserService,
//     public readonly authTokenService: AuthTokenService,
//     public readonly authUserService: AuthUserService,
//   ) {}
//
//   async checkRole(context) {
//     const nameOrg = context.req.headers.org.toLowerCase();
//     return this.usersService.checkRole(nameOrg);
//   }
// }
