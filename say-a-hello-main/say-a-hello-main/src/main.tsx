import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import Dashboard from './pages/Dashboard.tsx'

createRoot(document.getElementById('root')!).render(<Dashboard />)
