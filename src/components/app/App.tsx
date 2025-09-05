import React, { useState } from 'react';
import './App.css';
import Charactersheet from '../pages/charactersheet/Charactersheet';
import Spellbook from '../pages/spellbook/Spellbook';
import Settings from '../pages/settings/Settings';
import { SettingsProvider } from '../../context/SettingsContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <SettingsProvider>
      <div className="app-container">
        <nav className="tab-nav">
          <button className={activeTab === 0 ? 'active' : ''} onClick={() => setActiveTab(0)}>Charactersheet</button>
          <button className={activeTab === 1 ? 'active' : ''} onClick={() => setActiveTab(1)}>Spellbook</button>
          <button className={activeTab === 2 ? 'active' : ''} onClick={() => setActiveTab(2)}>Settings</button>
        </nav>
        <main className="tab-content">
          {activeTab === 0 && <Charactersheet />}
          {activeTab === 1 && <Spellbook />}
          {activeTab === 2 && <Settings />}
        </main>
      </div>
    </SettingsProvider>
  );
};

export default App;