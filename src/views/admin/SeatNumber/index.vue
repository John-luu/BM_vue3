<template>
  <div class="root">
    <el-card style="margin-top: 10%; position: relative">
      <!-- header -->
      <template #header>
        <div class="clearfix">
          <ToggleArea
            v-if="areaRows.length"
            :area-rows="areaRows"
            @changeArea="onAreaChange"
            @areaCreated="refreshAreaList"
          />
          <HeadTip />
        </div>
      </template>

      <!-- area -->
      <Area
        v-if="currentArea"
        class="area-container"
        :seat-rows="seatRows"
        :rows="currentArea.rows"
        :columns="currentArea.columns"
        @seatClick="seatClick"
      >
        <template #seatMenu>
          <div class="blankMenu">
            <div>签到码：{{ number }}</div>
          </div>
        </template>
      </Area>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Area from "@/components/Area.vue";
import ToggleArea from "@/components/ToggleArea.vue";
import HeadTip from "@/components/HeadTip.vue";
import request from "@/req";
import "./style.scss";
/* -------------------- types -------------------- */
interface AreaItem {
  aid: number;
  areaName: string;
  subName: string;
  rows: number;
  columns: number;
}

interface SeatItem {
  sid: number;
  type: number;
  state: number;
  show?: boolean;
  row: number;
  column: number;
}

/* -------------------- state -------------------- */
const areaRows = ref<AreaItem[]>([]);
const seatRows = ref<SeatItem[]>([]);
const currentArea = ref<AreaItem | null>(null);
const number = ref("000000");

/* -------------------- methods -------------------- */
function seatClick(index: number) {
  const seat = seatRows.value[index];
  if (!seat) return;

  // 正在使用的座位无法操作
  if (seat.state !== 0) {
    seat.show = false;
    return;
  }

  request
    .post("/public/getSignedNumber", { sid: seat.sid })
    .then((res: any) => {
      number.value = res.data.number;
    });
}

function onAreaChange(area: AreaItem) {
  currentArea.value = area;

  request.post("/public/getAreaSeats", { area: area.aid }).then((res: any) => {
    seatRows.value = res.data.rows ?? [];
  });
}

function refreshAreaList() {
  request.get("/public/getArea").then((res: any) => {
    areaRows.value = res.rows ?? [];
  });
}

/* -------------------- lifecycle -------------------- */
onMounted(() => {
  refreshAreaList();
});
</script>
