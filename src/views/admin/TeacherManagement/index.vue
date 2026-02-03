<template>
  <div class="teacher-management">
    <!-- 顶部搜索区 -->
    <el-card class="toolbar-card" shadow="never">
      <el-form
        :model="search"
        inline
        label-width="auto"
        class="demo-form-inline enterprise-search-form"
      >
        <el-space wrap :size="20">
          <el-form-item label="学工号">
            <el-input
              v-model="search.number"
              size="default"
              clearable
              placeholder="请输入学工号"
              class="w-50"
            />
          </el-form-item>

          <el-form-item label="姓名">
            <el-input
              v-model="search.username"
              size="default"
              clearable
              placeholder="请输入姓名"
              class="w-50"
            />
          </el-form-item>

          <el-form-item>
            <el-space>
              <el-button
                type="primary"
                size="default"
                @click="handleSearch"
                class="search-btn"
              >
                搜索
              </el-button>
              <el-button size="default" @click="resetSearch" class="reset-btn">
                重置
              </el-button>
              <el-button
                type="success"
                size="default"
                @click="openAddDialog"
                class="add-btn"
              >
                新增学生
              </el-button>
            </el-space>
          </el-form-item>
        </el-space>
      </el-form>
    </el-card>
    <!-- 表格 -->
    <el-table :data="rows" border stripe>
      <el-table-column label="序号">
        <template #default="{ index }">
          {{ (page - 1) * pageSize + index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="number" label="学工号" />
      <el-table-column prop="username" label="姓名" />
      <el-table-column label="信用分">
        <template #default="{ row }">
          <el-tag :type="scoreTagType(row.score)">{{ row.score }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-input
            v-model="row.newPwd"
            size="small"
            placeholder="新密码"
            show-password
          />
          <el-button type="text" @click="remarkPwd(row)">重置</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="fetchData"
        @current-change="fetchData"
        class="enterprise-pagination"
      />

      <!-- 新增教师弹窗 -->
      <el-dialog title="新增教师" :model-value="addVisible" width="400px">
        <el-form label-width="80px" :model="form">
          <el-form-item label="学工号">
            <el-input
              v-model="form.number"
              size="small"
              placeholder="请输入学工号"
              autocomplete="off"
            />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input
              v-model="form.username"
              size="small"
              placeholder="请输入姓名"
              autocomplete="off"
            />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="form.password"
              size="small"
              placeholder="请输入密码"
              show-password
              autocomplete="new-password"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button
            size="small"
            @click="addVisible = false"
            class="dialog-btn"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            size="small"
            @click="submitAdd"
            class="dialog-btn"
          >
            确定
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from "vue";
import request from "@/req";
import { ElMessage, ElMessageBox } from "element-plus";

interface Teacher {
  uid: number;
  number: string;
  username: string;
  score: number;
  newPwd?: string;
}

export default defineComponent({
  name: "TeacherManagement",
  setup() {
    const rows = ref<Teacher[]>([]);
    const total = ref(0);
    const page = ref(1);
    const pageSize = ref(10);

    const search = reactive({
      number: "",
      username: "",
    });

    const addVisible = ref(false);
    const form = reactive({
      number: "",
      username: "",
      password: "",
    });

    const scoreTagType = (score: number) => {
      if (score >= 90) return "success";
      if (score >= 60) return "primary";
      return "danger";
    };

    const fetchData = () => {
      request
        .get("/admin/searchTeacher", {
          params: {
            ...search,
            page: page.value,
            pageSize: pageSize.value,
            type: 1,
          },
        })
        .then((res: any) => {
          rows.value = res.data.rows.map((r: any) => ({ ...r, newPwd: "" }));
          total.value = res.data.total;
        })
        .catch(() => {
          // fallback to old API if needed
        });
    };

    const handleSearch = () => {
      page.value = 1;
      fetchData();
    };

    const resetSearch = () => {
      search.number = "";
      search.username = "";
      page.value = 1;
      fetchData();
    };

    const openAddDialog = () => {
      form.number = "";
      form.username = "";
      form.password = "";
      addVisible.value = true;
    };

    const submitAdd = () => {
      if (!form.number || !form.username || !form.password) {
        return ElMessage.warning("请填写完整信息");
      }
      request.post("/public/register", { ...form, type: 1 }).then(() => {
        ElMessage.success("添加成功");
        addVisible.value = false;
        fetchData();
      });
    };

    const remarkPwd = (row: Teacher) => {
      if (!row.newPwd) return ElMessage.warning("请输入新密码");

      ElMessageBox.confirm("确认重置该教师密码？", "提示", {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      }).then(() => {
        request
          .post("/admin/updatePwd", {
            uid: row.uid,
            password: row.newPwd,
          })
          .then(() => {
            row.newPwd = "";
            ElMessage.success("密码已重置");
          });
      });
    };

    onMounted(fetchData);

    return {
      rows,
      total,
      page,
      pageSize,
      search,
      addVisible,
      form,
      scoreTagType,
      fetchData,
      handleSearch,
      resetSearch,
      openAddDialog,
      submitAdd,
      remarkPwd,
    };
  },
});
</script>
