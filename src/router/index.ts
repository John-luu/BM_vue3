import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/login", // 根路径重定向到登录页
  },
  {
    path: "/login",
    component: () => import("../views/login/index.vue"),
  },
  {
    path: "/admin",
    component: () => import("../views/admin/index.vue"),
    redirect: "/admin/seat/number",
    children: [
      {
        path: "announce",
        component: () => import("../views/admin/AnnounceManagement/index.vue"),
      },
      {
        path: "forum",
        component: () => import("../views/admin/ForumManagement/index.vue"),
      },
      {
        path: "seat",
        component: () => import("../views/admin/SeatManager/index.vue"),
        children: [
          {
            path: "number",
            component: () => import("../views/admin/SeatNumber/index.vue"),
          },
          {
            path: "crud",
            component: () => import("../views/admin/SeatCrud/index.vue"),
          },
        ],
      },
      {
        path: "student",
        component: () => import("../views/admin/StudentManagement/index.vue"),
      },
      {
        path: "teacher",
        component: () => import("../views/admin/TeacherManagement/index.vue"),
      },
      {
        path: "statistics",
        component: () => import("../views/admin/Statistics/index.vue"),
      },
      {
        path: "reservation",
        component: () => import("../views/admin/ReservationMess/index.vue"),
      },
      {
        path: "score",
        component: () => import("../views/admin/ScoreManagement/index.vue"),
      },
    ],
  },
  //   {
  //     path: "/student",
  //     component: () => import("../user/Main.vue"),
  //     children: [
  //       {
  //         path: "forum",
  //         component: () => import("../user/Forum.vue"),
  //       },
  //       {
  //         path: "seat",
  //         component: () => import("../user/Seat.vue"),
  //         redirect: "/student/seat/reservation",
  //         children: [
  //           {
  //             path: "reservation",
  //             component: () => import("../user/Reservation.vue"),
  //           },
  //           {
  //             path: "toSigned",
  //             component: () => import("../user/ToSigned.vue"),
  //           },
  //           {
  //             path: "beUse",
  //             component: () => import("../user/BeUse.vue"),
  //           },
  //         ],
  //       },
  //       {
  //         path: "mine",
  //         component: () => import("../user/Mine.vue"),
  //       },
  //     ],
  //   },
  //   {
  //     path: "/LookStudentMess",
  //     component: () => import("../teacher/StudentMess.vue"),
  //   },
  //   {
  //     path: "/ScoreMess",
  //     component: () => import("../user/ScoreMess.vue"),
  //   },
  //   {
  //     path: "/PushArticle",
  //     component: () => import("../user/PushArticle.vue"),
  //   },
  //   {
  //     path: "/ForumInfo",
  //     component: () => import("../user/ForumInfo.vue"),
  //   },
  //   {
  //     path: "/Teacher",
  //     component: () => import("../teacher/Main.vue"),
  //     children: [
  //       {
  //         path: "seat",
  //         component: () => import("../teacher/SeatMess.vue"),
  //       },
  //       {
  //         path: "reservation",
  //         component: () => import("../teacher/ReservationMess.vue"),
  //       },
  //       {
  //         path: "score",
  //         component: () => import("../teacher/ScoreManagement.vue"),
  //       },
  //     ],
  //   },
];

const router = createRouter({
  history: createWebHistory(), // 等价于 Vue2 的 mode: 'history'
  routes,
});

export default router;
