import { useState, type ReactNode } from 'react';
import { Menu, Calendar, Calculator, HelpCircle } from 'lucide-react';

type TabId = 'shelfLife' | 'basic' | 'support';

interface MainNavbarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

const APP_NAME = 'I.C.A.T';

const NAV_ITEMS: Array<{
  id: TabId;
  label: string;
  icon: ReactNode;
}> = [
  { id: 'shelfLife', label: 'Máy tính HSD', icon: <Calendar className="w-4.5 h-4.5 text-blue-500" /> },
  { id: 'basic', label: 'Máy tính cơ bản', icon: <Calculator className="w-4.5 h-4.5 text-orange-500" /> },
  { id: 'support', label: 'Hỗ trợ', icon: <HelpCircle className="w-4.5 h-4.5 text-emerald-500" /> },
];

export default function MainNavbar({
  activeTab,
  setActiveTab,
}: MainNavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleTabSelect = (tab: TabId) => {
    setActiveTab(tab);
    setDropdownOpen(false);
  };

  const navButtonClass = (tab: TabId) =>
    `px-3 py-1 font-semibold text-sm transition-all cursor-pointer relative ${
      activeTab === tab
        ? 'text-blue-600'
        : 'text-neutral-500 hover:text-neutral-900'
    }`;

  const mobileItemClass = (tab: TabId) =>
    `flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-semibold transition-colors ${
      activeTab === tab
        ? 'bg-neutral-100 text-blue-600'
        : 'text-neutral-700 hover:bg-neutral-50'
    }`;

  return (
    <nav className="bg-white w-full sticky top-0 border-b border-neutral-200 shadow-xs z-50 transition-colors">
      <div className="flex justify-between items-center px-4 md:px-8 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <button
            type="button"
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setActiveTab('shelfLife')}
          >
            <span className="font-sans font-black text-2xl sm:text-3xl text-blue-600 tracking-tight">
              {APP_NAME}
            </span>
          </button>

          <div className="hidden md:flex gap-6 items-center">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                className={navButtonClass(item.id)}
              >
                {item.label}
                {activeTab === item.id && (
                  <span className="absolute bottom-[-17px] left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative inline-block text-left">
            <button
              onClick={() => setDropdownOpen((value) => !value)}
              className="p-2 md:hidden hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-center text-neutral-600"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10 bg-transparent"
                  onClick={() => setDropdownOpen(false)}
                />
                <div
                  className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg border border-neutral-200 focus:outline-none divide-y divide-neutral-100"
                  role="menu"
                >
                  <div className="py-2.5">
                    {NAV_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleTabSelect(item.id)}
                        className={mobileItemClass(item.id)}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
