<template>
  <div class="root">
    <el-card class="seat-card">
      <!-- header -->
      <template #header>
        <div class="clearfix">
          <ToggleArea
            v-if="areaRows.length"
            :area-rows="areaRows"
            @changeArea="onAreaChange"
            @areaCreated="refreshAreaList"
          />
          
        </div>
      </template>

      <!-- area -->
      <Area
        v-if="currentArea"
        ref="room"
        class="area-container"
        :seat-rows="seatRows"
        :rows="currentArea.rows"
        :columns="currentArea.columns"
        seat-menu-popper-class="seat-qr-popper"
        @seatClick="seatClick"
      >
        <template #seatMenu>
          <div class="blankMenu">
            <div class="qr-title">座位固定二维码</div>
            <div class="qr-meta">{{ qrLabel }}</div>
            <img v-if="qrDataUrl" class="qr-image" :src="qrDataUrl" alt="seat-qrcode" />
            <div v-else class="qr-loading">二维码生成中...</div>
            <div class="qr-payload">{{ qrPayload }}</div>
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
import { ElMessage } from "element-plus";
import QRCode from "qrcode";
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
  show: boolean;
  row: number;
  column: number;
}

/* -------------------- state -------------------- */
const areaRows = ref<AreaItem[]>([]);
const seatRows = ref<SeatItem[]>([]);
const currentArea = ref<AreaItem | null>(null);
const qrLabel = ref("-");
const qrPayload = ref("");
const qrDataUrl = ref("");

/* -------------------- methods -------------------- */
async function seatClick(index: number) {
  const seat = seatRows.value[index];
  if (!seat) return;
  if (!currentArea.value) return;

  // 仅座位展示二维码，桌子不展示
  if (seat.type !== 0) {
    seat.show = false;
    ElMessage.warning("该位置是桌子，不提供二维码");
    return;
  }

  const areaText = [currentArea.value.areaName, currentArea.value.subName]
    .filter(Boolean)
    .join(" ");
  const payload = `SEAT_QR|aid=${currentArea.value.aid}|area=${areaText}|row=${seat.row}|column=${seat.column}|sid=${seat.sid}`;

  qrLabel.value = `${areaText} ${seat.row}排${seat.column}列`;
  qrPayload.value = payload;
  qrDataUrl.value = "";

  try {
    qrDataUrl.value = await QRCode.toDataURL(payload, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: "M",
    });
  } catch (e) {
    seat.show = false;
    ElMessage.error("二维码生成失败");
  }
}

function onAreaChange(area: AreaItem) {
  currentArea.value = area;
  qrLabel.value = "-";
  qrPayload.value = "";
  qrDataUrl.value = "";
  console.log("area===", area);
  request.post("/public/getAreaSeats", { area: area.aid }).then((res: any) => {
    const rows = (res.data.rows ?? []) as Array<Partial<SeatItem>>;
    seatRows.value = rows.map((item) => ({
      sid: Number(item.sid || 0),
      type: Number(item.type || 0),
      state: Number(item.state || 0),
      row: Number(item.row || 0),
      column: Number(item.column || 0),
      show: Boolean(item.show),
    }));
  });
}

function refreshAreaList() {
  request.get("/public/getArea").then((res: any) => {
    areaRows.value = res.data.rows ?? [];
  });
}

/* -------------------- lifecycle -------------------- */
onMounted(() => {
  refreshAreaList();
  console.log("111");
});
</script>
