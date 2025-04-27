export default function Popup({ open, onClose }) {
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded shadow-lg relative w-full max-w-md">
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-xl text-gray-500 hover:text-red-600"
          >
            &times;
          </button>
          
        </div>
      </div>
    );
  }
  