<template>
  <div class="area-wrapper">
    <!-- 底部空白网格 -->
    <div class="room" :style="gridStyle">
      <div
        v-for="(item, index) in blankRows"
        :key="index"
        class="item"
        @click="blankClick(index)"
      >
        <div v-if="!item.show" class="seat" :class="getBatchSeatClass(index)">
          <div v-if="isSelectedInBatch(index)" class="batch-selected-indicator">
            ✓
          </div>
        </div>

        <el-popover
          v-else
          v-model:visible="item.show"
          placement="top"
          trigger="manual"
          popper-class="dark-popover"
        >
          <slot name="blankMenu" />
          <template #reference>
            <div
              class="seat"
              :class="[
                index === lastBlankIndex ? 'seatSelect' : '',
                getBatchSeatClass(index),
              ]"
            >
              <div
                v-if="isSelectedInBatch(index)"
                class="batch-selected-indicator"
              >
                ✓
              </div>
            </div>
          </template>
        </el-popover>
      </div>
    </div>

    <!-- 座位层 -->
    <div class="room overlay" :style="gridStyle">
      <div
        v-for="(item, index) in seatRows"
        :key="index"
        class="item"
        :style="{
          gridRow: item.row,
          gridColumn: item.column,
        }"
        @click="seatClick(index)"
      >
        <Seat v-if="!item.show" :item="item" />

        <el-popover
          v-else
          v-model:visible="item.show"
          placement="top"
          trigger="manual"
          popper-class="dark-popover"
        >
          <slot name="seatMenu" />
          <template #reference>
            <Seat :item="item" />
          </template>
        </el-popover>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  onBeforeUnmount,
  reactive,
  ref,
  watch,
} from "vue";
import Seat from "@/components/Seat.vue";

/* ================= props ================= */

interface BatchPosition {
  row: number;
  column: number;
}

interface SeatItem {
  row: number;
  column: number;
  show: boolean;
  [key: string]: any;
}

const props = defineProps<{
  manageMode?: boolean;
  batchMode?: boolean;
  seatRows: SeatItem[];
  rows: number;
  columns: number;
  batchSelected?: BatchPosition[];
}>();

const emit = defineEmits<{
  (e: "seatClick", index: number): void;
  (e: "blankClick", realIndex: number, row: number, column: number): void;
}>();

/* ================= state ================= */

const blankRows = reactive<{ show: boolean }[]>([]);
const lastBlankIndex = ref(-1);

/* ================= utils ================= */

const calcRowColumn = (index: number) => {
  const realIndex = index + 1;
  const column =
    realIndex % props.columns === 0 ? props.columns : realIndex % props.columns;
  const row =
    realIndex % props.columns === 0
      ? Math.trunc(realIndex / props.columns)
      : Math.trunc(realIndex / props.columns) + 1;

  return { realIndex, row, column };
};

/* ================= methods ================= */

const isSelectedInBatch = (index: number) => {
  if (!props.batchMode || !props.batchSelected?.length) return false;
  const { row, column } = calcRowColumn(index);
  return props.batchSelected.some(
    (item) => item.row === row && item.column === column,
  );
};

const getBatchSeatClass = (index: number) => {
  if (!props.batchMode) return "";
  return isSelectedInBatch(index) ? "batch-selected" : "";
};

const closeLastPop = () => {
  blankRows.forEach((i) => (i.show = false));
  props.seatRows.forEach((i) => (i.show = false));
};
defineExpose({
  closeLastPop,
});

const seatClick = (index: number) => {
  if (props.batchMode) {
    emit("seatClick", index);
    return;
  }
  closeLastPop();
  const seat = props.seatRows[index];
  if (!seat) return;
  seat.show = true;

  emit("seatClick", index);
};

const blankClick = (index: number) => {
  if (!props.manageMode) return;

  lastBlankIndex.value = index;

  const { realIndex, row, column } = calcRowColumn(index);

  if (props.batchMode) {
    emit("blankClick", realIndex, row, column);
    return;
  }

  closeLastPop();
  const blank = blankRows[index];
  if (!blank) return;
  blank.show = true;

  emit("blankClick", realIndex, row, column);
};

const initBlankRows = () => {
  blankRows.length = 0;
  const total = props.rows * props.columns;
  for (let i = 0; i < total; i++) {
    blankRows.push({ show: false });
  }
};

const closeOnOutside = (ev: MouseEvent) => {
  const target = ev.target as HTMLElement;
  if (!target.className || !target.className.includes("seat")) {
    closeLastPop();
  }
};

/* ================= lifecycle ================= */

onMounted(() => {
  initBlankRows();
  window.addEventListener("click", closeOnOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", closeOnOutside);
});

/* ================= watch ================= */

watch(
  () => [props.rows, props.columns],
  () => initBlankRows(),
);

watch(
  () => props.seatRows,
  () => {
    lastBlankIndex.value = -1;
  },
);

watch(
  () => props.batchSelected,
  () => {},
);

/* ================= computed ================= */

const gridStyle = computed(() => ({
  gridTemplateRows: `repeat(${props.rows}, 32px)`,
  gridTemplateColumns: `repeat(${props.columns}, 32px)`,
}));
</script>

<style scoped>
/* 样式完全不动 */
.area-wrapper {
  position: relative;
  width: max-content;
  height: max-content;
}
.room {
  display: grid;
  position: relative;

  /* 单个格子尺寸（和 gridStyle 保持一致） */
  --cell-size: 32px;

  /* 网格背景 */
  background-color: #f5f5f5;
  background-image:
    linear-gradient(to right, #e0e0e0 1px, transparent 1px),
    linear-gradient(to bottom, #e0e0e0 1px, transparent 1px);
  background-size: var(--cell-size) var(--cell-size);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}
.overlay .item,
.overlay .seat {
  pointer-events: auto;
}
.seat {
  width: 100%;
  height: 100%;
  position: relative;
}
.batch-selected {
  background-color: #409eff;
  box-sizing: border-box;
}
.batch-selected-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-weight: bold;
  font-size: 16px;
  z-index: 10;
}
::v-deep .seat-component {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
