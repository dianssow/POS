import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store } from './store.js'
import { Provider} from "react-redux"
import  {setupOfflineInterceptor} from "./utils/interceptor.js"
import { syncOfflineData } from "./utils/sync.js"
import api from "./api"

setupOfflineInterceptor(api)
  window.addEventListener("online", syncOfflineData)

createRoot(document.getElementById('root')).render(
<Provider store={store}>
    <App />
</Provider>
)
