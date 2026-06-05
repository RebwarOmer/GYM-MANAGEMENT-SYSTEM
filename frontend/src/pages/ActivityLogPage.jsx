import { useEffect, useMemo, useState } from 'react';
import { getAllLogs } from '../api/activityLogApi';
import { Icon } from '../components/Icons';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateTime } from '../utils/format';

const actionStyles = {
  ADD_MEMBER: 'bg-green-100 text-green-700',
  RENEW_SUBSCRIPTION: 'bg-blue-100 text-blue-700',
  STOP_MEMBERSHIP: 'bg-yellow-100 text-yellow-800',
  DELETE_MEMBER: 'bg-red-100 text-red-700',
  AUTO_DELETED: 'bg-gray-200 text-gray-700',
};

const ActionBadge = ({ action }) => (
  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${actionStyles[action] || 'bg-gray-100 text-gray-600'}`}>
    {action}
  </span>
);

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await getAllLogs();
        setLogs(response.data);
      } catch (err) {
        setError('Unable to load activity logs.');
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => logs.filter((log) => {
    const text = `${log.member?.fullName || 'Deleted member'} ${log.actionType}`.toLowerCase();
    return text.includes(search.toLowerCase());
  }), [logs, search]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>

      <div className="relative mb-4 w-full lg:max-w-md">
        <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by member or action" className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Member name</th>
              <th className="px-4 py-3">Action type</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Date and time</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 odd:bg-white even:bg-gray-50 hover:bg-blue-50/50">
                <td className="px-4 py-3 font-medium text-gray-900">{log.member?.fullName || 'Deleted member'}</td>
                <td className="px-4 py-3"><ActionBadge action={log.actionType} /></td>
                <td className="px-4 py-3 text-gray-600">{log.description}</td>
                <td className="px-4 py-3 text-gray-600">{formatDateTime(log.createdAt)}</td>
              </tr>
            ))}
            {filteredLogs.length === 0 && <tr><td className="px-4 py-6 text-center text-gray-500" colSpan="4">No logs found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogPage;
