import { PickType } from "@nestjs/graphql";
import * as bcrypt from "bcryptjs";
import "dotenv/config";
import process from "process";
import { UserEntity } from "../../../../entity/#organization/user/user.entity";

const salt = bcrypt.genSaltSync(Number(process.env.JWT_SALT));

class UserForDbSeed_1 extends PickType(UserEntity, [
  "id",
  "username",
  "salt",
  "password",
  "del",
  "current_emp_id",
  "isblocked",
  "main_id",
  // 'user_id',
] as const) {}
interface UserForDbSeed_2 {
  id: number;
  user_id: number;
}

// interface UserForDbSeed_2 { user_id: number; }
// type UserForDbSeed = UserForDbSeed_1 & UserForDbSeed_2;
// export const userArr: UserForDbSeed[] = [
//   {
//     id: 1,
//     username: '',
//     salt: salt,
//     password: '',
//     del: false,
//     current_emp_id: 1,
//     isblocked: false,
//     main_id: 1,
//     user_id: 1,
//   },
// ];

export const userArr_1: UserForDbSeed_1[] = [
  {
    id: 1,
    username: "",
    salt: salt,
    password: "",
    del: false,
    current_emp_id: 1,
    isblocked: false,
    main_id: 1,
  },
];

export const userArr_2: UserForDbSeed_2[] = [
  {
    id: 1,
    user_id: 1,
  },
];
