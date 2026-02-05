<template>
  <div class="area-select-container">
    <!-- 区域选择器 -->
    <el-select
      v-if="areaRows?.length"
      v-model="selectedAreaId"
      placeholder="请选择区域"
      class="area-select"
      @change="handleAreaChange"
      :teleported="false"
      popper-class="area-select-popper"
      size="large"
    >
      <!-- 下拉框内容区域，包含可滚动的选项列表和固定的底部操作栏 -->
      <div class="dropdown-content-wrapper">
        <!-- 可滚动的区域列表 -->
        <div class="scrollable-options">
          <el-option
            v-for="item in areaRows"
            :key="item.aid"
            :label="item.areaName"
            :value="item.aid"
            class="area-option"
          >
            <div class="option-content">
              <span class="area-name">{{ item.areaName }}</span>
              <span class="area-subname">({{ item.subName }})</span>
              <span class="area-dimensions"
                >{{ item.rows }}×{{ item.columns }}</span
              >
            </div>
          </el-option>
        </div>

        <!-- 固定的底部操作栏 -->
        <template v-if="canAdd">
          <div class="dropdown-divider"></div>
          <div class="dropdown-actions fixed-bottom">
            <el-button
              type="primary"
              link
              class="action-btn"
              @click.stop="handleAddArea"
            >
              <el-icon><Plus /></el-icon>
              <span>新增区域</span>
            </el-button>
            <el-button
              v-if="selectedAreaId"
              type="danger"
              link
              class="action-btn"
              :disabled="!selectedAreaId"
              @click.stop="handleDeleteArea"
            >
              <el-icon><Delete /></el-icon>
              <span>删除当前区域</span>
            </el-button>
          </div>
        </template>
      </div>
    </el-select>

    <!-- 空状态提示 -->
    <div v-else class="empty-state">
      <el-empty description="暂无区域配置">
        <el-button v-if="canAdd" type="primary" @click="handleAddArea">
          <el-icon><Plus /></el-icon>
          创建首个区域
        </el-button>
      </el-empty>
    </div>

    <!-- 添加区域弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="创建新区域"
      width="500px"
      class="area-dialog"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
        label-position="right"
        status-icon
      >
        <el-form-item label="区域名称" prop="areaName">
          <el-input
            v-model="form.areaName"
            placeholder="请输入区域名称"
            clearable
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="区域缩写" prop="subName">
          <el-input
            v-model="form.subName"
            placeholder="请输入区域缩写"
            clearable
            maxlength="10"
            show-word-limit
          />
          <div class="form-tip">用于座位标识前缀，建议使用2-4个字母</div>
        </el-form-item>

        <el-form-item label="表格尺寸" required>
          <div class="dimension-inputs">
            <el-form-item prop="rows" style="margin-bottom: 0">
              <el-input-number
                v-model="form.rows"
                :min="1"
                :max="50"
                placeholder="行数"
                controls-position="right"
                class="dimension-input"
              />
            </el-form-item>
            <span class="dimension-separator">×</span>
            <el-form-item prop="columns" style="margin-bottom: 0">
              <el-input-number
                v-model="form.columns"
                :min="1"
                :max="50"
                placeholder="列数"
                controls-position="right"
                class="dimension-input"
              />
            </el-form-item>
          </div>
          <div class="form-tip">最大支持 50×50 的座位布局</div>
        </el-form-item>

        <el-form-item label="座位预览">
          <div class="seat-preview">
            <div class="preview-grid" :style="previewGridStyle">
              <div
                v-for="i in previewSeats"
                :key="i"
                class="preview-seat"
              ></div>
            </div>
            <div class="preview-info">共 {{ previewSeats }} 个座位</div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="creating"
            @click="handleCreateArea"
          >
            {{ creating ? "创建中..." : "确认创建" }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { Plus, Delete } from "@element-plus/icons-vue";
import request from "@/req";

// -------------------- 类型定义 --------------------
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

// -------------------- Props & Emits --------------------
const props = withDefaults(defineProps<Props>(), {
  areaRows: () => [],
  canAdd: false,
});

const emit = defineEmits<{
  (e: "changeArea", area: AreaItem): void;
  (e: "areaCreated", area: AreaItem): void;
  (e: "areaDeleted"): void;
}>();

// -------------------- 响应式状态 --------------------
const selectedAreaId = ref<number | null>(null);
const dialogVisible = ref(false);
const creating = ref(false);
const formRef = ref<FormInstance>();

const form = reactive({
  areaName: "",
  subName: "",
  rows: 5,
  columns: 5,
});

// -------------------- 表单验证规则 --------------------
const formRules: FormRules = {
  areaName: [
    { required: true, message: "请输入区域名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  subName: [
    { required: true, message: "请输入区域缩写", trigger: "blur" },
    {
      pattern: /^[A-Za-z]{2,10}$/,
      message: "只能包含字母，长度2-10位",
      trigger: "blur",
    },
  ],
  rows: [
    { required: true, message: "请输入行数", trigger: "blur" },
    {
      type: "number",
      min: 1,
      max: 50,
      message: "行数必须在 1-50 之间",
      trigger: "blur",
    },
  ],
  columns: [
    { required: true, message: "请输入列数", trigger: "blur" },
    {
      type: "number",
      min: 1,
      max: 50,
      message: "列数必须在 1-50 之间",
      trigger: "blur",
    },
  ],
};

// -------------------- 计算属性 --------------------
const previewSeats = computed(() => form.rows * form.columns);

const previewGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${Math.min(form.columns, 10)}, 1fr)`,
  gridTemplateRows: `repeat(${Math.min(form.rows, 10)}, 1fr)`,
}));

// -------------------- 方法 --------------------
const handleAreaChange = (areaId: number) => {
  const area = props.areaRows?.find((item) => item.aid === areaId);
  if (area) {
    selectedAreaId.value = areaId;
    emit("changeArea", area);
  }
};

const handleAddArea = () => {
  dialogVisible.value = true;
};

const handleCreateArea = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    creating.value = true;

    const res = await request.post("/admin/addArea", {
      areaName: form.areaName,
      subName: form.subName,
      rows: form.rows,
      columns: form.columns,
    });

    const newArea = res.data as AreaItem;
    dialogVisible.value = false;
    creating.value = false;

    // 重置表单
    formRef.value.resetFields();
    form.rows = 5;
    form.columns = 5;

    // 发射事件
    emit("areaCreated", newArea);
    emit("changeArea", newArea);

    ElMessage.success("区域创建成功");
  } catch (error: any) {
    creating.value = false;
    if (error.name !== "ValidateError") {
      ElMessage.error(error.response?.data?.message || "区域创建失败");
    }
  }
};

const handleDeleteArea = async () => {
  const area = props.areaRows?.find(
    (item) => item.aid === selectedAreaId.value,
  );
  if (!area) return;

  try {
    await ElMessageBox.confirm(
      `确定要删除区域 "${area.areaName}" 吗？\n\n这将删除该区域下的所有座位数据，此操作不可恢复！`,
      "删除确认",
      {
        type: "warning",
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
        confirmButtonClass: "el-button--danger",
        customClass: "delete-confirm-dialog",
      },
    );

    await request.post("/public/deleteAreaWithSeats", { aid: area.aid });

    emit("areaDeleted");
    selectedAreaId.value = props.areaRows?.[0]?.aid || null;

    ElMessage.success("区域删除成功");
  } catch (error) {
    // 用户取消删除
  }
};

// -------------------- 监听 --------------------
watch(
  () => props.areaRows,
  (newRows) => {
    if (newRows && newRows.length > 0) {
      selectedAreaId.value = newRows[0]!.aid;
      const area = newRows[0];
      if (area) emit("changeArea", area);
    } else {
      selectedAreaId.value = null;
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.area-select-container {
  .area-select {
    width: 300px;
    min-width: 280px;

    :deep(.el-input__wrapper) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

      .el-input__inner {
        color: white;
        font-weight: 500;

        &::placeholder {
          color: rgba(255, 255, 255, 0.8);
        }
      }

      .el-select__caret {
        color: white;
      }
    }
  }

  .empty-state {
    width: 300px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    :deep(.el-empty__description) {
      margin-top: 10px;
      color: #909399;
    }
  }

  .area-option {
    .option-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      min-width: 250px;
      padding: 4px 0;

      .area-name {
        font-weight: 500;
        color: #303133;
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .area-subname {
        color: #909399;
        font-size: 12px;
        margin: 0 8px;
        flex-shrink: 0;
      }

      .area-dimensions {
        color: #409eff;
        font-size: 12px;
        padding: 2px 6px;
        background: rgba(64, 158, 255, 0.1);
        border-radius: 3px;
        flex-shrink: 0;
      }
    }
  }

  .dimension-inputs {
    display: flex;
    align-items: center;
    gap: 12px;

    .dimension-input {
      width: 120px;

      :deep(.el-input-number__increase),
      :deep(.el-input-number__decrease) {
        background: #f5f7fa;
      }
    }

    .dimension-separator {
      color: #c0c4cc;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .seat-preview {
    .preview-grid {
      display: grid;
      gap: 4px;
      margin: 10px 0;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 6px;
      max-height: 200px;
      overflow: auto;

      .preview-seat {
        aspect-ratio: 1;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 4px;
        opacity: 0.6;
        transition: all 0.3s;

        &:hover {
          opacity: 1;
          transform: scale(1.1);
        }
      }
    }

    .preview-info {
      text-align: center;
      color: #909399;
      font-size: 12px;
      margin-top: 8px;
    }
  }

  .form-tip {
    color: #909399;
    font-size: 12px;
    line-height: 1.5;
    margin-top: 4px;
  }

  .dropdown-divider {
    height: 1px;
    background: #ebeef5;
    margin: 8px 0;
  }

  .dropdown-actions {
    padding: 8px 12px;

    &.fixed-bottom {
      position: sticky;
      bottom: 0;
      background: white;
      border-top: 1px solid #ebeef5;
      z-index: 10;
    }

    .action-btn {
      width: 100%;
      justify-content: flex-start;
      padding: 8px 0;
      margin: 0;
      font-size: 14px;

      &:hover {
        background: #f5f7fa;
      }

      span {
        margin-left: 6px;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>

<style lang="scss">
.area-select-popper {
  width: 320px !important;
  max-width: 320px !important;
  min-width: 300px !important;

  .el-select-dropdown {
    width: 100% !important;
    max-width: 320px !important;
    min-width: 300px !important;
    padding: 0 !important;
  }

  .el-select-dropdown__list {
    padding: 0 !important;
    margin: 0 !important;
  }

  .el-select-dropdown__item {
    padding: 10px 16px !important;
    margin: 0 !important;
    height: auto !important;
    min-height: 44px !important;
    line-height: normal !important;

    &.selected {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

      .area-name {
        color: white !important;
      }

      .area-subname {
        color: rgba(255, 255, 255, 0.8) !important;
      }

      .area-dimensions {
        color: white !important;
        background: rgba(255, 255, 255, 0.2) !important;
      }
    }
  }

  // 移除 Element 默认的滚动包装器
  .el-select-dropdown__wrap {
    max-height: none !important;
    overflow: visible !important;
  }

  .dropdown-content-wrapper {
    max-height: 320px;
    display: flex;
    flex-direction: column;
  }

  .scrollable-options {
    flex: 1;
    overflow-y: auto;
    max-height: 280px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;

      &:hover {
        background: #a8a8a8;
      }
    }
  }
}

.delete-confirm-dialog {
  .el-message-box__content {
    padding: 20px;

    .el-message-box__message {
      line-height: 1.6;
      color: #606266;

      p {
        margin: 10px 0;
      }
    }
  }

  .el-message-box__btns {
    padding: 10px 20px 20px;
  }
}

.area-dialog {
  .el-dialog {
    border-radius: 12px;
    overflow: hidden;

    .el-dialog__header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 20px;

      .el-dialog__title {
        color: white;
        font-weight: 600;
      }

      .el-dialog__headerbtn {
        .el-dialog__close {
          color: white;

          &:hover {
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
    }

    .el-dialog__body {
      padding: 30px 25px;
    }

    .el-dialog__footer {
      padding: 20px 25px;
      border-top: 1px solid #ebeef5;
    }
  }
}
</style>
