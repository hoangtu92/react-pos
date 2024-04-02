import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Orders from './pages/Orders'
import Content from './pages/Content'
import NotFound from './pages/NotFound'
import PrivateRoute from './pages/PrivateRoute'
import Pos from "./pages/Pos";
import Customers from "./pages/Customers";
import Cart from "./pages/Cart";

function App() {
  return (
    <>
    <Router>
      <div className="App">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
             <Route
              path='/dashboard'
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            >
              <Route path='' element={<Content />} />
              <Route path='orders' element={<Orders />} />
              <Route path='new-order' element={<Pos />} />
              <Route path='customers' element={<Customers />} />
              <Route path='cart' element={<Cart />} />
            </Route>

             <Route path='*' element={<NotFound />}/>
          </Routes>

      </div>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
