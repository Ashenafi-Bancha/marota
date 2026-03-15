// src/components/Modal.jsx
import { createPortal } from "react-dom";

export default function Modal({ children, onClose }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div
          className="bg-gradient-to-r from-[#112240]/75 via-[#112240]/35 to-[#0a192f]/95 p-5 sm:p-6 rounded-xl w-full max-w-md relative border border-[#3b5f8c] shadow-2xl max-h-[92vh] overflow-y-auto"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn-modal-close absolute top-3 right-3 transition"
            aria-label="Close modal"
          >
            ✕
          </button>

          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
