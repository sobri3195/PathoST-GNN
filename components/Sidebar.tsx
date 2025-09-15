
import React from 'react';
import { AnalysisIcon } from './icons/AnalysisIcon';
import { DataIcon } from './icons/DataIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { HelpIcon } from './icons/HelpIcon';

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const navItems = [
    { name: 'analysis', icon: AnalysisIcon, tooltip: 'Analysis View' },
    { name: 'data', icon: DataIcon, tooltip: 'Data Management' },
    { name: 'settings', icon: SettingsIcon, tooltip: 'Settings' },
];

const helpItem = { name: 'help', icon: HelpIcon, tooltip: 'Help & Documentation' };

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    const NavButton: React.FC<{item: typeof navItems[0]}> = ({ item }) => (
         <div className="relative group">
            <button
                onClick={() => setActiveView(item.name)}
                className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors
                    ${activeView === item.name 
                        ? 'bg-brand-accent text-brand-highlight' 
                        : 'text-brand-light hover:bg-brand-accent/50 hover:text-white'
                    }`}
                aria-label={item.tooltip}
            >
                <item.icon />
            </button>
            <div 
                className="absolute left-full ml-2 w-max bg-brand-secondary text-brand-text text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg"
                role="tooltip"
            >
                {item.tooltip}
                 <div className="absolute top-1/2 -translate-y-1/2 right-full w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-brand-secondary" aria-hidden="true"></div>
            </div>
        </div>
    );
    
    return (
        <nav className="w-16 bg-brand-primary flex flex-col items-center justify-between py-4 shadow-lg flex-shrink-0 z-20">
            <div className="flex flex-col items-center space-y-4">
                {navItems.map(item => (
                    <NavButton key={item.name} item={item} />
                ))}
            </div>
             <div className="flex flex-col items-center space-y-4">
                <NavButton item={helpItem} />
            </div>
        </nav>
    );
};
