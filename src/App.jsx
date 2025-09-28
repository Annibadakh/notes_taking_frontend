import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
} from 'react-router-dom';

import './App.css'
import Signup from './Pages/Signup'
import Dashboard from "./Pages/Dashboard";
import Login from './Pages/Login';
import { ProtectedRoute } from './ProtectedRoute';
import HomePage from './Pages/HomePage';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>  
  )
}

export default App
