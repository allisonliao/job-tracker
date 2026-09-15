import { Outlet } from 'react-router'
import { NavBar } from './NavBar'

export function Layout() {
  return (
    <div>
      <header>
        <h1>Job Tracker</h1>
        <NavBar />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
