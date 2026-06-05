import { useAuth } from '../context/AuthContext';
import { Icon } from './Icons';

const Navbar = ({ onMenuClick }) => {
  const { username, logout } = useAuth();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenuClick} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden" aria-label="Open navigation">
          <Icon name="menu" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">GP</div>
        <span className="text-xl font-bold text-gray-900">GymPro</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm font-medium text-gray-600 sm:inline">{username}</span>
        <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
          <Icon name="logout" className="h-4 w-4" /> Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
