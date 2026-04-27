<template>
  <div class="announce-page">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="title">📢 公告管理</div>
      <el-button type="primary" class="btn-create" icon="el-icon-plus" @click="openDialog">
        新增公告
      </el-button>
    </div>

    <!-- 内容卡片 -->
    <el-card class="content-card" shadow="never">
      <el-table
        :data="rows"
        stripe
        style="width: 100%"
        row-class-name="table-row"
      >
        <el-table-column label="标题" width="200">
          <template #default="{ row }">
            <div class="title-cell">{{ row.title }}</div>
          </template>
        </el-table-column>

        <el-table-column label="内容">
          <template #default="{ row }">
            <div class="content-cell">{{ row.content }}</div>
          </template>
        </el-table-column>

        <el-table-column label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.datetime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row, index }">
            <el-button
              type="primary"
              class="btn-view"
              size="small"
              plain
              @click="openDetailDialog(row)"
            >
              查看
            </el-button>
            <el-button
              type="danger"
              class="btn-delete"
              size="small"
              plain
              @click="handleDelete(index, row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增公告弹窗 -->
    <el-dialog
      title="新增公告"
      v-model="dialogVisible"
      width="480px"
      align-center
      :append-to-body="true"
      @close="resetForm"
    >
      <el-form :model="form" label-width="60px">
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>

        <el-form-item label="内容">
          <el-input type="textarea" :rows="5" v-model="form.content" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button class="btn-cancel" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="btn-confirm" @click="submitAnnounce">发布</el-button>
      </template>
    </el-dialog>

    <el-dialog
      title="公告详情"
      v-model="detailDialogVisible"
      width="560px"
      align-center
      :append-to-body="true"
    >
      <div class="detail-body">
        <div class="detail-item">
          <div class="detail-label">标题</div>
          <div class="detail-title">{{ currentAnnounce.title || '-' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">发布时间</div>
          <div class="detail-time">{{ currentAnnounce.datetime ? formatTime(currentAnnounce.datetime) : '-' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">内容</div>
          <div class="detail-content">{{ currentAnnounce.content || '-' }}</div>
        </div>
      </div>
      <template #footer>
        <el-button class="btn-cancel" @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import request from "@/req";
import "./style.scss";
import { ElMessage, ElMessageBox } from "element-plus";
interface AnnounceRow {
  id: number;
  title: string;
  content: string;
  datetime: number;
}

interface AnnounceForm {
  title: string;
  content: string;
}

export default defineComponent({
  name: "AnnounceManagement",
  setup() {
    const rows = ref<AnnounceRow[]>([]);
    const dialogVisible = ref(false);
    const detailDialogVisible = ref(false);
    const form = ref<AnnounceForm>({
      title: "",
      content: "",
    });
    const currentAnnounce = ref<AnnounceRow>({
      id: 0,
      title: "",
      content: "",
      datetime: 0,
    });

    // 打开弹窗
    const openDialog = () => {
      dialogVisible.value = true;
      console.log("dialogVisible.value===", dialogVisible.value);
    };
    // 重置表单
    const resetForm = () => {
      form.value = {
        title: "",
        content: "",
      };
    };
    const loadData = () => {
      request.get("/admin/getAnnounce").then((res: any) => {
        rows.value = res.data.rows;
      });
    };

    const openDetailDialog = (row: AnnounceRow) => {
      currentAnnounce.value = { ...row };
      detailDialogVisible.value = true;
    };

    const handleDelete = (index: number, row: AnnounceRow) => {
      ElMessageBox.confirm("确认删除该公告吗？", "提示", {
        type: "warning",
      })
        .then(() => {
          request.post("/admin/deleteAnnounce", { id: row.id }).then(() => {
            rows.value.splice(index, 1);
            ElMessage.success("删除成功");
            loadData();
          });
        })
        .catch(() => {});
    };

    const submitAnnounce = async () => {
      // 验证表单
      if (!form.value.title.trim()) {
        ElMessage.warning("请输入标题");
        return;
      }
      if (!form.value.content.trim()) {
        ElMessage.warning("请输入内容");
        return;
      }
      try {
        await request.post("/admin/addAnnounce", {
          title: form.value.title.trim(),
          content: form.value.content.trim(),
        });

        ElMessage.success("发布成功");
        dialogVisible.value = false;
        resetForm(); // 重置表单
        loadData(); // 重新加载列表
      } catch (error) {
        console.error("发布失败:", error);
        ElMessage.error("发布失败");
      }
    };

    const formatTime = (datetime: string) => {
      const d = new Date(datetime);
      return `${d.getFullYear()}-${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")} ${d
        .getHours()
        .toString()
        .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    };

    onMounted(() => {
      loadData();
    });

    return {
      rows,
      resetForm,
      openDialog,
      dialogVisible,
      detailDialogVisible,
      form,
      currentAnnounce,
      loadData,
      openDetailDialog,
      handleDelete,
      submitAnnounce,
      formatTime,
    };
  },
});
</script>
