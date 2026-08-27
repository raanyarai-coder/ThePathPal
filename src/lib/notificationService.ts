import { supabase } from './supabaseClient';

export interface UserNotification {
  id: string;
  user_id: string;
  type: 'escort' | 'gps' | 'medical' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  related_id?: string | null;
  related_type?: string | null;
  created_at: string;
}

const LOCAL_NOTIFS_KEY = 'pathpal_user_notifications_cache';

export function getCachedUserNotifications(userId?: string): UserNotification[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_NOTIFS_KEY}_${userId || 'anon'}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function cacheUserNotifications(userId: string | undefined, list: UserNotification[]) {
  try {
    localStorage.setItem(`${LOCAL_NOTIFS_KEY}_${userId || 'anon'}`, JSON.stringify(list));
  } catch {}
}

/**
 * Fetches notifications for an authenticated user.
 */
export async function fetchUserNotifications(userId: string): Promise<UserNotification[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Notifications fetch note:', error.message);
      return getCachedUserNotifications(userId);
    }

    if (data) {
      const formatted: UserNotification[] = data.map((n) => ({
        id: n.id,
        user_id: n.user_id,
        type: n.type || 'system',
        title: n.title,
        message: n.message || '',
        is_read: Boolean(n.is_read),
        related_id: n.related_id,
        related_type: n.related_type,
        created_at: n.created_at,
      }));
      cacheUserNotifications(userId, formatted);
      return formatted;
    }
  } catch (err) {
    console.error('Exception fetching notifications:', err);
  }

  return getCachedUserNotifications(userId);
}

/**
 * Creates and delivers a user notification.
 */
export async function sendUserNotification(params: {
  userId: string;
  type: 'escort' | 'gps' | 'medical' | 'system';
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: string;
}): Promise<UserNotification> {
  const newNotif: UserNotification = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    is_read: false,
    related_id: params.relatedId || null,
    related_type: params.relatedType || null,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        is_read: false,
        related_id: params.relatedId || null,
        related_type: params.relatedType || null,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      newNotif.id = data.id;
    }
  } catch (e) {
    console.warn('Notification insert note:', e);
  }

  // Update local cache
  const cached = getCachedUserNotifications(params.userId);
  cached.unshift(newNotif);
  cacheUserNotifications(params.userId, cached);

  return newNotif;
}

/**
 * Marks a notification as read.
 */
export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);
  } catch {}

  const cached = getCachedUserNotifications(userId);
  const updated = cached.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n));
  cacheUserNotifications(userId, updated);
}

/**
 * Marks all user notifications as read.
 */
export async function markAllUserNotificationsAsRead(userId: string): Promise<void> {
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
  } catch {}

  const cached = getCachedUserNotifications(userId);
  const updated = cached.map((n) => ({ ...n, is_read: true }));
  cacheUserNotifications(userId, updated);
}

/**
 * Subscribes to real-time notification alerts for an active user.
 */
export function subscribeToUserNotifications(
  userId: string,
  onNotificationReceived: (notification: UserNotification) => void
) {
  if (!userId) return () => {};

  const channel = supabase
    .channel(`user_notifs_${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new) {
          const row = payload.new;
          const notif: UserNotification = {
            id: row.id,
            user_id: row.user_id,
            type: row.type || 'system',
            title: row.title,
            message: row.message || '',
            is_read: Boolean(row.is_read),
            related_id: row.related_id,
            related_type: row.related_type,
            created_at: row.created_at,
          };
          onNotificationReceived(notif);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
