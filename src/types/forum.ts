// @/types/forum.ts - 论坛相关类型
// export const ArticleStatus = {
//   OFFLINE = 0, // 下线
//   ONLINE = 1, // 上线
//   DELETED = 2, // 删除
// } as const;

// export const CommentType = {
//   MAIN = 0, // 主评论
//   REPLY = 1, // 回复评论
// } as const;

// // 类型定义
// export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus];
// export type CommentType = (typeof CommentType)[keyof typeof CommentType];

export interface UserBriefInfo {
  userId: number;
  username: string;
  avatar?: string;
  role?: number;
}

export interface ArticleTag {
  tagId: number;
  name: string;
  color?: string;
}

export interface ArticleCategory {
  categoryId: number;
  name: string;
  description?: string;
}
