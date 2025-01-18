import React, { useState } from 'react';
import Menu from './Menu';
import './UserProfile.css';

const UserProfile = ({ user, searches }) => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="user-profile">
      <div className="profile-image" onClick={toggleMenu}>
        {user?.image ? (
          <img src={user.image} alt="Profile" />
        ) : (
          <div className="profile-placeholder">R</div>
        )}
      </div>
      {showMenu && (
        <div className="menu-wrapper">
          <Menu searches={searches} onClose={() => setShowMenu(false)} />
        </div>
      )}
    </div>
  );
};

export default UserProfile;