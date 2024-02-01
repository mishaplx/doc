export type TypeDefaultFavoritesName =
  | "docId"
  | "jobId"
  | "projectId"
  | "userTableFavorite"
  | "empTableFavorite"
  | "orgTableFavorite";
export type TypeDefaultFavoritesData = Record<TypeDefaultFavoritesName, number[]>;
