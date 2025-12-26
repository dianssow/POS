

import axios from "axios"
import { setupOfflineInterceptor } from "./utils/interceptor" 

const api = axios.create ({
  baseURL: import.meta.env.VITE_API_URL,
   withCredentials: true,
})

setupOfflineInterceptor(api) 

export default api