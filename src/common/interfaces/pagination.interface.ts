export interface IPaginatedResponseResult<T> {
  data: T[];
  metadata: metadata;
}
export interface metadata {
  pageNumber: number;
  pagesCount: number;
  pageSize: number;
  recordsNumber: number;
}
