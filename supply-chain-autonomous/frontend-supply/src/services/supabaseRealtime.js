import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ovlsztpswkblbvpkzwrm.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bHN6dHBzd2tibGJ2cGt6d3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDM3OTUsImV4cCI6MjEwNjMxOTc5NX0.w_4cA88MhSDMhMMj3bLM4D70lsHgw9rqKCpThS_8JQk';

let supabaseClient = null;

export const getSupabaseClient = () => {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
      console.log('✅ Supabase Realtime Client initialized:', SUPABASE_URL);
    } catch (err) {
      console.warn('⚠️ Supabase Realtime Client initialization error:', err.message);
    }
  }
  return supabaseClient;
};

// Track active channels to prevent duplicate subscriptions
const activeChannels = new Map();

/**
 * Generic helper to subscribe to Postgres changes on a table in public schema
 * @param {Object} config
 * @param {string} config.table - Name of the table (e.g., 'disruptions')
 * @param {string} [config.channelName] - Unique channel identifier
 * @param {string} [config.event='*'] - 'INSERT', 'UPDATE', 'DELETE', or '*'
 * @param {Function} config.onInsert - Callback for INSERT events
 * @param {Function} config.onUpdate - Callback for UPDATE events
 * @param {Function} config.onDelete - Callback for DELETE events
 * @param {Function} config.onAny - Callback for any event
 * @param {Function} [config.onStatus] - Callback for status changes ('SUBSCRIBED', 'CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED')
 * @returns {Function} Unsubscribe function
 */
export const subscribeToTable = ({
  table,
  channelName,
  event = '*',
  onInsert,
  onUpdate,
  onDelete,
  onAny,
  onStatus,
}) => {
  const client = getSupabaseClient();
  if (!client) {
    console.warn(`[Supabase Realtime] Skipping subscription for "${table}" - Supabase client not initialized.`);
    return () => {};
  }

  const chanId = channelName || `realtime-public-${table}`;

  // If a channel already exists with this ID, remove it first to avoid duplicate subscriptions
  if (activeChannels.has(chanId)) {
    console.log(`[Supabase Realtime] Existing channel found for "${chanId}", removing before resubscribing.`);
    const existing = activeChannels.get(chanId);
    try {
      client.removeChannel(existing);
    } catch (e) {
      // Ignore cleanup error
    }
    activeChannels.delete(chanId);
  }

  console.log(`[Supabase Realtime] Creating channel "${chanId}" on public.${table} for event(s): ${event}`);

  const channel = client.channel(chanId);

  // Subscribe to changes
  channel.on(
    'postgres_changes',
    {
      event,
      schema: 'public',
      table,
    },
    (payload) => {
      console.log(`📡 [Supabase Realtime] Event received on public.${table} [${payload.eventType}]:`, payload);

      if (onAny) onAny(payload);
      if (payload.eventType === 'INSERT' && onInsert) onInsert(payload.new, payload);
      if (payload.eventType === 'UPDATE' && onUpdate) onUpdate(payload.new, payload.old, payload);
      if (payload.eventType === 'DELETE' && onDelete) onDelete(payload.old, payload);
    }
  );

  // Subscribe with status logging
  channel.subscribe((status, err) => {
    console.log(`📊 [Supabase Realtime] Channel "${chanId}" status: ${status}`, err ? `Error: ${err.message || err}` : '');

    if (status === 'SUBSCRIBED') {
      console.log(`🟢 [Supabase Realtime] Successfully SUBSCRIBED to public.${table}`);
    } else if (status === 'CHANNEL_ERROR') {
      console.error(`🔴 [Supabase Realtime] CHANNEL_ERROR on public.${table}:`, err);
    } else if (status === 'TIMED_OUT') {
      console.warn(`🟡 [Supabase Realtime] TIMED_OUT connecting to public.${table}`);
    } else if (status === 'CLOSED') {
      console.log(`⚪ [Supabase Realtime] CLOSED channel for public.${table}`);
    }

    if (onStatus) onStatus(status, err);
  });

  activeChannels.set(chanId, channel);

  // Return unsubscribe cleanup function
  return () => {
    console.log(`[Supabase Realtime] Cleaning up subscription for "${chanId}"`);
    try {
      client.removeChannel(channel);
    } catch (e) {
      console.warn(`Error removing channel ${chanId}:`, e.message);
    }
    activeChannels.delete(chanId);
  };
};

/**
 * Realtime helper specifically for the `disruptions` table (INSERT & UPDATE)
 */
export const subscribeToDisruptions = ({ onInsert, onUpdate, onDelete, onStatus }) => {
  return subscribeToTable({
    table: 'disruptions',
    channelName: 'realtime-public-disruptions',
    event: '*',
    onInsert: (newRow) => {
      console.log('🚨 [Realtime Disruption INSERT]:', newRow);
      if (onInsert) onInsert(newRow);
    },
    onUpdate: (newRow, oldRow) => {
      console.log('🔄 [Realtime Disruption UPDATE]:', newRow);
      if (onUpdate) onUpdate(newRow, oldRow);
    },
    onDelete,
    onStatus,
  });
};

/**
 * Realtime helper for `ai_decisions`
 */
export const subscribeToDecisions = ({ onInsert, onUpdate, onStatus }) => {
  return subscribeToTable({
    table: 'ai_decisions',
    channelName: 'realtime-public-ai-decisions',
    event: '*',
    onInsert,
    onUpdate,
    onStatus,
  });
};

/**
 * Realtime helper for `inventory`
 */
export const subscribeToInventory = ({ onUpdate, onStatus }) => {
  return subscribeToTable({
    table: 'inventory',
    channelName: 'realtime-public-inventory',
    event: 'UPDATE',
    onUpdate,
    onStatus,
  });
};

/**
 * Realtime helper for `notifications`
 */
export const subscribeToNotifications = ({ onInsert, onUpdate, onStatus }) => {
  return subscribeToTable({
    table: 'notifications',
    channelName: 'realtime-public-notifications',
    event: '*',
    onInsert,
    onUpdate,
    onStatus,
  });
};

/**
 * Realtime helper for `audit_logs`
 */
export const subscribeToAuditLogs = ({ onInsert, onStatus }) => {
  return subscribeToTable({
    table: 'audit_logs',
    channelName: 'realtime-public-audit-logs',
    event: 'INSERT',
    onInsert,
    onStatus,
  });
};

/**
 * Realtime helper for `alternative_suppliers`
 */
export const subscribeToAlternativeSuppliers = ({ onInsert, onUpdate, onStatus }) => {
  return subscribeToTable({
    table: 'alternative_suppliers',
    channelName: 'realtime-public-alternative-suppliers',
    event: '*',
    onInsert,
    onUpdate,
    onStatus,
  });
};

export default {
  getSupabaseClient,
  subscribeToTable,
  subscribeToDisruptions,
  subscribeToDecisions,
  subscribeToInventory,
  subscribeToNotifications,
  subscribeToAuditLogs,
  subscribeToAlternativeSuppliers,
};
