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
import { ToastProvider } from './Utils/toast.jsx';
import NoteEditor from './Pages/NoteEditor.jsx';
import NoteViewer from './Pages/NoteViewer.jsx';

function App() {

  return (
    <Router>
      <ToastProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path='/notes/create' element={<NoteEditor />} />
            <Route path='/notes/edit/:id' element={<NoteEditor />} />
            <Route path='/notes/:id' element={<NoteViewer />} />
        </Route>
      </Routes>
      </ToastProvider>
    </Router>  
  )
}

export default App
