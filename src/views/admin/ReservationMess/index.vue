<template>
  <div class="reservation-container">
    <el-card class="table-card" shadow="never">
      <el-table
        :data="rows"
        stripe
        border
        highlight-current-row
        @row-click="onRowClick"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column
          label="序号"
          type="index"
          width="70"
          align="center"
          :index="indexMethod"
        />
        <!-- 用户 -->
        <el-table-column label="用户" min-width="160">
          <template #default="{ row }">
            <div class="user-cell">
              <span class="username">{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 座位 -->
        <el-table-column label="座位" min-width="140">
          <template #default="{ row }">
            <el-icon><Location /></el-icon>
            {{ row.subName }}{{ row.row }}{{ row.column }}
          </template>
        </el-table-column>

        <!-- 日期 -->
        <el-table-column label="日期" min-width="120">
          <template #default="{ row }">
            <el-icon><Calendar /></el-icon>
            {{ getDate(row.startTime) }}
          </template>
        </el-table-column>

        <!-- 使用时间 -->
        <el-table-column label="使用时间" min-width="180">
          <template #default="{ row }">
            <span class="time-range" :class="{ active: row.state === 1 }">
              {{ formatTimeRange(row.startTime, row.endTime) }}
            </span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.state)" effect="light" size="small">
              {{ getStateText(row.state) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-pagination
      v-if="total > 0"
      class="table-pagination"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="[10, 20, 30, 50]"
      :total="total"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
    <!-- 空状态 -->
    <el-empty v-if="!loading && rows.length === 0" description="暂无预约记录" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Location, Calendar } from "@element-plus/icons-vue";
import request from "@/req";
import "./style.scss";
/** 类型定义 */
interface ReservationItem {
  username: string;
  state: number;
  subName: string;
  row: number;
  column: number;
  startTime: string;
  endTime: string;
}

const router = useRouter();
const rows = ref<ReservationItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

/** 行点击 */
const onRowClick = (row: ReservationItem) => {
  localStorage.setItem("student", JSON.stringify(row));
  router.push("/LookStudentMess");
};
const indexMethod = (index: number) => {
  return (currentPage.value - 1) * pageSize.value + index + 1;
};

/** 状态文字 */
const getStateText = (state: number): string => {
  const map: Record<number, string> = {
    0: "待签到",
    1: "使用中",
    2: "未签到",
    3: "暂离",
    4: "超时",
    5: "完成",
  };
  return map[state] || "未知";
};

/** 状态标签类型 */
const getTagType = (
  state: number,
): "success" | "warning" | "danger" | "info" | undefined => {
  switch (state) {
    case 1:
      return "success";
    case 0:
      return "warning";
    case 2:
      return "danger";
    case 3:
      return "info";
    case 4:
      return "warning";
    case 5:
      return undefined;
    default:
      return undefined;
  }
};

/** 日期格式 */
const getDate = (time: string): string => {
  const date = new Date(time);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

const formatTime = (time: string): string => {
  const date = new Date(time);
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

const formatTimeRange = (start: string, end: string): string => {
  return `${formatTime(start)} - ${formatTime(end)}`;
};

const fetchData = async () => {
  loading.value = true;

  const res = await request.get("/teacher/getReservation", {
    params: {
      page: currentPage.value,
      pageSize: pageSize.value,
    },
  });

  rows.value = res.data.rows || [];
  total.value = res.data.total || 0;

  loading.value = false;
};
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchData();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>
