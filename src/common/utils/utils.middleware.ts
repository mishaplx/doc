import { MiddlewareContext, NextFn } from "@nestjs/graphql";
import dayjs from "dayjs";

import { JobEntity } from "../../entity/#organization/job/job.entity";
/*
2023-04-05->05-04-2023
 */
export const reverseDate = async (ctx: MiddlewareContext, next: NextFn) => {
  const value = await next();

  if (typeof value === "object" && value !== null) {
    const date = new Date(value);
    return dayjs(date).format("DD/MM/YYYY");
  }

  if (value) return value.split("-").reverse().join("-");
  return null;
};

/**
 * FIELD.MIDDLEWARE
 * JOB: ИСКЛЮЧИТЬ ЗАПИСИ С DEL И TEMP
 */
export const mwJob = async (ctx: MiddlewareContext, next: NextFn) => {
  const value = (await next()) as JobEntity[];
  return value.filter((x) => !(x?.del || x?.temp));
};
