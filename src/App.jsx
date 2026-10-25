import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import CreateGroup from './pages/CreateGroup'
import Dashboard from './pages/Dashboard'
import GroupDetail from './pages/GroupDetail'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'

const guard = (page) => <ProtectedRoute>{page}</ProtectedRoute>

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={guard(<Dashboard />)} />
          <Route path="/group/new" element={guard(<CreateGroup />)} />
          <Route path="/group/:id" element={guard(<GroupDetail />)} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
