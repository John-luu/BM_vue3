import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from "@element-plus/icons-vue";

const app = createApp(App);

app.use(ElementPlus);
app.use(router);

// 注册图标
app.component("Document", Document);
app.component("IconMenu", IconMenu);
app.component("Location", Location);
app.component("Setting", Setting);

app.mount("#app");
