import { Navigate, Route, Routes } from 'react-router-dom'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { AppLayout } from './layouts/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { FlaggedHouseholdsPage } from './pages/FlaggedHouseholdsPage'
import { HouseholdDetailPage } from './pages/HouseholdDetailPage'
import { HouseholdsPage } from './pages/HouseholdsPage'
import { PickupsPage } from './pages/PickupsPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { SchedulesPage } from './pages/SchedulesPage'
import { ZoneDetailPage } from './pages/ZoneDetailPage'
import { ZonesPage } from './pages/ZonesPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/zones" element={<ZonesPage />} />
        <Route path="/zones/:id" element={<ZoneDetailPage />} />
        <Route path="/households" element={<HouseholdsPage />} />
        <Route path="/households/:id" element={<HouseholdDetailPage />} />
        <Route path="/pickups" element={<PickupsPage />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/flagged" element={<FlaggedHouseholdsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
