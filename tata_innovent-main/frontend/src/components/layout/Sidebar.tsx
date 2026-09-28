import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

export interface SidebarProps {
  isOpen: boolean;
  menuItems: MenuItem[];
}

export const Sidebar = ({ isOpen, menuItems }: SidebarProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <motion.aside 
      initial={false}
      animate={{ x: isOpen || !isMobile ? 0 : '-100%' }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="w-64 h-screen fixed left-0 top-0 bg-automotive-background/95 backdrop-blur-xl border-r border-automotive-border text-automotive-white flex flex-col pt-16 z-10"
    >
      <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <ul className="flex flex-col gap-1.5">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? 'text-automotive-blue border-l-4 border-transparent'
                      : 'border-l-4 border-transparent text-automotive-muted hover:text-automotive-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div 
                        layoutId="active-sidebar-bg" 
                        className="absolute inset-0 bg-automotive-blue/10 border-l-4 border-automotive-blue shadow-[inset_0_0_20px_rgba(0,200,255,0.15)]"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon className="w-[18px] h-[18px] mr-3 relative z-10 transition-colors group-hover:text-automotive-blue" />
                    <span className="font-[500] text-[15px] relative z-10">{item.name}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </motion.aside>
  );
};
