import { TransformFnParams } from "class-transformer";

export const valid_bool = ({ value }: TransformFnParams) =>
  value === null || value === undefined ? value : value === "true";

export const valid_int = ({ value }: TransformFnParams) =>
  value === null || value === undefined ? value : +value;
