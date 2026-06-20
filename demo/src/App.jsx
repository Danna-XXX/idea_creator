import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Positioning from './pages/Positioning'
import Topics from './pages/Topics'
import Formulas from './pages/Formulas'
import FormulaDetail from './pages/FormulaDetail'
import ScriptGen from './pages/ScriptGen'
import Notes from './pages/Notes'
import Profile from './pages/Profile'
import Upgrade from './pages/Upgrade'
import Review from './pages/Review'

export default function App() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/positioning" element={<Positioning />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/formulas" element={<Formulas />} />
        <Route path="/formulas/:id" element={<FormulaDetail />} />
        <Route path="/script" element={<ScriptGen />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="/review" element={<Review />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
