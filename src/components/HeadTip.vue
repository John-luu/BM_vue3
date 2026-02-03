<template>
  <div class="head-tip">
    <!-- 使用 Element Plus 图标 -->
    <el-icon color="#31af0a" :size="26"><Check /></el-icon>
    <div class="label">可选</div>

    <el-icon color="#d05c43" :size="26"><Close /></el-icon>
    <div class="label">使用中</div>

    <el-icon color="gray" :size="26"><Clock /></el-icon>
    <div class="label">有约</div>

    <div class="table"></div>
    <div class="label">桌子</div>
  </div>
</template>

<script setup lang="ts">
import { Check, Close, Clock } from "@element-plus/icons-vue";
</script>

<style scoped>
.head-tip {
  display: flex;
  float: right;
  padding: 3px 0;
  align-items: center;
  transform: scale(0.7);
}

.label {
  margin-left: 5px;
  margin-right: 1em;
}

.table {
  width: 18px;
  height: 18px;
  border: 1px solid #999;
  border-radius: 2px;
}
</style>
