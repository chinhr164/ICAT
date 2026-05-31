/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import MainNavbar from './components/MainNavbar';
import ShelfLifeCalc from './components/ShelfLifeCalc';
import BasicCalc from './components/BasicCalc';
import Support from './components/Support';
import Footer from './components/Footer';

const getLocalDateStr = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'shelfLife' | 'basic' | 'support'>('shelfLife');
  const [currentDateStr, setCurrentDateStr] = useState<string>(getLocalDateStr());

  useEffect(() => {
    const syncSystemDate = () => setCurrentDateStr(getLocalDateStr());

    syncSystemDate();
    const timer = window.setInterval(syncSystemDate, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="bg-neutral-50 text-neutral-900 min-h-screen flex flex-col transition-colors duration-200">
      <MainNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-grow w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-12">
        <div className="animate-fade-in">
          {activeTab === 'shelfLife' ? (
            <ShelfLifeCalc currentDateStr={currentDateStr} />
          ) : activeTab === 'basic' ? (
            <BasicCalc />
          ) : (
            <Support />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
