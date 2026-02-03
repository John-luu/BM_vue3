// @/api/forum.ts - 论坛/文章接口模块
import request from "@/req";
import type { ApiResponse, ListResponse } from "../types/response";

// 请求参数类型
export interface CommentQueryParams {
  articleId: number;
}

export interface ArticleCreateParams {
  title: string;
  content: string;
  author?: string;
  authorId?: number;
  category?: string;
  tags?: string[];
  datetime?: number; // 后端会自动添加
}

export interface CommentCreateParams {
  articleId: number;
  content: string;
  userId?: number;
  username?: string;
  parentId?: number; // 回复评论的ID，0表示主评论
  datetime?: number; // 后端会自动添加
}

export interface ArticleStatusParams {
  articleId: number;
  status?: number; // 0: 下线, 1: 上线
}

// 数据模型类型
export interface ArticleItem {
  articleId: number;
  title: string;
  content: string;
  author: string;
  authorId: number;
  avatar?: string;
  category?: string;
  tags?: string;
  status: number; // 0: 下线, 1: 上线
  viewCount?: number;
  commentCount?: number;
  likeCount?: number;
  datetime: number;
  createTime?: string;
}

export interface CommentItem {
  commentId: number;
  articleId: number;
  content: string;
  userId: number;
  username: string;
  avatar?: string;
  parentId: number; // 0: 主评论, >0: 回复评论ID
  parentUsername?: string; // 被回复的用户名
  likeCount?: number;
  datetime: number;
  createTime?: string;
  replies?: CommentItem[]; // 子评论（回复）
}

export interface AdminArticleItem extends ArticleItem {
  isOffline?: boolean; // 是否已下线
  offlineTime?: number;
  offlineReason?: string;
}

export const forumApi = {
  /* ===================== 用户端接口 ===================== */

  /**
   * 获取文章列表（用户端）
   * @description 获取已上线的文章列表
   */
  getArticle: () =>
    request.get<ApiResponse<ListResponse<ArticleItem>>>("/forum/getArticle"),

  /**
   * 获取文章评论
   * @param params 文章ID
   */
  getComment: (params: CommentQueryParams) =>
    request.post<ApiResponse<ListResponse<CommentItem>>>(
      "/forum/getComment",
      params,
    ),

  /**
   * 发布文章
   * @param params 文章内容
   */
  insertArticle: (params: ArticleCreateParams) =>
    request.post<ApiResponse>("/forum/insertArticle", params),

  /**
   * 发表评论
   * @param params 评论内容
   */
  insertComment: (params: CommentCreateParams) =>
    request.post<ApiResponse>("/forum/insertComment", params),

  /* ===================== 管理端接口 ===================== */

  /**
   * 获取文章列表（管理端）
   * @description 获取所有文章（包括上下线状态）
   */
  getArticleAdmin: () =>
    request.get<ApiResponse<ListResponse<AdminArticleItem>>>(
      "/forum/admin/getArticle",
    ),

  /**
   * 下线文章
   * @param params 文章ID
   */
  offlineArticle: (params: ArticleStatusParams) =>
    request.post<ApiResponse>("/forum/admin/offlineArticle", params),

  /**
   * 上线文章
   * @param params 文章ID
   */
  onlineArticle: (params: ArticleStatusParams) =>
    request.post<ApiResponse>("/forum/admin/onlineArticle", params),

  /* ===================== 扩展接口（如果需要） ===================== */

  /**
   * 获取文章详情
   */
  getArticleDetail: (articleId: number) =>
    request.get<ApiResponse<ArticleItem>>(`/forum/article/${articleId}`),

  /**
   * 点赞文章
   */
  likeArticle: (articleId: number) =>
    request.post<ApiResponse>("/forum/like", { articleId }),

  /**
   * 取消点赞文章
   */
  unlikeArticle: (articleId: number) =>
    request.post<ApiResponse>("/forum/unlike", { articleId }),

  /**
   * 删除评论（用户端）
   */
  deleteComment: (commentId: number) =>
    request.post<ApiResponse>("/forum/deleteComment", { commentId }),

  /**
   * 获取热门文章
   */
  getHotArticles: (limit: number = 10) =>
    request.get<ApiResponse<ListResponse<ArticleItem>>>("/forum/hot", {
      params: { limit },
    }),

  /**
   * 搜索文章
   */
  searchArticles: (keyword: string, category?: string) =>
    request.get<ApiResponse<ListResponse<ArticleItem>>>("/forum/search", {
      params: { keyword, category },
    }),
};
