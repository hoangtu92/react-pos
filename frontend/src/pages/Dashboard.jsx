import React from "react";
import { Outlet } from "react-router-dom";
import SidebarLeft from "../components/SidebarLeft";
const Dashboard = () => {
  return (
    <>
      <div className="container-fluid">
        <div className="sidebarLeft">
          <SidebarLeft />
        </div>

        {/* Dynamic Page */}
        <div className={"main-content flex-grow-1"}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
