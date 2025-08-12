import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './app/router'
import { initRipple } from './lib/ripple'

// 初始化全局按钮 Ripple 动效（对 button 与 [data-ripple] 生效）
initRipple()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)