<template>
  <div>
    <el-select
      v-if="areaRows?.length"
      size="small"
      v-model="areaName"
      @change="changeArea"
      popper-class="area-select-popper"
    >
      <!-- 区域列表（滚动） -->
      <template #default>
        <div class="area-scroll">
          <el-option
            v-for="item in areaRows"
            :key="item.aid"
            :label="item.areaName"
            :value="item.aid"
          />
        </div>

        <!-- 底部管理区（不参与选择） -->
        <div class="area-manage">
          <div v-if="canAdd" class="manage-item add" @click.stop="openAddArea">
            ➕ 增加区域
          </div>

          <div
            v-if="canAdd && areaRows.length > 0"
            class="manage-item delete"
            @click.stop="confirmDeleteArea"
          >
            🗑 删除当前区域
          </div>
        </div>
      </template>
    </el-select>

    <!-- 弹窗：添加区域 -->
    <el-dialog v-model:visible="dialogVisible" title="添加区域">
      <el-form :model="form" ref="formRef" label-width="80px">
        <el-form-item label="区域名称">
          <el-input v-model="form.areaName" placeholder="请输入区域名称" />
        </el-form-item>
        <el-form-item label="区域缩写">
          <el-input v-model="form.subName" placeholder="请输入区域缩写" />
        </el-form-item>
        <el-form-item label="表格尺寸">
          <el-input-number
            v-model="form.rows"
            :min="1"
            label="行数"
            style="width: 140px; font-size: 16px"
            controls-position="right"
            :step="1"
          />
          <el-input-number
            v-model="form.columns"
            :min="1"
            label="列数"
            style="width: 140px; font-size: 16px; margin-left: 10px"
            controls-position="right"
            :step="1"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createArea">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import request from "@/req";
import type { Ref } from "vue";

// -------------------- Props --------------------
interface AreaItem {
  aid: number;
  areaName: string;
  subName: string;
  rows: number;
  columns: number;
  [key: string]: any;
}

interface Props {
  areaRows?: AreaItem[];
  canAdd?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  areaRows: () => [], // 默认空数组
  canAdd: false,
});
const emit = defineEmits<{
  (e: "changeArea", area: AreaItem): void;
  (e: "areaCreated", area: AreaItem): void;
  (e: "areaDeleted"): void;
}>();

// -------------------- Reactive State --------------------
const areaName = ref<string | number | null>(null);
const curIndex = ref(0);
const dialogVisible = ref(false);
const formRef = ref();

const form = reactive({
  areaName: "",
  subName: "",
  rows: 1,
  columns: 1,
});

// -------------------- Methods --------------------
function getArea(): AreaItem | undefined {
  return props.areaRows?.[curIndex.value];
}

function changeArea(value: string | number) {
  if (value === "addArea") {
    dialogVisible.value = true;
  } else {
    curIndex.value =
      props.areaRows?.findIndex((item) => item.aid === value) ?? 0;
    const area = getArea();
    if (area) emit("changeArea", area);
  }
}

function openAddArea() {
  dialogVisible.value = true;
}

async function createArea() {
  try {
    const res = await request.post("/admin/addArea", {
      areaName: form.areaName,
      subName: form.subName,
      rows: form.rows,
      columns: form.columns,
    });
    const newArea = res.data as AreaItem;

    dialogVisible.value = false;
    emit("changeArea", newArea);
    emit("areaCreated", newArea);

    // 重置表单
    form.areaName = "";
    form.subName = "";
    form.rows = 1;
    form.columns = 1;
  } catch (err) {
    console.error(err);
    // Element Plus 提示
    (window as any).$message?.error("区域创建失败");
  }
}

async function confirmDeleteArea() {
  const cur = getArea();
  if (!cur) return;

  try {
    await (window as any).$confirm(
      `确定删除区域【${cur.areaName}】吗？\n该区域下所有座位将被一并删除！`,
      "危险操作",
      {
        type: "warning",
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
      },
    );
    await request.post("/public/deleteAreaWithSeats", { aid: cur.aid });
    emit("areaDeleted");
    (window as any).$message?.success("区域删除成功");
  } catch (err) {
    // 取消或出错
  }
}

// -------------------- Watch --------------------
watch(
  () => props.areaRows,
  (val) => {
    if (val && val.length > 0) {
      areaName.value = val[0]!.aid;
      curIndex.value = 0;
      const area = getArea();
      if (area) emit("changeArea", area);
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.area-select-popper .el-select-dropdown {
  width: 180px;
}
.area-select-popper .el-select-dropdown__wrap {
  max-height: none !important;
  overflow: visible !important;
}
.area-select-popper .area-scroll {
  max-height: 200px;
  overflow-y: auto;
}
.area-select-popper .area-manage {
  position: sticky;
  bottom: 0;
  background: #fff;
  border-top: 1px solid #ebeef5;
  z-index: 1;
}
.area-select-popper .manage-item {
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.area-select-popper .manage-item.add {
  color: #409eff;
}
.area-select-popper .manage-item.delete {
  color: #f56c6c;
}
.area-select-popper .manage-item:hover {
  background: #f5f7fa;
}
</style>
