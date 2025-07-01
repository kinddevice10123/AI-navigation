import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Bot } from 'lucide-react';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <Bot className="logo-icon" />
            <h1 className="logo-text">SentraCore</h1>
          </div>
          <span className="subtitle">No-Code Robotics Logic Builder</span>
        </div>
        
        <div className="header-right">
          <button 
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;