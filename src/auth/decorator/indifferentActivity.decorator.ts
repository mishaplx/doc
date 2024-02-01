import { CustomDecorator, SetMetadata } from "@nestjs/common";

export const indifferentActivity = (): CustomDecorator => SetMetadata("indifferentActivity", true);
