<template>
  <div class="score-management">
    <el-card class="table-card" shadow="never">
      <el-table
        :data="rows"
        border
        stripe
        v-loading="loading"
        header-row-class-name="table-header"
        style="width: 100%"
      >
        <!-- 序号 -->
        <el-table-column label="序号" type="index" width="70" align="center" />

        <!-- 用户 -->
        <el-table-column label="用户" min-width="160">
          <template #default="{ row }">
            <span class="username">{{ row.username }}</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="140" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getStateTagType(row.state)"
              effect="light"
              size="small"
            >
              {{ getStateText(row.state) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 预约时间 -->
        <el-table-column label="预约时间" min-width="190">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>

        <!-- 使用时段 -->
        <el-table-column label="使用时段" min-width="160">
          <template #default="{ row }">
            {{ formatTimeRange(row.startTime, row.endTime) }}
          </template>
        </el-table-column>

        <!-- 扣分情况 -->
        <el-table-column label="扣分情况" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.score" class="score-text">
              已扣 {{ row.score }} 分
            </span>
            <el-tag v-else type="warning" effect="plain" size="small">
              待处理
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="140" align="center">
          <template #default="{ row }">
            <el-button
              v-if="!row.score"
              type="danger"
              size="small"
              plain
              @click="subScore(row)"
            >
              扣分
            </el-button>
            <span v-else class="done-text">已处理</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
      <el-empty
        v-if="!loading && rows.length === 0"
        description="暂无待处理的扣分记录"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "@/req";
import "./style.scss";
/** 数据类型 */
interface ScoreItem {
  uid: number;
  rid: number;
  username: string;
  state: number;
  score?: number;
  startTime: string;
  endTime: string;
}

const rows = ref<ScoreItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

/** 获取数据 */
const fetchData = async () => {
  loading.value = true;
  const res = await request.get("/teacher/getReservationNeedSub", {
    params: {
      page: currentPage.value,
      pageSize: pageSize.value,
    },
  });

  rows.value = res.data?.rows || [];
  total.value = res.data?.total || 0;
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

/** 扣分 */
const subScore = (row: ScoreItem) => {
  ElMessageBox.confirm(`确认对【${row.username}】执行扣分操作？`, "提示", {
    type: "warning",
  }).then(async () => {
    await request.post("/teacher/subScore", {
      uid: row.uid,
      rid: row.rid,
    });
    ElMessage.success("扣分成功");
    fetchData();
  });
};

/** 状态文字 */
const getStateText = (state: number) => {
  switch (state) {
    case 2:
      return "预约未签到";
    case 4:
      return "暂离超时未回";
    default:
      return "未知状态";
  }
};

/** 状态标签 */
const getStateTagType = (state: number): "warning" | "danger" | "info" => {
  return state === 2 ? "warning" : "danger";
};

/** 时间格式 */
const formatDateTime = (time: string) => {
  const d = new Date(time);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d
    .getHours()
    .toString()
    .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
};

const formatTimeRange = (start: string, end: string) => {
  const f = (t: string) => {
    const d = new Date(t);
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };
  return `${f(start)} - ${f(end)}`;
};

onMounted(fetchData);
</script>
