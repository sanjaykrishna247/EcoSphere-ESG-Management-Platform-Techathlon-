export interface SuccessResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
