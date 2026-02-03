<template>
  <el-container class="layout">
    <!-- 左侧侧边栏 -->
    <el-aside width="200px" class="aside">
      <el-menu :default-active="activePath" router class="menu">
        <el-menu-item v-for="item in tabs" :key="item.url" :index="item.url">
          {{ item.name }}
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧内容 -->
    <el-main class="main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
interface TabItem {
  name: string;
  url: string;
}
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
const route = useRoute();

const tabs = ref<TabItem[]>([
  { name: "座位管理", url: "/admin/seat/number" },
  { name: "论坛管理", url: "/admin/forum" },
  { name: "公告管理", url: "/admin/announce" },
  { name: "学生管理", url: "/admin/student" },
  { name: "老师管理", url: "/admin/teacher" },
  { name: "统计分析", url: "/admin/statistics" },
  { name: "预约信息管理", url: "/admin/reservation" },
  { name: "信用分管理", url: "/admin/score" },
]);

// 当前激活菜单（自动跟随路由）
const activePath = computed(() => route.path);
</script>

<style>
.layout {
  height: 100vh; /* 关键 */
}

.aside {
  background-color: #ffffff;
  border-right: 1px solid #ebeef5;
}

.menu {
  height: 100%;
  border-right: none;
}

/* 右侧内容 */
.main {
  padding: 16px;
  background-color: #f5f7fa;
}
</style>
