const colorMap = {
  blue: 'border-t-blue-600',
  green: 'border-t-green-600',
  orange: 'border-t-orange-500',
  gray: 'border-t-gray-500',
};

const StatCard = ({ title, value, icon, color = 'blue' }) => (
  <div className={`rounded-xl border-t-4 bg-white p-5 shadow-sm ${colorMap[color] || colorMap.blue}`}>
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="rounded-lg bg-gray-100 p-3 text-gray-600">{icon}</div>
    </div>
  </div>
);

export default StatCard;
