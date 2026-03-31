<template>
  <div class="root">
    <el-card class="seat-card">
      <!-- header -->
      <template #header>
        <div class="card-header">
          <!-- 左侧：区域选择 -->
          <div class="header-left">
            <ToggleArea
              v-if="areaRows"
              :area-rows="areaRows"
              :can-add="canAdd"
              @changeArea="onAreaChange"
              @areaCreated="onAreaCreated"
              @areaDeleted="refreshAreaList"
            />
          </div>

          <!-- 右侧：批量操作 -->
          <div class="header-right">
            <el-button
              size="small"
              plain
              class="btn-create"
              :type="batchMode && batchType === 0 ? 'primary' : 'default'"
              @click="enterBatchMode(0)"
            >
              🪑 批量添加椅子
            </el-button>

            <el-button
              size="small"
              plain
              class="btn-create"
              :type="batchMode && batchType === 1 ? 'primary' : 'default'"
              @click="enterBatchMode(1)"
            >
              🧱 批量添加桌子
            </el-button>

            <el-button
              v-if="batchMode"
              size="small"
              type="primary"
              class="btn-confirm"
              @click="confirmBatchAdd"
            >
              ✅ 确认（{{ batchSelected.length }}）
            </el-button>

            <el-button v-if="batchMode" size="small" class="btn-cancel" @click="exitBatchMode">
              取消
            </el-button>
          </div>
        </div>
      </template>

      <!-- 主体 -->
      <Area
        v-if="currentArea"
        ref="room"
        class="area-container"
        :rows="currentArea.rows"
        :columns="currentArea.columns"
        :seat-rows="seatRows"
        :manageMode="true"
        :batchMode="batchMode"
        :batch-selected="batchSelected"
        @seatClick="seatClick"
        @blankClick="blankClick"
      >
        <!-- 空白格菜单 -->
        <template #blankMenu v-if="!batchMode">
          <div class="blankMenu">
            <div @click="addSeat(0)">添加座位</div>
            <div @click="addSeat(1)">添加桌子</div>
          </div>
        </template>

        <!-- 座位菜单 -->
        <template #seatMenu>
          <div class="blankMenu">
            <div @click="deleteSeat">
              <el-icon><Delete /></el-icon>
              删除
            </div>
          </div>
        </template>
      </Area>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete } from "@element-plus/icons-vue";

import Area from "@/components/Area.vue";
import ToggleArea from "@/components/ToggleArea.vue";
import request from "@/req";

/* ===== 类型定义 ===== */
interface AreaInfo {
  aid: number;
  rows: number;
  columns: number;
  areaName: string;
  subName: string;
}

interface Seat {
  sid: number;
  row: number;
  column: number;
  state: number;
  show?: boolean;
  type: number;
}

interface Position {
  row: number;
  column: number;
}

/* ===== 基础状态 ===== */
const areaRows = ref<AreaInfo[] | null>(null);
const currentArea = ref<AreaInfo | null>(null);
const seatRows = ref<Seat[]>([]);

const canAdd = ref(true);

/* ===== 批量模式 ===== */
const batchMode = ref(false);
const batchType = ref<0 | 1 | null>(null);
const batchSelected = ref<Position[]>([]);

/* ===== 当前操作座位 ===== */
const seatCur = ref<Position>({ row: 0, column: 0 });
const currentSid = ref<number | null>(null);

/* ===== refs ===== */
const room = ref();

/* ===== 事件处理 ===== */
const seatClick = (index: number) => {
  const seat = seatRows.value[index];
  if (!seat) return;
  currentSid.value = seat.sid;
};

const blankClick = (_: number, row: number, column: number) => {
  if (batchMode.value) {
    const idx = batchSelected.value.findIndex(
      (p) => p.row === row && p.column === column,
    );
    idx > -1
      ? batchSelected.value.splice(idx, 1)
      : batchSelected.value.push({ row, column });
    return;
  }

  seatCur.value = { row, column };
};

/* ===== 单个添加 ===== */
const addSeat = (type: 0 | 1) => {
  if (!currentArea.value) return;

  room.value?.closeLastPop();

  request
    .post("/admin/addSeat", {
      ...seatCur.value,
      area: currentArea.value.aid, // ✅
      type,
    })
    .then(() => {
      ElMessage.success("添加成功");
      loadSeatRows();
    });
};

/* ===== 批量添加 ===== */
const enterBatchMode = (type: 0 | 1) => {
  batchMode.value = true;
  batchType.value = type;
  batchSelected.value = [];
  ElMessage.info(`请选择要添加${type === 0 ? "椅子" : "桌子"}的位置`);
};

const confirmBatchAdd = async () => {
  if (!batchSelected.value.length) {
    ElMessage.warning("请至少选择一个位置");
    return;
  }

  await ElMessageBox.confirm(
    `确认生成 ${batchSelected.value.length} 个？`,
    "确认批量生成",
    { type: "warning" },
  );

  await request.post("/admin/addSeatsBatch", {
    area: currentArea.value!.aid,
    type: batchType.value,
    rows: batchSelected.value,
  });

  ElMessage.success("批量添加成功");
  exitBatchMode();
  loadSeatRows();
};

const exitBatchMode = () => {
  batchMode.value = false;
  batchType.value = null;
  batchSelected.value = [];
};

/* ===== 删除 ===== */
const deleteSeat = () => {
  if (!currentSid.value) return;
  request.post("/admin/deleteSeat", { sid: currentSid.value }).then(() => {
    ElMessage.success("删除成功");
    loadSeatRows();
  });
};

/* ===== 区域相关 ===== */
const onAreaChange = (area: AreaInfo) => {
  currentArea.value = area;
  loadSeatRows();
};

const onAreaCreated = () => refreshAreaList();

const refreshAreaList = () => {
  request.get("/public/getArea").then((res) => {
    areaRows.value = res.data.rows;
  });
};

const loadSeatRows = () => {
  if (!currentArea.value) return;

  request
    .post("/public/getAreaSeats", {
      area: currentArea.value.aid, // ✅
    })
    .then((res) => {
      seatRows.value = res.data.rows ?? [];
    });
};

/* ===== 生命周期 ===== */
onMounted(() => {
  refreshAreaList();
});
</script>
