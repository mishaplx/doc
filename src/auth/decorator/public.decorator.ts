import { CustomDecorator, SetMetadata } from "@nestjs/common";

export const isPublic = (): CustomDecorator => SetMetadata("isPublic", true);
