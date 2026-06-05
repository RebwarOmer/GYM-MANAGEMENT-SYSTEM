import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOffers } from '../api/offerApi';
import { createMember } from '../api/memberApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatMoney } from '../utils/format';

const AddMemberPage = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState({ fullName: '', phone: '', offerId: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const response = await getAllOffers();
        setOffers(response.data);
        if (response.data.length > 0) {
          setForm((current) => ({ ...current, offerId: response.data[0].id }));
        }
      } catch (err) {
        setError('Unable to load offers.');
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await createMember({
        fullName: form.fullName,
        phone: form.phone,
        offerId: Number(form.offerId),
      });
      setSuccess('Member created successfully.');
      setTimeout(() => navigate('/members'), 700);
    } catch (err) {
      setError('Unable to create member.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Add New Member</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="fullName">Full Name</label>
            <input id="fullName" value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="phone">Phone</label>
            <input id="phone" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="offer">Select Offer</label>
            <select id="offer" value={form.offerId} onChange={(event) => updateField('offerId', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" required>
              {offers.map((offer) => (
                <option key={offer.id} value={offer.id}>{offer.name} - {formatMoney(offer.priceIqd)}</option>
              ))}
            </select>
          </div>
        </div>

        {success && <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={submitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300">
            {submitting ? 'Saving...' : 'Submit'}
          </button>
          <button type="button" onClick={() => navigate('/members')} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMemberPage;
