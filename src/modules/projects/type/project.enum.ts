import { registerEnumType } from "@nestjs/graphql";

/** Вкладки проекты */
export enum TabsProject {
  /** Вкладка «В работе» */
  IN_PROGRESS = 0,
  /** Вкладка «Завершенные» */
  CLOSED = 1,
  /** Вкладка «Все» */
  ALL = 2,
}

registerEnumType(TabsProject, {
  name: "TabsProject",
  description: "Вкладки Проектов.",
  valuesMap: {
    IN_PROGRESS: {
      description: "Вкладка «В работе».",
    },
    CLOSED: {
      description: "Вкладка «Завершенные».",
    },
    ALL: {
      description: "Вкладка «Все».",
    },
  },
});
