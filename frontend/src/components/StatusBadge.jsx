const styles = {
  ACTIVE: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-orange-100 text-orange-700',
  STOPPED: 'bg-gray-200 text-gray-700',
};

const StatusBadge = ({ status }) => {
  const label = status || 'UNKNOWN';

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[label] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
