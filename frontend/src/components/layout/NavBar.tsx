import { NavLink } from 'react-router'

export function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/" end>
        Dashboard
      </NavLink>
      <NavLink to="/applications">Applications</NavLink>
    </nav>
  )
}
