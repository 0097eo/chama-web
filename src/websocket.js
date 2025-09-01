import io from 'socket.io-client';

class NotificationWebSocket {
  constructor() {
    this.socket = null;
    this.token = localStorage.getItem('token');
    this.notifications = [];
    this.listeners = new Set();
  }

  connect() {
    if (!this.token) {
      console.warn('No authentication token found');
      return;
    }

    this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3000', {
      auth: {
        token: this.token
      }
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('new_notification', (notification) => {
      console.log('New notification received:', notification);
      this.notifications.unshift(notification);
      this.notifyListeners('new_notification', notification);
      
      // Show browser notification if permitted
      this.showBrowserNotification(notification);
    });

    this.socket.on('new_broadcast_notification', (notification) => {
      console.log('New broadcast notification:', notification);
      this.notifyListeners('new_broadcast', notification);
      this.showBrowserNotification(notification);
    });

    this.socket.on('notification_marked_read', ({ notificationId }) => {
      const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
      if (notificationIndex !== -1) {
        this.notifications[notificationIndex].read = true;
        this.notifyListeners('notification_read', { notificationId });
      }
    });

    this.socket.on('notification_deleted', ({ notificationId }) => {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      this.notifyListeners('notification_deleted', { notificationId });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
    });
  }

  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  }

  // Subscribe to real-time updates
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback({ event, data });
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  markAsRead(notificationId) {
    this.socket?.emit('mark_notification_read', notificationId);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Request browser notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}

const notificationWebSocket = new NotificationWebSocket();
export default notificationWebSocket;