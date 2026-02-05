<template>
  <el-dialog
    v-model="visible"
    title="批量导入学生"
    width="520px"
    :close-on-click-modal="false"
  >
    <el-form label-width="110px">
      <!-- 统一密码 -->
      <el-form-item label="统一初始密码">
        <el-input
          v-model="password"
          type="password"
          show-password
          placeholder="所有导入学生使用该密码"
        />
      </el-form-item>

      <!-- Excel 上传 -->
      <el-form-item label="Excel 文件">
        <el-upload
          drag
          :auto-upload="false"
          accept=".xlsx,.xls"
          :on-change="handleFileChange"
        >
          <el-icon><Upload /></el-icon>
          <div class="el-upload__text">
            将 Excel 拖到此处，或 <em>点击上传</em>
          </div>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submit">开始导入</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { Upload } from "@element-plus/icons-vue";
import { useStudentImport } from "@/hooks/useStudentImport.ts";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(["update:modelValue", "success"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const password = ref("");
const file = ref<File | null>(null);

const { importStudents } = useStudentImport();

const handleFileChange = (uploadFile: any) => {
  file.value = uploadFile.raw;
};

const submit = async () => {
  if (!file.value) {
    ElMessage.warning("请上传 Excel 文件");
    return;
  }
  if (!password.value) {
    ElMessage.warning("请输入统一密码");
    return;
  }

  await importStudents(file.value, password.value);
  ElMessage.success("导入成功");

  visible.value = false;
  emit("success");
};
</script>
