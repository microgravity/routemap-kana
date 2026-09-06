import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './HomePage'
import { ParentPage } from './ParentPage'
import { PracticePage } from './PracticePage'
import { StationPage } from './StationPage'

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/station/:stationId" element={<StationPage />} />
        <Route path="/practice/:stationId/:position" element={<PracticePage />} />
        <Route path="/parent" element={<ParentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
