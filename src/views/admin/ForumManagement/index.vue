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
              plain
              size="small"
              class="action-primary btn-view"
              @click="openDetail(row)"
            >
              查看
            </el-button>

            <el-button
              v-if="row.status === 1"
              plain
              size="small"
              class="action-danger btn-delete"
              @click="offlineArticle($index, row)"
            >
              下架
            </el-button>

            <el-button
              v-else
              plain
              size="small"
              class="action-success btn-update"
              @click="restoreArticle(row)"
            >
              恢复
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 帖子详情 -->
    <el-dialog 
      title="帖子详情" 
      v-model="dialogVisible"
      width="700px"
      align-center
      :append-to-body="true"
    >
      <div class="detail-container">
        <div class="article-section">
          <h3 class="detail-title">{{ currentRow.title }}</h3>
          <div class="article-meta">
            <span class="author">发布者：{{ currentRow.username }}</span>
            <span class="time">发布时间：{{ formatTime(currentRow.datetime) }}</span>
          </div>
          <p class="detail-content">{{ currentRow.content }}</p>
        </div>

        <el-divider />

        <div class="comments-section">
          <h4 class="comments-title">评论（{{ comments.length }}）</h4>
          <el-empty
            v-if="!commentsLoading && comments.length === 0"
            description="暂无评论"
          ></el-empty>
          <el-skeleton v-if="commentsLoading" :rows="3" animated />
          <div v-else class="comments-list">
            <div v-for="comment in comments" :key="comment.cid" class="comment-item">
              <div class="comment-header">
                <span class="comment-author">{{ comment.username }}</span>
                <span class="comment-time">{{ formatTime(comment.datetime) }}</span>
              </div>
              <p class="comment-content">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button class="btn-cancel" @click="dialogVisible = false">关闭</el-button>
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
  uid: number;
  username: string;
  status: number; // 1: 正常, 0: 下架
}

interface Comment {
  cid: number;
  content: string;
  datetime: number;
  uid: number;
  username: string;
  aid: number;
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
      uid: 0,
      username: "",
      status: 1,
    });
    const comments = ref<Comment[]>([]);
    const commentsLoading = ref(false);

    const formatTime = (datetime: string | number) => {
      const timestamp = typeof datetime === "string" ? new Date(datetime).getTime() : datetime;
      const date = new Date(timestamp);
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
      loadComments(row.id);
    };

    const loadComments = async (articleId: number) => {
      try {
        commentsLoading.value = true;
        const res = await request.post("/forum/getComment", { aid: articleId });
        comments.value = res.data.rows || [];
      } catch (error) {
        console.error("加载评论失败:", error);
        comments.value = [];
      } finally {
        commentsLoading.value = false;
      }
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
      comments,
      commentsLoading,
      formatTime,
      openDetail,
      loadComments,
      offlineArticle,
      restoreArticle,
    };
  },
});
</script>
