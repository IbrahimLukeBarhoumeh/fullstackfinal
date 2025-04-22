import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Create from './pages/Create'
import EditPost from './pages/EditPost'
import PostDetail from './pages/PostDetail'

export default function App() {
  return (
    <Router>
      <header>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active-link' : undefined}>
            Home
          </NavLink>
          <NavLink to="/create" className={({ isActive }) => isActive ? 'active-link' : undefined}>
            Create
          </NavLink>
        </nav>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/edit/:id" element={<EditPost />} />
          <Route path="/post/:id" element={<PostDetail />} />
        </Routes>
      </main>
    </Router>
  )
}
