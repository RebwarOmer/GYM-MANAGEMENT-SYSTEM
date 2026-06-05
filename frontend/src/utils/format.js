export const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `${amount.toLocaleString('en-US')} IQD`;
};

export const memberDisplayStatus = (member) => {
  if (member?.status === 'STOPPED') return 'STOPPED';
  return member?.latestSubscriptionStatus || member?.status || 'ACTIVE';
};
