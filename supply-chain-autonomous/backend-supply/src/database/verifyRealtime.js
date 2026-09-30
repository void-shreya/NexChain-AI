require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase Realtime end-to-end...');
console.log('URL:', SUPABASE_URL);

// 1. Client subscribing with anon key (acting as frontend)
const listenerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Client performing changes with service role (acting as backend / DB)
const publisherClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testRealtime() {
  let insertReceived = false;
  let updateReceived = false;

  const channel = listenerClient
    .channel('test-disruptions-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'disruptions',
      },
      (payload) => {
        console.log(`📡 Event received on client: [${payload.eventType}]`, payload.new?.id, payload.new?.title);
        if (payload.eventType === 'INSERT' && payload.new?.id === 'test-realtime-disrupt-01') {
          insertReceived = true;
        }
        if (payload.eventType === 'UPDATE' && payload.new?.id === 'test-realtime-disrupt-01') {
          updateReceived = true;
        }
      }
    )
    .subscribe((status, err) => {
      console.log(`📊 Subscription status: ${status}`, err || '');
    });

  // Wait 3 seconds for connection and SUBSCRIBED status
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log('Inserting test disruption via publisher client...');
  const testDisruption = {
    id: 'test-realtime-disrupt-01',
    code: 'TEST-DISRUPT-REALTIME-01',
    title: 'Automated Realtime Telemetry Verification Incident',
    type: 'SUPPLIER_SHUTDOWN',
    severity: 'MEDIUM',
    status: 'ACTIVE',
    affected_entity_type: 'SUPPLIER',
    affected_entity_name: 'Test Supplier Hub',
  };

  const { error: insErr } = await publisherClient.from('disruptions').upsert(testDisruption);
  if (insErr) {
    console.error('Insert error:', insErr);
  } else {
    console.log('✅ Inserted test disruption in Supabase');
  }

  // Wait 3 seconds for Realtime event
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log('Updating test disruption status to RESOLVED...');
  const { error: upErr } = await publisherClient
    .from('disruptions')
    .update({ status: 'RESOLVED', title: 'Automated Realtime Incident (Resolved)' })
    .eq('id', 'test-realtime-disrupt-01');

  if (upErr) {
    console.error('Update error:', upErr);
  } else {
    console.log('✅ Updated test disruption in Supabase');
  }

  // Wait 3 seconds for Realtime update event
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Clean up test record
  console.log('Cleaning up test record...');
  await publisherClient.from('disruptions').delete().eq('id', 'test-realtime-disrupt-01');

  listenerClient.removeChannel(channel);

  console.log('============================================');
  console.log(`INSERT Event Received via Realtime: ${insertReceived ? '✅ YES' : '❌ NO'}`);
  console.log(`UPDATE Event Received via Realtime: ${updateReceived ? '✅ YES' : '❌ NO'}`);
  console.log('============================================');

  if (insertReceived && updateReceived) {
    console.log('🎉 SUPABASE REALTIME IS 100% OPERATIONAL!');
    process.exit(0);
  } else {
    console.error('⚠️ Realtime events were not received.');
    process.exit(1);
  }
}

testRealtime().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
