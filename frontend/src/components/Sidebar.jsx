import { NavLink } from 'react-router-dom';
import { Icon } from './Icons';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/members', label: 'Members', icon: 'members' },
  { to: '/members/add', label: 'Add Member', icon: 'add' },
  { to: '/logs', label: 'Activity Log', icon: 'logs' },
];

const Sidebar = ({ open, onClose }) => (
  <>
    {open && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} />}
    <aside className={`fixed bottom-0 left-0 top-16 z-30 w-60 bg-sidebar text-white transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onClose}
            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-slate-700'}`}
          >
            <Icon name={item.icon} className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  </>
);

export default Sidebar;
