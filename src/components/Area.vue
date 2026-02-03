<template>
  <div class="area-wrapper">
    <!-- 底层空白网格 -->
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
          v-model:show="item.show"
          :offset="0"
          placement="top"
          theme="dark"
        >
          <slot name="blankMenu"></slot>
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

    <!-- 顶层座位 -->
    <div class="room overlay" :style="gridStyle">
      <div
        v-for="(item, index) in seatRows"
        :key="index"
        class="item"
        :style="{ gridRow: item.row, gridColumn: item.column }"
        @click="seatClick(index)"
      >
        <Seat v-if="!item.show" :item="item" />
        <el-popover
          v-else
          v-model:show="item.show"
          :offset="0"
          placement="top"
          theme="dark"
        >
          <slot name="seatMenu"></slot>
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
  ref,
  reactive,
  watch,
  computed,
  onMounted,
  onBeforeUnmount,
} from "vue";
import Seat from "@/components/Seat.vue";
import { Popover } from "vant";
// -------------------- Props & Emits --------------------
interface SeatItem {
  type: number;
  row: number;
  column: number;
  show?: boolean;
  [key: string]: any;
}

interface BlankItem {
  show: boolean;
}

interface Props {
  manageMode?: boolean;
  batchMode?: boolean;
  seatRows?: SeatItem[];
  rows: number;
  columns: number;
  batchSelected?: { row: number; column: number }[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "seatClick", index: number): void;
  (e: "blankClick", index: number, row: number, column: number): void;
}>();

// -------------------- Reactive State --------------------
const blankRows = ref<BlankItem[]>([]);
const lastBlankIndex = ref(-1);

// -------------------- Computed --------------------
const gridStyle = computed(() => ({
  gridTemplateRows: `repeat(${props.rows}, 32px)`,
  gridTemplateColumns: `repeat(${props.columns}, 32px)`,
}));

const seatRows = computed(() => props.seatRows ?? []);
const batchSelected = computed(() => props.batchSelected ?? []);

// -------------------- Methods --------------------
function initBlankRows() {
  blankRows.value = Array.from({ length: props.rows * props.columns }, () => ({
    show: false,
  }));
}

function closeLastPop() {
  blankRows.value.forEach((b) => (b.show = false));
  seatRows.value.forEach((s) => (s.show = false));
}

function isSelectedInBatch(index: number): boolean {
  if (!props.batchMode || !batchSelected.value.length) return false;

  const realIndex = index + 1;
  let row: number, column: number;

  if (realIndex % props.columns === 0) {
    row = Math.trunc(realIndex / props.columns);
    column = props.columns;
  } else {
    row = Math.trunc(realIndex / props.columns) + 1;
    column = realIndex % props.columns;
  }

  return batchSelected.value.some(
    (item) => item.row === row && item.column === column,
  );
}

function getBatchSeatClass(index: number) {
  if (!props.batchMode) return "";
  return isSelectedInBatch(index) ? "batch-selected" : "";
}

function seatClick(index: number) {
  if (props.batchMode) {
    emit("seatClick", index);
    return;
  }
  closeLastPop();
  if (seatRows.value[index]) seatRows.value[index].show = true;
  emit("seatClick", index);
}

function blankClick(index: number) {
  if (!props.manageMode) return;
  lastBlankIndex.value = index;

  const realIndex = index + 1;
  let row: number, column: number;

  if (realIndex % props.columns === 0) {
    row = Math.trunc(realIndex / props.columns);
    column = props.columns;
  } else {
    row = Math.trunc(realIndex / props.columns) + 1;
    column = realIndex % props.columns;
  }

  if (props.batchMode) {
    emit("blankClick", realIndex, row, column);
    return;
  }

  closeLastPop();
  if (seatRows.value[index]) seatRows.value[index].show = true;
  emit("blankClick", realIndex, row, column);
}

function closeOnOutside(ev: MouseEvent) {
  const target = ev.target as HTMLElement;
  if (!target.classList.contains("seat")) {
    closeLastPop();
  }
}

// -------------------- Lifecycle --------------------
onMounted(() => {
  initBlankRows();
  window.addEventListener("click", closeOnOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", closeOnOutside);
});

// -------------------- Watch --------------------
watch([() => props.rows, () => props.columns], () => {
  initBlankRows();
});

watch(
  () => props.seatRows,
  () => {
    lastBlankIndex.value = -1;
  },
);

watch(
  () => props.batchSelected,
  () => {
    // 强制更新
  },
);
</script>

<style scoped>
.area-wrapper {
  position: relative;
  width: max-content;
  height: max-content;
}

.room {
  display: grid;
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
  background-color: #f0f0f0;
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
  color: white;
  font-weight: bold;
  font-size: 16px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

::v-deep .seat-component {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
