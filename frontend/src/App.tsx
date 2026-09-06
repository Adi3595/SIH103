import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import Projects from './pages/Projects'
import RisingRisk from './pages/RisingRisk'
import Priorities from './pages/Priorities'
import Analytics from './pages/Analytics'
import Intelligence from './pages/Intelligence'
import DataQuality from './pages/DataQuality'
import Settings from './pages/Settings'
import MapView from './pages/MapView'
import Sidebar from './components/layout/Sidebar'

function AnimatedRoutes() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/rising" element={<RisingRisk />} />
        <Route path="/priorities" element={<Priorities />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/intelligence" element={<Intelligence />} />
        <Route path="/data" element={<DataQuality />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AnimatedRoutes />
      </div>
    </div>
  )
}

export default App
