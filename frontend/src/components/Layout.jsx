import React from 'react';
import NavBar from './NavBar';
import '../styles.css';

const Layout = ({ children }) => {
  return (
    <div className="main-container">
      <NavBar />
      <div className="content">
        {children}
      </div>
    </div>
  );
};

export default Layout;
