import { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        {/* Modal */}
        <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} z-10 max-h-[90vh] flex flex-col`}>
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
          
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false, loading = false }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
    footer={
      <>
        <button onClick={onClose} className="btn-secondary text-sm px-4 py-2">Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          className={`${danger ? 'btn-danger' : 'btn-primary'} text-sm px-4 py-2`}>
          {loading ? 'Processing...' : confirmText}
        </button>
      </>
    }
  >
    <p className="text-gray-600">{message}</p>
  </Modal>
);

export default Modal;
