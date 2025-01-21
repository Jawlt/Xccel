import React, { useState } from 'react';
import Menu from './Menu';
import './UserProfile.css';

const UserProfile = ({ user, logout, logoutUri }) => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="user-profile">
      <div className="profile-image" onClick={toggleMenu}>
        {user?.picture ? (
          <img src={user.picture} alt="Profile" className="profile-picture" />
        ) : (
          <div className="profile-placeholder">R</div>
        )}
      </div>
      {showMenu && (
        <div className="menu-wrapper">
          <Menu user={user} logout={logout} logoutUri={logoutUri} onClose={() => setShowMenu(false)} />
        </div>
      )}
    </div>
  );
};

export default UserProfile;
