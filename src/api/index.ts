// @/api/index.ts - 主入口
import { adminApi } from "./admin";
// import { publicApi } from "./public";
// import { userApi } from "./user";
// import { teacherApi } from "./teacher";
import { forumApi } from "./forum";

export const api = {
  admin: adminApi,
  //   public: publicApi,
  //   user: userApi,
  //   teacher: teacherApi,
  forum: forumApi,
};
