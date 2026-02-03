// @/api/types/response.ts - 响应类型定义
/**
 * 通用API响应结构
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  rows?: T[]; // 兼容后端返回的 rows 字段
  total?: number; // 分页总数
  [key: string]: any; // 其他可能的字段
}

/**
 * 分页响应结构
 */
export interface PaginatedResponse<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

/**
 * 通用列表响应（兼容旧接口）
 */
export interface ListResponse<T> {
  rows: T[];
  [key: string]: any;
}
