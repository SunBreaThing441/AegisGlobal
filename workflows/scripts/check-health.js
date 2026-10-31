/**
 * Unified System Health Checker
 * Verifies Frontend, Backend, and Supabase in one command.
 */
const http = require('http');
const https = require('https');

const fetchJson = (url, headers = {}) => {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;

    const req = client.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => resolve({ status: 0, error: err.message }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ status: 408, error: 'Timeout' });
    });
  });
};

async function checkSystem() {
  console.log('====================================================');
  console.log('🩺 MediConnect Elite — System Health Verification');
  console.log('====================================================\n');

  // 1. Backend Health Check
  const backend = await fetchJson('http://localhost:5000/api/health');
  if (backend.status === 200 && backend.body?.status === 'ok') {
    console.log(`✅ Backend API:      ONLINE (Port 5000, Uptime: ${Math.round(backend.body.uptime)}s)`);
  } else {
    console.log(`❌ Backend API:      OFFLINE or Error (${backend.error || backend.status})`);
  }

  // 2. Frontend Health Check
  const frontend = await fetchJson('http://localhost:5173/');
  if (frontend.status === 200) {
    console.log(`✅ Frontend UI:       ONLINE (Port 5173, HTTP 200 OK)`);
  } else {
    console.log(`❌ Frontend UI:       OFFLINE or Error (${frontend.error || frontend.status})`);
  }

  // 3. Supabase Auth Health Check
  const supabaseKey = 'sb_publishable_Q9yJIk54WyB4jsiBOx2OWQ_ie1YTWBt';
  const supabase = await fetchJson(
    'https://rmfzydycexyuhqskklgu.supabase.co/auth/v1/health',
    { apikey: supabaseKey }
  );

  if (supabase.status === 200 && supabase.body?.name === 'GoTrue') {
    console.log(`✅ Supabase Gateway:  ONLINE (GoTrue ${supabase.body.version}, Authenticated)`);
  } else {
    console.log(`❌ Supabase Gateway:  OFFLINE or Auth Error (${supabase.error || supabase.status})`);
  }

  console.log('\n====================================================');
}

checkSystem();
