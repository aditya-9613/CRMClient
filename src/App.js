import './App.css';
import { Route, Routes, Navigate, BrowserRouter } from 'react-router-dom';
import Admin from './Assets/Components/Admin/Admin';
import Login from './Assets/Components/Admin/Login';
import PrivateComponents from './Assets/Components/PrivateComponents/PrivateComponents';
import Contacts from './Assets/Components/NavbarItems/Contacts';
import Imports from './Assets/Components/NavbarItems/Imports';
import Reports from './Assets/Components/NavbarItems/Reports';
import Billing from './Assets/Components/NavbarItems/Billing';
import ProtectedPayment from './Assets/Components/PrivateComponents/ProtectedPayment';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

function App() {

  const HomeRoute = () => {
    const userToken = localStorage.getItem('user');

    if (userToken) {
      return <Navigate to="/admin" replace />;
    }

    return <Login />;
  };

  return (
    <PayPalScriptProvider options={{
      "client-id": "Ab_X1nxtPH3i9oD2kPlMFJmoYGiN6i0oFv98hoDZAve0NjC2wTHRU-hbvRiALVxoKzNGfZbx-8DoPlAr",
      currency: "USD",
      intent: "capture",
      components: "buttons",
    }}>
      <BrowserRouter>
        <div className="App">
          <Routes>

            <Route path="/" element={<HomeRoute />} />

            <Route element={<PrivateComponents />}>
              <Route path="/admin" Component={Admin} />
              <Route path="/contacts" Component={Contacts} />
              <Route path="/import" Component={Imports} />
              <Route path="/reports" Component={Reports} />
              <Route path="/billing" Component={Billing} />
              <Route path="/payment" Component={ProtectedPayment} />
            </Route>

          </Routes>
        </div>
      </BrowserRouter>
    </PayPalScriptProvider>
  );
}

export default App;