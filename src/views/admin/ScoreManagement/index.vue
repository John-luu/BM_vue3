<template>
  <div class="score-management">
    <!-- 搜索区 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="filters" class="filter-form">
        <!-- 用户名 -->
        <el-form-item label="用户名">
          <el-input
            v-model="filters.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>

        <!-- 状态 -->
        <el-form-item label="状态">
          <el-select v-model="filters.state" placeholder="全部" clearable>
            <el-option label="预约未签到" :value="2" />
            <el-option label="暂离超时未回" :value="4" />
          </el-select>
        </el-form-item>

        <!-- 预约日期 -->
        <el-form-item label="预约日期">
          <el-date-picker
            v-model="filters.date"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择日期"
            clearable
          />
        </el-form-item>

        <!-- 扣分情况 -->
        <el-form-item label="扣分情况">
          <el-select v-model="filters.scoreStatus" placeholder="全部" clearable>
            <el-option label="待处理" :value="0" />
            <el-option label="已扣分" :value="1" />
          </el-select>
        </el-form-item>

        <!-- 搜索/重置 -->
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
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
      <el-empty v-if="!loading && rows.length === 0" description="暂无记录" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "@/req";

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

/** 搜索条件 */
const filters = reactive({
  username: "",
  state: null as number | null,
  date: "" as string | null,
  scoreStatus: null as number | null, // 0=待处理, 1=已扣分
});

/** 获取数据 */
const fetchData = async () => {
  loading.value = true;
  try {
    // 将空字符串或 null 转成 null
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      username: filters.username?.trim() || null,
      state: filters.state ?? null,
      date: filters.date?.trim() || null,
      scoreStatus:
        filters.scoreStatus !== null && filters.scoreStatus !== undefined
          ? Number(filters.scoreStatus)
          : null,
    };

    const res = await request.get("/teacher/getReservationNeedSub", {
      params,
    });

    rows.value = res.data?.rows || [];
    total.value = res.data?.total || 0;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

/** 搜索操作 */
const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

/** 重置搜索 */
const handleReset = () => {
  filters.username = "";
  filters.state = null;
  filters.date = null;
  filters.scoreStatus = null;
  currentPage.value = 1;
  fetchData();
};


/** 分页 */
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
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")} ${d
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
