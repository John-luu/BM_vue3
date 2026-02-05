<template>
  <!-- 座位类型 0：普通座位 -->
  <div
    v-if="item.type === 0"
    class="seat seatNumber"
    :data-attr="item.row + '' + item.column"
  >
    <svg
      style="pointer-events: none; transform: scale(0.8); margin-top: 4px"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      :fill="getColor(item.state)"
    >
      <path
        d="M695.843721 187.320558c32.506047 0 54.343442 8.096744 65.488372 24.290233 11.192558 16.193488 16.765023 41.245767 16.765023 75.156837v231.30493c0 28.529116-6.096372 51.676279-18.265302 69.393861-12.192744 17.741395-35.197023 26.600186-69.060465 26.600186H383.166512c-32.482233 0-55.17693-8.477767-68.036465-25.433303-12.859535-16.955535-19.289302-43.960558-19.289303-80.967442v-220.898232c0-32.386977 6.096372-57.034419 18.289116-74.013768 12.16893-16.955535 34.863628-25.433302 68.012652-25.433302h313.725023z m127.952372 491.75814V355.947163c0-17.884279 5.23907-30.815256 15.717209-38.769116 10.501953-7.95386 23.528186-11.906977 39.102512-11.906977h46.699163c19.622698 0 32.64893 5.953488 39.078697 17.860465 6.429767 11.954605 9.644651 24.218791 9.644652 36.792558V789.432558c0 39.769302-19.622698 59.653953-58.868093 59.653954h-35.530419v87.492465h-64.988279v-87.492465H260.310326v87.492465H196.346047v-87.492465H155.743256c-35.863814 0-54.486326-20.551442-55.843721-61.630512V354.970791c0-16.574512 5.072372-29.005395 15.24093-37.292651 10.144744-8.287256 23.004279-12.430884 38.578605-12.430884h39.57879c19.646512 0 34.03014 5.143814 43.150884 15.407628 9.144558 10.287628 14.050233 23.694884 14.717023 40.269395v21.885023c0 10.597209-0.166698 23.694884-0.476279 39.26921a2370.67907 2370.67907 0 0 0-0.523907 51.2v205.800186h573.630512z"
      />
    </svg>
  </div>

  <!-- 座位类型 1：桌子 -->
  <div
    v-else-if="item.type === 1"
    class="seat seatNumber"
    :data-attr="item.row + '' + item.column"
  >
    <svg
      style="pointer-events: none; transform: scale(0.8); margin-top: 4px"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      fill="#8c8c8c"
    >
      <!-- 桌子SVG图标（这里是一个简单矩形的示例） -->
      <path d="M128 256h768v512H128z m64 64v384h640V320z" />
    </svg>
  </div>
</template>

<script setup lang="ts">
interface SeatItem {
  type?: number; // 0=座位, 1=桌子
  row: number;
  column: number;
  state?: number; // 0=可用,1=不可用,2=占用
  [key: string]: any;
}

const props = defineProps<{
  item: SeatItem;
  color?: string;
}>();

function getColor(state?: number): string {
  if (state === 0)
    return "#31af0a"; // 可用
  else if (state === 1)
    return "#808080"; // 不可用
  else return "#d05c43"; // 占用
}
</script>

<style scoped>
.seatNumber {
  position: relative;
}

.seatNumber:before {
  transform: scale(0.5);
  text-align: center;
  top: -4px;
  white-space: nowrap;
  position: absolute;
  width: 100%;
  color: #757575;
  content: attr(data-attr);
}

.table {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>
