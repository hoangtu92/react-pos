import React from "react";
import { Link } from "react-router-dom";
import trans from "../utils/translate";

const Header = () => {
  return (
    <header>
      <div>
        <Link to="/">JustDog POS</Link>
      </div>
      <ul>
        <li>
          <Link to="/login">{trans("login")}</Link>
        </li>
        <li>
          <Link to="/register">{trans("register")}</Link>
        </li>
      </ul>
    </header>
  );
};

export default Header;
