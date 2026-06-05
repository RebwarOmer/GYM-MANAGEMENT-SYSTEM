const OfferBadge = ({ offerName }) => (
  <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
    {offerName || 'No offer'}
  </span>
);

export default OfferBadge;
