import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Cpu, Award, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const tabs = [
    { label: 'Home', path: '/', icon: Home, end: true },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Projects', path: '/projects', icon: Cpu },
    { label: 'Skills', path: '/skills', icon: Award },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-orange-100 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-16 h-12 min-h-[44px] min-w-[44px] rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-orange-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-orange-50 text-orange-600' : ''}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  </div>
                  <span className={`text-[10px] tracking-tight ${isActive ? 'font-bold text-orange-600' : 'font-normal'}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 -mt-0.5" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
