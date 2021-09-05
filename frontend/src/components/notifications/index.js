import React, { useEffect } from 'react';
import '../../App.css';

function Notifications({ notification, id, setNotificationList }) {
  useEffect(() => {
    const updateNotification = setTimeout(() => {
      setNotificationList(state => state.filter(item => item.id !== id))
    }, 5000)
    return () => {
      clearTimeout(updateNotification)
    }
  }, [id, setNotificationList])

  return (
    <div className="status-message-content">
      {notification}
    </div>
  );
}

export default Notifications;