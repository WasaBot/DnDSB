import React, { useState, useEffect } from 'react';
import './App.css';
import Charactersheet from '../pages/charactersheet/Charactersheet';
import Spellbook from '../pages/spellbook/Spellbook';
import Settings from '../pages/settings/Settings';
import { SettingsProvider } from '../../context/SettingsContext';
import supabase from '../../utils/supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [someInfo, setSomeInfo] = useState<any | null>(null);

  useEffect(() => {
    const fetchRes = async () => {
      const { data: class_resources, error } = await supabase
        .from('class_resources')
        .select('id');

      if (error) {
        console.error('Error fetching todos:', error);
        return;
      }

      if (class_resources && class_resources.length > 0) {
        setSomeInfo(class_resources);
      }
    };

    fetchRes();
  }, []);

  return (
    <SettingsProvider>
      <div>
        {JSON.stringify(someInfo,null,2)}
      </div>
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