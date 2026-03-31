<template>
  <div class="statistics-container">
    <el-card class="header-section" shadow="never">
      <div class="title-group">
        <h2 class="main-title">统计分析中心</h2>
        <p class="sub-title">签到排行与预约峰值洞察，支持按时间范围筛选</p>
      </div>
      <div class="filter-group">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="x"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :clearable="false"
        />
        <el-button class="btn-search" @click="handleRefresh">刷新统计</el-button>
        <el-button class="btn-reset" @click="handleReset">重置范围</el-button>
      </div>
    </el-card>

    <div class="ranking-grid">
      <el-card class="ranking-card" shadow="never">
        <template #header>
          <div>
            <div class="card-title">签到次数排名</div>
            <div class="card-tip">按签到记录次数降序，展示活跃签到用户</div>
          </div>
        </template>
        <div v-if="signRank.length" class="ranking-list">
          <div
            v-for="(item, index) in signRank.slice(0, 8)"
            :key="`${item.number}-${index}`"
            class="ranking-item"
          >
            <span class="rank-no" :class="rankClass(index)">{{ index + 1 }}</span>
            <span class="rank-name">{{ item.username }}</span>
            <span class="rank-value">{{ item.signCount }} 次</span>
          </div>
        </div>
        <el-empty v-else description="暂无数据" :image-size="52" />
      </el-card>

      <el-card class="ranking-card" shadow="never">
        <template #header>
          <div>
            <div class="card-title">年度/月度预约峰值</div>
            <div class="card-tip">按月聚合预约量，定位年度高峰月份</div>
          </div>
        </template>
        <div v-if="monthRank.length" class="ranking-list">
          <div
            v-for="(item, index) in monthRank.slice(0, 8)"
            :key="`${item.period}-${index}`"
            class="ranking-item"
          >
            <span class="rank-no" :class="rankClass(index)">{{ index + 1 }}</span>
            <span class="rank-name">{{ item.period }}</span>
            <span class="rank-value">{{ item.total }} 单</span>
          </div>
        </div>
        <el-empty v-else description="暂无数据" :image-size="52" />
      </el-card>

      <el-card class="ranking-card" shadow="never">
        <template #header>
          <div>
            <div class="card-title">日预约峰值排名</div>
            <div class="card-tip">按自然日统计预约单量，便于排班运营</div>
          </div>
        </template>
        <div v-if="dayRank.length" class="ranking-list">
          <div
            v-for="(item, index) in dayRank.slice(0, 8)"
            :key="`${item.period}-${index}`"
            class="ranking-item"
          >
            <span class="rank-no" :class="rankClass(index)">{{ index + 1 }}</span>
            <span class="rank-name">{{ item.period }}</span>
            <span class="rank-value">{{ item.total }} 单</span>
          </div>
        </div>
        <el-empty v-else description="暂无数据" :image-size="52" />
      </el-card>

      <el-card class="ranking-card" shadow="never">
        <template #header>
          <div>
            <div class="card-title">时段预约峰值排名</div>
            <div class="card-tip">按半小时窗口统计，识别热门时段</div>
          </div>
        </template>
        <div v-if="timeSlotRank.length" class="ranking-list">
          <div
            v-for="(item, index) in timeSlotRank.slice(0, 8)"
            :key="`${item.period}-${index}`"
            class="ranking-item"
          >
            <span class="rank-no" :class="rankClass(index)">{{ index + 1 }}</span>
            <span class="rank-name">{{ item.period }}</span>
            <span class="rank-value">{{ item.total }} 单</span>
          </div>
        </div>
        <el-empty v-else description="暂无数据" :image-size="52" />
      </el-card>
    </div>

    <div class="charts-section">
      <el-row :gutter="16" class="sub-chart-row">
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <v-chart
              v-if="monthRank.length > 0"
              :option="monthChartOption"
              autoresize
              style="height: 300px"
            />
            <el-empty v-else description="暂无数据" :image-size="68" />
            <div class="chart-note">说明：柱高表示该月份预约总单量，便于识别学期高峰。</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <v-chart
              v-if="timeSlotRank.length > 0"
              :option="timeSlotRankOption"
              autoresize
              style="height: 300px"
            />
            <el-empty v-else description="暂无数据" :image-size="68" />
            <div class="chart-note">说明：折线展示时段预约热度，峰值点可用于开放时段优化。</div>
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
  DataZoomComponent,
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
  DataZoomComponent,
]);

