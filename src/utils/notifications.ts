// Browser Native Push Notifications & Vibration Service

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log("This browser does not support notifications.");
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export function sendPushNotification(title: string, body: string, icon = '🛡️') {
  // Mobile vibration
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 300]);
    } catch {
      // ignore
    }
  }

  // Desktop/Mobile Web Notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'al-aman-alert-' + Date.now(),
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {
      console.warn("Notification error:", e);
    }
  }
}
