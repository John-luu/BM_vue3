<template>
  <div class="announce-page">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="title">📢 公告管理</div>
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="dialogVisible = true"
      >
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

        <el-table-column label="操作" width="120">
          <template #default="{ row, index }">
            <el-button
              type="danger"
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
    <el-dialog title="新增公告" v-model:visible="dialogVisible" width="480px">
      <el-form :model="form" label-width="60px">
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>

        <el-form-item label="内容">
          <el-input type="textarea" :rows="5" v-model="form.content" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAnnounce">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import request from "@/req";
import "./style.scss";
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
    const form = ref<AnnounceForm>({
      title: "",
      content: "",
    });

    const loadData = () => {
      request.get("/admin/getAnnounce").then((res: any) => {
        rows.value = res.data.rows;
      });
    };

    const handleDelete = (index: number, row: AnnounceRow) => {
      (window as any).ElMessageBox.confirm("确认删除该公告吗？", "提示", {
        type: "warning",
      })
        .then(() => {
          request.post("/admin/deleteAnnounce", { id: row.id }).then(() => {
            rows.value.splice(index, 1);
            (window as any).ElMessage.success("删除成功");
          });
        })
        .catch(() => {});
    };

    const submitAnnounce = () => {
      if (!form.value.title || !form.value.content) {
        (window as any).ElMessage.warning("标题和内容不能为空");
        return;
      }
      request.post("/admin/addAnnounce", form.value).then(() => {
        (window as any).ElMessage.success("发布成功");
        dialogVisible.value = false;
        form.value.title = "";
        form.value.content = "";
        loadData();
      });
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
      dialogVisible,
      form,
      loadData,
      handleDelete,
      submitAnnounce,
      formatTime,
    };
  },
});
</script>