interface SignRankItem {
  uid: number;
  number: number;
  username: string;
  signCount: number;
}

interface RankItem {
  period: string;
  total: number;
}

export default defineComponent({
  name: "Statistics",
  components: {
    "v-chart": VChart,
  },
  setup() {
    const signRank = ref<SignRankItem[]>([]);
    const monthRank = ref<RankItem[]>([]);
    const dayRank = ref<RankItem[]>([]);
    const timeSlotRank = ref<RankItem[]>([]);
    const dateRange = ref<[string, string] | []>([]);

    const rankClass = (index: number) => {
      if (index === 0) return "rank-gold";
      if (index === 1) return "rank-silver";
      if (index === 2) return "rank-bronze";
      return "rank-normal";
    };

    const rankingPayload = computed(() => {
      if (!Array.isArray(dateRange.value) || dateRange.value.length !== 2) {
        return {};
      }
      return {
        startTime: Number(dateRange.value[0]),
        endTime: Number(dateRange.value[1]),
      };
    });

    const formatRankList = (list: any[] = []): RankItem[] => {
      return list.map((item) => ({
        period: String(item.period ?? "--"),
        total: Number(item.total ?? 0),
      }));
    };

    const formatSignList = (list: any[] = []): SignRankItem[] => {
      return list.map((item) => ({
        uid: Number(item.uid ?? 0),
        number: Number(item.number ?? 0),
        username: String(item.username ?? "未知用户"),
        signCount: Number(item.signCount ?? 0),
      }));
    }

    const fetchRankingStatistics = async () => {
      try {
        const res = await request.post(
          "/admin/getStatisticsRanking",
          rankingPayload.value
        );
        signRank.value = formatSignList(res.data.signRank || []);
        monthRank.value = formatRankList(res.data.monthRank || []);
        dayRank.value = formatRankList(res.data.dayRank || []);
        timeSlotRank.value = formatRankList(res.data.timeSlotRank || []);
      } catch (err) {
        console.error("获取排名统计失败", err);
      }
    };

    const handleRefresh = async () => {
      await fetchRankingStatistics();
    };

    const handleReset = async () => {
      dateRange.value = [];
      await handleRefresh();
    };

    onMounted(() => {
      handleRefresh();
    });

    const monthChartOption = computed(() => ({
      title: { text: "月度预约峰值 Top", left: "left", textStyle: { color: "#16314a" } },
      tooltip: { trigger: "axis" },
      grid: { left: 45, right: 20, top: 50, bottom: 30 },
      xAxis: {
        type: "category",
        data: monthRank.value.map((item) => item.period),
        axisLabel: { rotate: 25 },
      },
      yAxis: { type: "value", minInterval: 1 },
      series: [
        {
          type: "bar",
          data: monthRank.value.map((item) => item.total),
          itemStyle: { color: "#d8aa4b" },
          barMaxWidth: 36,
        },
      ],
    }));

    const timeSlotRankOption = computed(() => ({
      title: { text: "时段预约峰值 Top", left: "left", textStyle: { color: "#16314a" } },
      tooltip: { trigger: "axis" },
      grid: { left: 45, right: 20, top: 50, bottom: 45 },
      xAxis: {
        type: "category",
        data: timeSlotRank.value.map((item) => item.period),
        axisLabel: { rotate: 30 },
      },
      yAxis: { type: "value", minInterval: 1 },
      series: [
        {
          type: "line",
          data: timeSlotRank.value.map((item) => item.total),
          smooth: true,
          lineStyle: { color: "#0f5e92", width: 3 },
          itemStyle: { color: "#0f5e92" },
          areaStyle: { color: "rgba(15, 94, 146, 0.12)" },
        },
      ],
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
      ],
    }));

    return {
      signRank,
      monthRank,
      dayRank,
      timeSlotRank,
      dateRange,
      rankClass,
      handleRefresh,
      handleReset,
      monthChartOption,
      timeSlotRankOption,
    };
  },
});
</script>
