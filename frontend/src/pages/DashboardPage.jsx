import { useEffect, useState } from 'react';
import { getAllLogs } from '../api/activityLogApi';
import { getAllMembers } from '../api/memberApi';
import { Icon } from '../components/Icons';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import { formatDateTime, memberDisplayStatus } from '../utils/format';

const DashboardPage = () => {
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [membersResponse, logsResponse] = await Promise.all([getAllMembers(), getAllLogs()]);
        setMembers(membersResponse.data);
        setLogs(logsResponse.data);
      } catch (err) {
        setError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalMembers = members.length;
  const activeMembers = members.filter((member) => member.status === 'ACTIVE' && member.latestSubscriptionStatus !== 'EXPIRED').length;
  const expiredMembers = members.filter((member) => memberDisplayStatus(member) === 'EXPIRED').length;
  const stoppedMembers = members.filter((member) => member.status === 'STOPPED').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Members" value={totalMembers} color="blue" icon={<Icon name="members" />} />
        <StatCard title="Active Members" value={activeMembers} color="green" icon={<Icon name="dashboard" />} />
        <StatCard title="Expired Members" value={expiredMembers} color="orange" icon={<Icon name="logs" />} />
        <StatCard title="Stopped Members" value={stoppedMembers} color="gray" icon={<Icon name="stop" />} />
      </div>

      <section className="mt-6 rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Member name</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 5).map((log) => (
                <tr key={log.id} className="border-b border-gray-100 odd:bg-white even:bg-gray-50 hover:bg-blue-50/50">
                  <td className="px-4 py-3">{log.member?.fullName || 'Deleted member'}</td>
                  <td className="px-4 py-3">{log.actionType}</td>
                  <td className="px-4 py-3 text-gray-600">{log.description}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDateTime(log.createdAt)}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td className="px-4 py-6 text-center text-gray-500" colSpan="4">No activity yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
