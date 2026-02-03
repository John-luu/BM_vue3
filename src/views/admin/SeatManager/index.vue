<template>
  <div>
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
    >
      <el-menu-item index="1" @click="goNumber"> 签到码 </el-menu-item>

      <el-menu-item index="2" @click="goCrud"> 座位管理 </el-menu-item>
    </el-menu>

    <div class="line"></div>

    <router-view :can-add="isCrud" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import "./style.scss";
const route = useRoute();
const router = useRouter();

/** 当前激活菜单 */
const activeIndex = ref<string>("1");

/** 是否在座位管理页 */
const isCrud = computed(() => route.path === "/admin/seat/crud");

/** 跳转方法 */
const goNumber = () => {
  if (route.path !== "/admin/seat/number") {
    router.replace("/admin/seat/number");
  }
};

const goCrud = () => {
  if (route.path !== "/admin/seat/crud") {
    router.replace("/admin/seat/crud");
  }
};

/** 根据路由自动同步高亮 */
watch(
  () => route.path,
  (path) => {
    activeIndex.value = path === "/admin/seat/crud" ? "2" : "1";
  },
  { immediate: true },
);
</script>
