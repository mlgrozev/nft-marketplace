import React from "react";
import usericon from "../assets/user.png";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="navbar">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", width: "50%" }} className="linkbar">
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "inactive")}
            to="/"
          >
            <a>MarketPlace</a>
          </NavLink>

          <NavLink
            className={({ isActive }) => (isActive ? "active" : "inactive")}
            to="/my-assets"
          >
            <a>My Assets</a>
          </NavLink>

          <div class="dropdown">
            <span>Create</span>
            <div class="dropdown-content">
              <NavLink
                className={({ isActive }) => (isActive ? "active" : "inactive")}
                to="/create-item"
              >
                NFTs
              </NavLink>
              <NavLink
                className={({ isActive }) => (isActive ? "active" : "inactive")}
                to="/create-collection"
              >
                Collections
              </NavLink>
            </div>
          </div>

          <NavLink to="/creator-dashboard">
            <a>Created Assets</a>
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "inactive")}
            to="/auctions"
          >
            <a>Auctions</a>
          </NavLink>
        </div>
        <div style={{ width: "5%" }}>
          <img style={{ width: "45%" }} src={usericon} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
