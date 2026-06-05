import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteMember, getAllMembers, resumeMember, stopMember } from '../api/memberApi';
import ConfirmModal from '../components/ConfirmModal';
import { Icon } from '../components/Icons';
import LoadingSpinner from '../components/LoadingSpinner';
import MemberCard from '../components/MemberCard';
import { memberDisplayStatus } from '../utils/format';

const tabs = ['All', 'Active', 'Expired', 'Stopped'];

const MembersPage = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await getAllMembers();
      setMembers(response.data);
      setError('');
    } catch (err) {
      setError('Unable to load members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const filteredMembers = useMemo(() => members.filter((member) => {
    const matchesSearch = member.fullName.toLowerCase().includes(search.toLowerCase());
    const status = memberDisplayStatus(member);
    const matchesTab = activeTab === 'All' || status === activeTab.toUpperCase();
    return matchesSearch && matchesTab;
  }), [members, search, activeTab]);

  const handleConfirm = async () => {
    if (!modal) return;

    try {
      if (modal.type === 'stop') {
        await stopMember(modal.member.id);
      } else if (modal.type === 'resume') {
        await resumeMember(modal.member.id);
      } else {
        await deleteMember(modal.member.id);
      }
      setModal(null);
      await loadMembers();
    } catch (err) {
      setError('Action failed. Please try again.');
      setModal(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>
        <button type="button" onClick={() => navigate('/members/add')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Icon name="add" className="h-4 w-4" /> Add Member
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name" className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-lg px-4 py-2 text-sm font-medium ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Full name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Offer</th>
              <th className="px-4 py-3">Subscription start date</th>
              <th className="px-4 py-3">Subscription end date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <MemberCard key={member.id} member={member} onStop={(selected) => setModal({ type: 'stop', member: selected })} onResume={(selected) => setModal({ type: 'resume', member: selected })} onDelete={(selected) => setModal({ type: 'delete', member: selected })} />
            ))}
            {filteredMembers.length === 0 && <tr><td className="px-4 py-6 text-center text-gray-500" colSpan="7">No members found.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <ConfirmModal
          message={
            modal.type === 'stop'
              ? `Stop membership for ${modal.member.fullName}?`
              : modal.type === 'resume'
              ? `Resume membership for ${modal.member.fullName}?`
              : `Delete ${modal.member.fullName}? This cannot be undone.`
          }
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default MembersPage;
