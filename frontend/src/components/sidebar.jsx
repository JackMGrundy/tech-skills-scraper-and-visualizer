import React, { Component } from "react";

class Sidebar extends Component {
  state = {};
  render() {
    return (
      <div className="sidebar">
        <nav className="sidebar-nav">
          <ul className="nav">
            <li className="nav-title">Nav Title</li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <i className="nav-icon cui-speedometer" /> Nav item
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <i className="nav-icon cui-speedometer" /> With badge
                <span className="badge badge-primary">NEW</span>
              </a>
            </li>
            <li className="nav-item nav-dropdown">
              <a className="nav-link nav-dropdown-toggle" href="#">
                <i className="nav-icon cui-puzzle" /> Nav dropdown
              </a>
              <ul className="nav-dropdown-items">
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    <i className="nav-icon cui-puzzle" /> Nav dropdown item
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    <i className="nav-icon cui-puzzle" /> Nav dropdown item
                  </a>
                </li>
              </ul>
            </li>
            <li className="nav-item mt-auto">
              <a className="nav-link nav-link-success" href="https://coreui.io">
                <i className="nav-icon cui-cloud-download" /> Download CoreUI
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link nav-link-danger" href="https://coreui.io/pro/">
                <i className="nav-icon cui-layers" /> Try CoreUI
                <strong>PRO</strong>
              </a>
            </li>
          </ul>
        </nav>
        <button className="sidebar-minimizer brand-minimizer" type="button" />
      </div>
    );
  }
}

export default Sidebar;
