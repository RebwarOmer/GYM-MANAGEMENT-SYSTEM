import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getLogsByMember } from '../api/activityLogApi';
import { getMemberById } from '../api/memberApi';
import { getAllOffers } from '../api/offerApi';
import { getSubscriptionsByMember, renewSubscription } from '../api/subscriptionApi';
import LoadingSpinner from '../components/LoadingSpinner';
import OfferBadge from '../components/OfferBadge';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatDateTime, formatMoney } from '../utils/format';

const MemberDetailPage = () => {
  const { id } = useParams();
  const memberId = Number(id);
  const [member, setMember] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [offers, setOffers] = useState([]);
  const [offerId, setOfferId] = useState('');
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [memberResponse, subscriptionsResponse, logsResponse, offersResponse] = await Promise.all([
        getMemberById(memberId),
        getSubscriptionsByMember(memberId),
        getLogsByMember(memberId),
        getAllOffers(),
      ]);
      setMember(memberResponse.data);
      setSubscriptions(subscriptionsResponse.data);
      setLogs(logsResponse.data);
      setOffers(offersResponse.data);
      if (offersResponse.data.length > 0) {
        setOfferId(offersResponse.data[0].id);
      }
      setError('');
    } catch (err) {
      setError('Unable to load member details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [memberId]);

  const handleRenew = async () => {
    setRenewing(true);
    setMessage('');
    setError('');

    try {
      await renewSubscription(memberId, Number(offerId));
      setMessage('Subscription renewed successfully.');
      await loadData();
    } catch (err) {
      setError('Unable to renew subscription.');
    } finally {
      setRenewing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!member) {
    return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error || 'Member not found.'}</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{member.fullName}</h1>
        {message && <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Member Info</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-gray-500">Full name</span><span className="font-medium">{member.fullName}</span></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Phone</span><span className="font-medium">{member.phone || '-'}</span></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Member status</span><StatusBadge status={member.status} /></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Member since</span><span className="font-medium">{formatDate(member.createdAt)}</span></div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Current Subscription</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-gray-500">Current offer</span><OfferBadge offerName={member.latestOfferName} /></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Start date</span><span className="font-medium">{formatDate(member.latestSubscriptionStartDate)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">End date</span><span className="font-medium">{formatDate(member.latestSubscriptionEndDate)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Subscription status</span><StatusBadge status={member.latestSubscriptionStatus} /></div>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Renew Subscription</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <select value={offerId} onChange={(event) => setOfferId(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-sm">
            {offers.map((offer) => (
              <option key={offer.id} value={offer.id}>{offer.name} - {formatMoney(offer.priceIqd)}</option>
            ))}
          </select>
          <button type="button" onClick={handleRenew} disabled={renewing || !offerId} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300">
            {renewing ? 'Renewing...' : 'Renew'}
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Subscription History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr><th className="px-4 py-3">Offer</th><th className="px-4 py-3">Start</th><th className="px-4 py-3">End</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="border-b border-gray-100 odd:bg-white even:bg-gray-50 hover:bg-blue-50/50">
                  <td className="px-4 py-3"><OfferBadge offerName={subscription.offer?.name} /></td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(subscription.startDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(subscription.endDate)}</td>
                  <td className="px-4 py-3"><StatusBadge status={subscription.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr><th className="px-4 py-3">Action</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Date</th></tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 odd:bg-white even:bg-gray-50 hover:bg-blue-50/50">
                  <td className="px-4 py-3">{log.actionType}</td>
                  <td className="px-4 py-3 text-gray-600">{log.description}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDateTime(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default MemberDetailPage;
