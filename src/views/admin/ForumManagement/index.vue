<template>
  <div class="forum-management">
    <el-card class="forum-card" shadow="never">
      <el-table
        :data="rows"
        style="width: 100%"
        class="forum-table"
        row-class-name="forum-row"
      >
        <!-- 标题 -->
        <el-table-column label="标题" min-width="260">
          <template #default="{ row }">
            <div class="title-cell">{{ row.title }}</div>
          </template>
        </el-table-column>

        <!-- 内容 -->
        <el-table-column label="内容" min-width="320">
          <template #default="{ row }">
            <div class="content-cell">{{ row.content }}</div>
          </template>
        </el-table-column>

        <!-- 时间 -->
        <el-table-column label="发布时间" width="180">
          <template #default="{ row }">
            <span class="time-text">{{ formatTime(row.datetime) }}</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <span
              class="status-dot"
              :class="row.status === 1 ? 'success' : 'offline'"
            ></span>
            <span class="status-text">{{
              row.status === 1 ? "正常" : "已下架"
            }}</span>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row, $index }">
            <el-button
              type="text"
              size="small"
              class="action-primary"
              @click="openDetail(row)"
            >
              查看
            </el-button>

            <el-button
              v-if="row.status === 1"
              type="text"
              size="small"
              class="action-danger"
              @click="offlineArticle($index, row)"
            >
              下架
            </el-button>

            <el-button
              v-else
              type="text"
              size="small"
              class="action-success"
              @click="restoreArticle(row)"
            >
              恢复
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 帖子详情 -->
    <el-dialog title="帖子详情" v-model:visible="dialogVisible" width="600px">
      <h3 class="detail-title">{{ currentRow.title }}</h3>
      <p class="detail-content">{{ currentRow.content }}</p>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import request from "@/req";
import "./style.scss";
import { ElMessage, ElMessageBox } from "element-plus";
interface Article {
  id: number;
  title: string;
  content: string;
  datetime: string;
  status: number; // 1: 正常, 0: 下架
}

export default defineComponent({
  name: "ForumManagement",
  setup() {
    const rows = ref<Article[]>([]);
    const dialogVisible = ref(false);
    const currentRow = ref<Article>({
      id: 0,
      title: "",
      content: "",
      datetime: "",
      status: 1,
    });

    const formatTime = (datetime: string) => {
      const date = new Date(datetime);
      return date.toLocaleString();
    };

    const fetchArticles = async () => {
      try {
        const res = await request.get("/forum/admin/getArticle");
        rows.value = res.data.rows;
      } catch (error) {
        console.error("获取文章列表失败:", error);
      }
    };

    const openDetail = (row: Article) => {
      currentRow.value = row;
      dialogVisible.value = true;
    };

    const offlineArticle = async (_index: number, row: Article) => {
      try {
        await ElMessageBox.confirm("确认下架该帖子吗？", "提示", {
          type: "warning",
        });
        await request.post("/forum/admin/offlineArticle", { id: row.id });
        row.status = 0;
        ElMessage.success("下架成功");
      } catch (error) {
        console.log("取消或请求失败", error);
      }
    };

    const restoreArticle = async (row: Article) => {
      try {
        await ElMessageBox.confirm("确认恢复该帖子吗？", "提示", {
          type: "info",
        });
        await request.post("/forum/admin/onlineArticle", { id: row.id });
        row.status = 1;
        ElMessage.success("恢复成功");
      } catch (error) {
        console.log("取消或请求失败", error);
      }
    };

    onMounted(() => {
      fetchArticles();
    });

    return {
      rows,
      dialogVisible,
      currentRow,
      formatTime,
      openDetail,
      offlineArticle,
      restoreArticle,
    };
  },
});
</script>
