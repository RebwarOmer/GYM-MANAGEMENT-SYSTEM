import { useNavigate } from 'react-router-dom';
import OfferBadge from './OfferBadge';
import StatusBadge from './StatusBadge';
import { Icon } from './Icons';
import { formatDate, memberDisplayStatus } from '../utils/format';

const MemberCard = ({ member, onStop, onResume, onDelete }) => {
  const navigate = useNavigate();
  const displayStatus = memberDisplayStatus(member);
  const isStopped = member.status === 'STOPPED';

  return (
    <tr className="border-b border-gray-100 odd:bg-white even:bg-gray-50 hover:bg-blue-50/50">
      <td className="px-4 py-3 font-medium text-gray-900">{member.fullName}</td>
      <td className="px-4 py-3 text-gray-600">{member.phone || '-'}</td>
      <td className="px-4 py-3"><OfferBadge offerName={member.latestOfferName} /></td>
      <td className="px-4 py-3 text-gray-600">{formatDate(member.latestSubscriptionStartDate)}</td>
      <td className="px-4 py-3 text-gray-600">{formatDate(member.latestSubscriptionEndDate)}</td>
      <td className="px-4 py-3"><StatusBadge status={displayStatus} /></td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate(`/members/${member.id}`)} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">
            <Icon name="eye" className="h-4 w-4" /> View
          </button>
          {isStopped ? (
            <button type="button" onClick={() => onResume(member)} className="inline-flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-800 hover:bg-green-200">
              <Icon name="check" className="h-4 w-4" /> Resume
            </button>
          ) : (
            <button type="button" onClick={() => onStop(member)} className="inline-flex items-center gap-1 rounded-lg bg-yellow-100 px-3 py-1.5 text-xs font-medium text-yellow-800 hover:bg-yellow-200">
              <Icon name="stop" className="h-4 w-4" /> Stop
            </button>
          )}
          <button type="button" onClick={() => onDelete(member)} className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">
            <Icon name="trash" className="h-4 w-4" /> Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default MemberCard;
