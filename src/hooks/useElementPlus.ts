// @/hooks/useElementPlus.ts
import { ElMessage, ElMessageBox } from "element-plus";
import type { ElMessageBoxOptions } from "element-plus";

export const useMessage = () => {
  const message = {
    success: (msg: string) => ElMessage.success(msg),
    warning: (msg: string) => ElMessage.warning(msg),
    info: (msg: string) => ElMessage.info(msg),
    error: (msg: string) => ElMessage.error(msg),
  };

  const confirm = (
    message: string,
    title: string,
    options?: ElMessageBoxOptions,
  ) => {
    return ElMessageBox.confirm(message, title, {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      ...options,
    });
  };

  return { message, confirm };
};

export const useDialog = () => {
  const showDialog = (options: ElMessageBoxOptions) => {
    return ElMessageBox(options);
  };

  return { showDialog };
};
