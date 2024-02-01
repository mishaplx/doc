export interface IRecursiveNomenclature {
  id?: number;
  parent_id?: number;
  name?: string;
  index?: string;
  serial_number?: number;
  nt?: string;
  storage_comment?: string;
  article_id?: number;
  level?: number;
  newId?: number;
  main_parent_id?: number;
}

export interface INomenclaturesLevel {
  level: number;
  nomenclatures: IRecursiveNomenclature[];
}
