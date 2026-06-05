const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-gray-900">Confirm Action</h2>
      <p className="mt-3 text-sm text-gray-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
          Confirm
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
