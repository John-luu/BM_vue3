<template>
  <div class="student-management">
    <!-- 顶部搜索区 - Element Plus 企业级样式 -->
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
                class="search-btn btn-search"
              >
                搜索
              </el-button>
              <el-button size="default" @click="resetSearch" class="reset-btn btn-reset">
                重置
              </el-button>
              <el-button
                type="success"
                size="default"
                @click="openAddDialog"
                class="add-btn btn-create"
              >
                新增学生
              </el-button>
              <el-button
                type="warning"
                size="default"
                @click="openImportDialog"
                class="btn-create"
              >
                批量导入
              </el-button>
            </el-space>
          </el-form-item>
        </el-space>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-table :data="rows" border stripe>
      <el-table-column prop="number" label="学工号" />
      <el-table-column prop="username" label="姓名" />
      <el-table-column label="信用分">
        <template #default="{ row }">
          <el-tag :type="scoreTagType(row.score)">{{ row.score }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="260">
        <template #default="{ row }">
          <div class="pwd-reset-line">
            <el-input
              v-model="row.newPwd"
              size="small"
              placeholder="新密码"
              show-password
              class="pwd-input"
            />
            <el-button plain size="small" class="btn-update pwd-btn" @click="remarkPwd(row)">重置</el-button>
          </div>
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
    </div>

    <!-- 新增学生弹窗 -->
    <el-dialog
      v-model="addVisible"
      title="新增学生"
      width="500px"
      :close-on-click-modal="false"
      align-center
      :append-to-body="true"
    >
      <el-form
        :model="form"
        label-width="100px"
        :rules="rules"
        ref="formRef"
        status-icon
      >
        <el-form-item label="学工号" prop="number">
          <el-input
            v-model="form.number"
            placeholder="请输入学工号"
            clearable
          />
        </el-form-item>

        <el-form-item label="姓名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入姓名"
            clearable
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
            autocomplete="new-password"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button class="btn-cancel" @click="addVisible = false">取消</el-button>
          <el-button type="primary" class="btn-confirm" @click="submitAdd">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <StudentImportDialog v-model="importVisible" @success="fetchData" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import request from "@/req";
import "./style.scss";
import StudentImportDialog from "@/components/StudentImportDialog.vue";
interface StudentRow {
  uid: number;
  number: string;
  username: string;
  score: number;
  newPwd?: string;
}

interface SearchForm {
  number: string;
  username: string;
}

interface AddForm {
  number: string;
  username: string;
  password: string;
}

// 数据响应式
const rows = ref<StudentRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const addVisible = ref(false);
const formRef = ref<FormInstance>();
const importVisible = ref(false);

const search = reactive<SearchForm>({
  number: "",
  username: "",
});

const form = reactive<AddForm>({
  number: "",
  username: "",
  password: "",
});
const openImportDialog = () => {
  importVisible.value = true;
};
// 表单验证规则
const rules = reactive<FormRules<AddForm>>({
  number: [
    { required: true, message: "请输入学工号", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" },
  ],
  username: [
    { required: true, message: "请输入姓名", trigger: "blur" },
    { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" },
  ],
});

// 方法
const scoreTagType = (score: number) => {
  if (score >= 90) return "success";
  if (score >= 60) return "warning";
  return "danger";
};

const fetchData = () => {
  request
    .get("/admin/searchUser", {
      params: { ...search, page: page.value, pageSize: pageSize.value },
    })
    .then((res: any) => {
      rows.value = res.data.rows.map((r: any) => ({ ...r, newPwd: "" }));
      total.value = res.data.total || 0;
    })
    .catch((err: any) => {
      console.error("获取数据失败:", err);
      ElMessage.error("获取数据失败");
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
  Object.assign(form, {
    number: "",
    username: "",
    password: "",
  });
  addVisible.value = true;
  // 清除之前的验证结果
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

const submitAdd = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    const { number, username, password } = form;

    request
      .post("/public/register", { number, username, password, type: 0 })
      .then(() => {
        ElMessage.success("添加成功");
        addVisible.value = false;
        fetchData();
      })
      .catch((err: any) => {
        ElMessage.error(err.message || "添加失败");
      });
  } catch (error) {
    // 验证失败，不执行提交
    console.log("表单验证失败");
  }
};

const remarkPwd = (row: StudentRow) => {
  if (!row.newPwd) {
    ElMessage.warning("请输入新密码");
    return;
  }

  ElMessageBox.confirm("确认重置该学生密码？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    center: true,
  })
    .then(() => {
      request
        .post("/admin/updatePwd", { uid: row.uid, password: row.newPwd })
        .then(() => {
          row.newPwd = "";
          ElMessage.success("密码重置成功");
        })
        .catch((err: any) => {
          ElMessage.error("重置失败: " + (err.message || "未知错误"));
        });
    })
    .catch(() => {});
};

onMounted(() => {
  fetchData();
});
</script>
