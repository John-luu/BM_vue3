// @/api/admin.ts - 管理员接口模块
import request from "@/req";
import type { ApiResponse, PaginatedResponse } from "../types/response.ts";

// 请求参数类型
export interface SportUpdateParams {
  // 根据实际字段定义
  [key: string]: any;
}

export interface AnnounceParams {
  content: string;
  title?: string;
  datetime?: number;
}

export interface AreaAddParams {
  name: string;
  rows: number;
  columns: number;
}

export interface AreaData {
  aid: number;
  name: string;
  rows: number;
  columns: number;
  createdAt?: number;
}

export interface SeatAddParams {
  row: number;
  column: number;
  area: number;
  type: number; // 0: 椅子, 1: 桌子
}

export interface BatchAddSeatsParams {
  area: number;
  type: number;
  rows: Array<{
    row: number;
    column: number;
  }>;
}

export interface DeleteSeatParams {
  sid: number;
}

export interface ArticleDeleteParams {
  articleId: number;
}

export interface PasswordUpdateParams {
  oldPassword: string;
  newPassword: string;
}

export interface UserSearchParams {
  number?: string;
  username?: string;
  page?: number;
  pageSize?: number;
}

export interface UserItem {
  uid: number;
  number: string;
  username: string;
  avatar?: string;
  gender?: string;
  college?: string;
  class?: string;
  createTime?: number;
}

export interface TeacherItem {
  tid: number;
  number: string;
  username: string;
  avatar?: string;
  gender?: string;
  college?: string;
  createTime?: number;
}

export interface StatisticsData {
  userCounter: {
    total: number;
    todayActive?: number;
    monthActive?: number;
  };
  timeList: Array<{
    time: string;
    sum: number;
  }>;
}

export const adminApi = {
  /* ===================== 运动状态 ===================== */

  /**
   * 更新运动状态
   */
  updateSport: (params: SportUpdateParams) =>
    request.post<ApiResponse>("/admin/updateSport", params),

  /* ===================== 公告 ===================== */

  /**
   * 获取公告列表
   */
  getAnnounce: () =>
    request.get<ApiResponse<{ rows: AnnounceParams[] }>>("/admin/getAnnounce"),

  /**
   * 添加公告
   */
  addAnnounce: (params: AnnounceParams) =>
    request.post<ApiResponse>("/admin/addAnnounce", params),

  /**
   * 删除公告
   */
  deleteAnnounce: (
    params: { aid?: number }, // 根据实际参数名调整
  ) => request.post<ApiResponse>("/admin/deleteAnnounce", params),

  /* ===================== 区域管理 ===================== */

  /**
   * 添加区域
   * @returns 包含自动生成的 aid
   */
  addArea: (params: AreaAddParams) =>
    request.post<ApiResponse<AreaData>>("/admin/addArea", params),

  /* ===================== 座位管理 ===================== */

  /**
   * 添加单个座位
   */
  addSeat: (params: SeatAddParams) =>
    request.post<ApiResponse>("/admin/addSeat", params),

  /**
   * 批量添加座位
   */
  addSeatsBatch: (params: BatchAddSeatsParams) =>
    request.post<ApiResponse>("/admin/addSeatsBatch", params),

  /**
   * 删除座位
   */
  deleteSeat: (params: DeleteSeatParams) =>
    request.post<ApiResponse>("/admin/deleteSeat", params),

  /* ===================== 文章管理 ===================== */

  /**
   * 删除文章
   */
  deleteArticle: (params: ArticleDeleteParams) =>
    request.post<ApiResponse>("/admin/deleteArticle", params),

  /* ===================== 管理员设置 ===================== */

  /**
   * 修改密码
   */
  updatePassword: (params: PasswordUpdateParams) =>
    request.post<ApiResponse>("/admin/updatePwd", params),

  /* ===================== 学生管理 ===================== */

  /**
   * 搜索学生（分页）
   */
  searchUser: (params: UserSearchParams) =>
    request.get<ApiResponse<PaginatedResponse<UserItem>>>("/admin/searchUser", {
      params,
    }),

  /* ===================== 教师管理 ===================== */

  /**
   * 搜索教师（分页）
   */
  searchTeacher: (params: UserSearchParams) =>
    request.get<ApiResponse<PaginatedResponse<TeacherItem>>>(
      "/admin/searchTeacher",
      {
        params,
      },
    ),

  /**
   * 获取所有教师（旧接口，兼容）
   */
  getTeacher: () =>
    request.get<ApiResponse<{ rows: TeacherItem[] }>>("/admin/getTeacher"),

  /* ===================== 统计分析 ===================== */

  /**
   * 获取统计数据
   */
  getStatistics: () =>
    request.get<ApiResponse<StatisticsData>>("/admin/getStatistics"),
};
