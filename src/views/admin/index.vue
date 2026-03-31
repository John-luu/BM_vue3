<template>
  <div class="hs-admin-layout">
    <el-container class="layout-shell">
      <el-aside width="248px" class="aside">
        <div class="brand-block">
          <div class="brand-badge">
            <img class="brand-logo" src="/韩师/hs_logo.png" alt="韩师logo" />
          </div>
          <div class="brand-text">
            <h1>图书馆座位预约系统</h1>
            <p>Admin Console</p>
          </div>
        </div>

        <el-menu :default-active="activePath" router class="menu">
          <el-menu-item v-for="item in tabs" :key="item.url" :index="item.url">
            {{ item.name }}
          </el-menu-item>
        </el-menu>

        <div class="logout-entry" @click="handleLogout">退出登录</div>

        <div class="aside-footer">HanShan Normal University</div>
      </el-aside>

      <el-container class="content-layout">
        <el-header class="top-header">
          <div class="header-title">{{ currentTitle }}</div>
          <div class="header-subtitle">{{ currentDateText }}</div>
        </el-header>

        <el-main class="main">
          <div class="content-shell">
            <router-view />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

interface TabItem {
  name: string;
  url: string;
}

const route = useRoute();
const router = useRouter();

const tabs = ref<TabItem[]>([
  { name: "座位管理", url: "/admin/seat/number" },
  { name: "论坛管理", url: "/admin/forum" },
  { name: "公告管理", url: "/admin/announce" },
  { name: "学生管理", url: "/admin/student" },
  { name: "预约信息管理", url: "/admin/reservation" },
  { name: "信用分管理", url: "/admin/score" },
  { name: "统计分析", url: "/admin/statistics" },
]);

// 当前激活菜单（自动跟随路由）
const activePath = computed(() => route.path);

const currentTitle = computed(() => {
  const active = tabs.value.find((item) => route.path.startsWith(item.url));
  return active?.name || "后台管理";
});

const currentDateText = computed(() => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
});

const handleLogout = () => {
  localStorage.removeItem("user");
  router.push("/login");
};
</script>

<style scoped lang="scss">
.layout-shell {
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
}

.aside {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  padding: 18px 14px 14px;
  gap: 12px;
}

.content-layout {
  height: 100vh;
  overflow: hidden;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px 14px;
}

.brand-badge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.brand-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brand-text h1 {
  margin: 0;
  font-size: 15px;
  line-height: 1.2;
}

.brand-text p {
  margin: 4px 0 0;
  font-size: 12px;
  letter-spacing: 0.8px;
}

.menu {
  flex: 1;
  border-right: none;
}

.logout-entry {
  margin: 6px 2px 0;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #dbe8f4;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-entry:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.aside-footer {
  text-align: center;
  font-size: 12px;
  letter-spacing: 0.8px;
  padding-bottom: 8px;
}

.top-header {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 26px;
}

.header-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.header-subtitle {
  font-size: 13px;
  letter-spacing: 0.6px;
}

.main {
  height: calc(100vh - 70px);
  overflow-y: auto;
  padding: 0 26px 24px;
}

.content-shell {
  position: relative;
  overflow: hidden;
  min-height: 100%;
  border-radius: 18px;
  padding: 18px;
}

.content-shell::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.74)),
    url("/韩师/图片四.jpg") no-repeat center center / cover;
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

.content-shell > * {
  position: relative;
  z-index: 1;
}

@media (max-width: 1024px) {
  .aside {
    width: 220px !important;
  }

  .top-header {
    padding: 0 16px;
  }

  .main {
    padding: 0 16px 16px;
  }

  .content-shell {
    padding: 12px;
  }
}

@media (max-width: 768px) {
  .layout-shell {
    display: block;
    height: auto;
    overflow: visible;
  }

  .aside {
    width: 100% !important;
    height: auto;
    min-height: auto;
    overflow: visible;
  }

  .content-layout {
    height: auto;
    overflow: visible;
  }

  .top-header {
    height: auto;
    padding: 14px 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .main {
    height: auto;
    overflow: visible;
    padding: 0 12px 12px;
  }

  .content-shell {
    min-height: auto;
  }

  .content-shell::after {
    opacity: 0.24;
  }

  .content-shell {
    min-height: auto;
  }
}
</style>
