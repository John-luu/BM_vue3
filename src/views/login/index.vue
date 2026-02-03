<template>
  <div class="auth-container">
    <div class="card">
      <h2>登录</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-item">
          <label>学号</label>
          <input v-model="form.number" type="text" placeholder="请输入学号" />
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
          {{ loading ? "登录中..." : "登录" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import request from "@/req";
import { useRouter } from "vue-router";
import { Toast } from "vant"; // 如果你用的是 vant
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

const handleSubmit = async () => {
  if (!form.number || !form.password) {
    Toast.fail("请填写完整信息");
    return;
  }

  if (!/^\d+$/.test(form.number)) {
    Toast.fail("学号必须是数字");
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
      Toast.success("登录成功");

      localStorage.setItem("user", JSON.stringify(data.user));

      router.replace("/student/forum");
    } else {
      Toast.fail(data.message || "账号或密码错误");
    }
  } catch (err) {
    Toast.fail("网络错误，请稍后重试");
  } finally {
    loading.value = false;
  }
};
</script>
