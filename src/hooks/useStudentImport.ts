import request from "@/req";
import { ElMessage } from "element-plus";

export function useStudentImport() {
  const importStudents = async (file: File, password: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    try {
      await request.post("/public/importStudents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (err: any) {
      ElMessage.error(err.message || "导入失败");
      throw err;
    }
  };

  return {
    importStudents,
  };
}
