import React from "react";
import {useNavigate, Link, useLocation} from "react-router-dom";
import {
  FaShopify,
  FaUserCircle,
  FaSignInAlt, FaShoppingBag, FaSync,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { logout, reset } from "../features/auth/authSlice";

const SidebarLeft = () => {
  const { user } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();


  const logoutUser = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/");
  };

  return (
    <>
      <div className="menu-links">
        <Link to="/dashboard" className={location.pathname === "/dashboard" ? "bg-hover" : null}>
          <FaShoppingBag className="menu-icon" />
          Home
        </Link>
        <Link to="/dashboard/orders" className={location.pathname === "/dashboard/orders" ? "bg-hover" : null}>
          <FaShopify className="menu-icon" />
          Orders
        </Link>

        <Link to="/dashboard/customers" className={location.pathname === "/dashboard/customers" ? "bg-hover" : null}>
          <FaSync className="menu-icon" />
          Sync
        </Link>

      </div>

      <div className="user-info">
        <div className="user-detail">
          <FaUserCircle className="user-icon" />
          <span className="user">{user.name}</span>
        </div>
        <button className="logout-btn" onClick={logoutUser}>
          <FaSignInAlt className="logout-icon" />
        </button>
      </div>
    </>
  );
};

export default SidebarLeft;
