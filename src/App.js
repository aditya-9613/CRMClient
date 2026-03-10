import { Route, Routes } from 'react-router-dom';
import './App.css';
import Admin from './Assets/Components/Admin/Admin';
import Login from './Assets/Components/Admin/Login';
import PrivateComponents from './Assets/Components/PrivateComponents/PrivateComponents';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<PrivateComponents />}>
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}

export default App;
