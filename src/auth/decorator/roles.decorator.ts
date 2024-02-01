import { CustomDecorator, SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Operation = (...roles: string[]): CustomDecorator => SetMetadata(ROLES_KEY, roles);
