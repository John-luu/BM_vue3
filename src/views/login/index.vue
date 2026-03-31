<template>
  <div class="auth-container">
    <section class="login-card">
      <div class="card-head">
        <h2>管理员登录</h2>
        <span>Admin Sign In</span>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-item">
          <label>管理员账号</label>
          <input
            v-model="form.number"
            type="text"
            placeholder="请输入管理员账号"
          />
        </div>

        <div class="form-item">
          <label>密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
          />
        </div>

        <button class="submit-btn" type="submit" :disabled="loading">
          {{ loading ? "登录中..." : "登录系统" }}
        </button>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import request from "@/req";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import "./style.scss";

interface LoginForm {
  number: string;
  password: string;
}

const router = useRouter();
const loading = ref(false);

const form = reactive<LoginForm>({
  number: "",
  password: "",
});

const isAdminUser = (user: unknown): user is { type: number } => {
  if (!user || typeof user !== "object") return false;
  return Number((user as { type?: unknown }).type) === 2;
};

const handleSubmit = async () => {
  if (!form.number || !form.password) {
    ElMessage.error("请填写完整信息");
    return;
  }

  if (!/^\d+$/.test(form.number)) {
    ElMessage.error("账号必须是数字");
    return;
  }

  try {
    loading.value = true;

    const res = await request.post("/public/login", {
      number: form.number,
      password: form.password,
    });
    const { data } = res;
    if (data.code === 200) {
      if (!isAdminUser(data.user)) {
        ElMessage.error("仅管理员可登录后台");
        return;
      }

      ElMessage.success("登录成功");

      localStorage.setItem("user", JSON.stringify(data.user));

      router.replace("/admin");
    } else {
      ElMessage.error(data.message || "账号或密码错误");
    }
  } catch (err) {
    ElMessage.error("网络错误，请稍后重试");
  } finally {
    loading.value = false;
  }
};
</script>
