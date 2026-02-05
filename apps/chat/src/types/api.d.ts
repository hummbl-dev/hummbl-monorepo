import { AxiosInstance } from 'axios';

declare module '../lib/api' {
  const api: AxiosInstance;
  export default api;
}
