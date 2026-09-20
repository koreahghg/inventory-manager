export type Paginated<T> = {
  rows: T[];
  page: number;
  totalPages: number;
  totalCount: number;
};

export function paginate<T>(rows: T[], page: number, totalCount: number, pageSize: number): Paginated<T> {
  return {
    rows,
    page,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}

export function rangeFor(page: number, pageSize: number): [number, number] {
  const from = (page - 1) * pageSize;
  return [from, from + pageSize - 1];
}
