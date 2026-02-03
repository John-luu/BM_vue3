import axios from "axios";

const request = axios.create({
  baseURL: "http://localhost:9003/", // 你的接口地址
  timeout: 5000,
});

export default request;
