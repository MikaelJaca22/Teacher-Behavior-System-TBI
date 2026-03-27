import React from 'react';
import { CheckCircle } from 'lucide-react';
import './Modal.css';

const ToastNotification = ({ userName, message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-notification success">
      <CheckCircle size={32} color="#4caf50" className="toast-icon" />
      <div className="toast-content">
        <p className="toast-user-name">{userName}</p>
        <p className="toast-message">{message}</p>
      </div>
    </div>
  );
};

export default ToastNotification;
