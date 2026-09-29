import type { LucideIcon } from 'lucide-react'
import { BarChart3, CalendarDays, ClipboardCheck, House, LayoutDashboard, MapPinned, TriangleAlert } from 'lucide-react'

export interface NavigationItem {
  label: string
  to: string
  icon: LucideIcon
}

export const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Zones', to: '/zones', icon: MapPinned },
  { label: 'Households', to: '/households', icon: House },
  { label: 'Pickup Logs', to: '/pickups', icon: ClipboardCheck },
  { label: 'Schedules', to: '/schedules', icon: CalendarDays },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Flagged Households', to: '/flagged', icon: TriangleAlert },
]
