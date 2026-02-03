<template>
  <div class="statistics-container">
    <!-- 头部 -->
    <el-card class="header-section">
      <div class="title-group">
        <h2 class="main-title">系统统计分析</h2>
        <p class="sub-title">实时数据监控与统计概览</p>
      </div>
    </el-card>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card class="chart-card">
            <v-chart
              v-if="userList.length > 0"
              :option="userChartOption"
              autoresize
              style="height: 300px"
            />
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card">
            <v-chart
              v-if="timeList.length > 0"
              :option="timeChartOption"
              autoresize
              style="height: 300px"
            />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import request from "@/req";
import { use } from "echarts/core";
import VChart from "vue-echarts";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from "echarts/components";
import "./style.scss";
// 注册 ECharts 组件
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
]);

interface UserCounter {
  number: number;
  username: string;
  counter: number;
}

interface TimeData {
  time: string;
  sum: number;
}

export default defineComponent({
  name: "Statistics",
  components: {
    "v-chart": VChart,
  },
  setup() {
    const userList = ref<UserCounter[]>([]);
    const timeList = ref<TimeData[]>([]);
    const currentTime = ref(formatTime(new Date()));

    // 格式化时间
    function formatTime(date: Date): string {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    }

    // 获取统计数据
    const fetchStatistics = async () => {
      try {
        const res = await request.get("/admin/getStatistics");
        userList.value = res.data.userCounter || [];
        timeList.value = res.data.timeList || [];
      } catch (err) {
        console.error("获取统计数据失败", err);
      }
    };

    // 每秒更新时间
    onMounted(() => {
      fetchStatistics();
      setInterval(() => {
        currentTime.value = formatTime(new Date());
      }, 1000);
    });

    // 用户统计图表
    const userChartOption = computed(() => ({
      title: { text: "用户统计", left: "center" },
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: userList.value.map((u) => u.username) },
      yAxis: { type: "value" },
      series: [
        {
          type: "bar",
          data: userList.value.map((u) => u.counter),
          itemStyle: { color: "#409eff" },
        },
      ],
    }));

    // 时间统计图表
    const timeChartOption = computed(() => ({
      title: { text: "时间统计", left: "center" },
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: timeList.value.map((t) => t.time) },
      yAxis: { type: "value" },
      series: [
        {
          type: "line",
          data: timeList.value.map((t) => t.sum),
          smooth: true,
          lineStyle: { color: "#67c23a" },
          itemStyle: { color: "#67c23a" },
        },
      ],
    }));

    return {
      userList,
      timeList,
      currentTime,
      userChartOption,
      timeChartOption,
    };
  },
});
</script>
