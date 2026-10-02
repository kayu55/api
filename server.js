const http = require('http');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');

let config = {};
if (fs.existsSync(CONFIG_PATH)) {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

const X_TOB_TOKEN = config.X_TOB_TOKEN || '';
const X_STORE_ID = config.X_STORE_ID || '';

const META = {
  os: 2,
  os_version: '35',
  app_version: '36100',
  rn_version: '1034000',
  language: 'id',
  device_id: config.device_id || '',
  device_fingerprint: config.device_fingerprint || '',
  device_model: config.device_model || '',
  device_brand: config.device_brand || '',
  source: 'partner',
  arch: 'rn',
  app_package_name: 'com.shopee.id',
  latitude: '',
  longitude: '',
  user_agent_type: 2,
  network_type: 1,
  device_ip: '',
  sz_blackbox: config.sz_blackbox || ''
};

const COMMON_HEADERS = {
  'accept': 'application/json, text/plain, */*',
  'x-token': '',
  'lang': 'id',
  'force-auth': '0',
  'x-tob-token': X_TOB_TOKEN,
  'x-store-id': X_STORE_ID,
  'SHOPEE_HTTP_DNS_MODE': '1',
  'Content-Type': 'application/json',
  'Host': 'api.gw.airpay.co.id',
  'Connection': 'Keep-Alive',
  'User-Agent': 'okhttp/3.12.13 app_type=2 shopee_rn_bundle_version=8000000'
};

function getHeaders(extra = {}) {
  return {
    ...COMMON_HEADERS,
    'x-timestamp-ms': String(Date.now()),
    ...extra
  };
}

async function createQris(amount) {
  const apiAmount = Math.round(amount * 100000);

  const body = {
    data: {
      amount: apiAmount,
      expired_time: 1200
    },
    meta: META
  };

  const res = await fetch('https://api.gw.airpay.co.id/acquiring/v1/partner_app/cscanb/store_qr/create', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });

  const json = await res.json();
  return json;
}

async function checkPayment(transactionSn) {
  const body = {
    data: {
      order_sn: transactionSn,
      router_id: null,
      is_grey: false
    },
    meta: META
  };

  const res = await fetch('https://api.gw.airpay.co.id/merchant/v1/partner-app/get-merchant-transaction-detail', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });

  const json = await res.json();
  return json;
}

function extractOrderSn(json) {
  if (!json || !json.data) return null;
  const data = json.data;
  if (data.order_sn) return data.order_sn;
  if (data.transaction_data && data.transaction_data.order_sn) return data.transaction_data.order_sn;
  if (typeof data === 'object') {
    for (const key of Object.keys(data)) {
      if (key === 'order_sn' && typeof data[key] === 'string') return data[key];
    }
  }
  const raw = JSON.stringify(json);
  const match = raw.match(/"order_sn"\s*:\s*"([^"]+)"/);
  return match ? match[1] : null;
}

function extractQrContent(json) {
  if (!json || !json.data) return null;
  const data = json.data;
  if (data.qr_content) return data.qr_content;
  if (data.qr_code) return data.qr_code;
  if (data.cscanb_qr_content) return data.cscanb_qr_content;
  if (data.content) return data.content;
  const raw = JSON.stringify(json);
  const patterns = [
    /"qr_content"\s*:\s*"([^"]+)"/,
    /"qr_code"\s*:\s*"([^"]+)"/,
    /"cscanb_qr_content"\s*:\s*"([^"]+)"/,
    /"content"\s*:\s*"([^"]+)"/
  ];
  for (const p of patterns) {
    const m = raw.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractQrImage(json) {
  const data = json && json.data ? json.data : null;
  if (!data) return null;
  if (data.qr_image) return data.qr_image;
  if (data.qr_base64) return data.qr_base64;
  if (data.qr_image_base64) return data.qr_image_base64;
  if (data.base64_image) return data.base64_image;
  if (data.qr) return data.qr;
  const raw = JSON.stringify(json);
  const patterns = [
    /"qr_image"\s*:\s*"([^"]+)"/,
    /"qr_base64"\s*:\s*"([^"]+)"/,
    /"qr_image_base64"\s*:\s*"([^"]+)"/,
    /"base64_image"\s*:\s*"([^"]+)"/,
    /"qr"\s*:\s*"([^"]+)"/
  ];
  for (const p of patterns) {
    const m = raw.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractTransactionData(json) {
  if (!json || !json.data) return {};
  const data = json.data;
  if (data.transaction_data) return data.transaction_data;
  if (data.order && data.order.transaction_data) return data.order.transaction_data;
  return data;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  res.setHeader('Content-Type', 'application/json');

  if (pathname === '/createqris' || pathname.startsWith('/createqris/')) {
    const amountStr = pathname.replace('/createqris/', '').split('=')[1];
    const amount = parseFloat(amountStr);

    if (!amountStr || isNaN(amount) || amount <= 0) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Parameter amount diperlukan dan harus valid. Contoh: /createqris/amount=1000' }));
      return;
    }

    try {
      const result = await createQris(amount);
      const orderSn = extractOrderSn(result) || '';
      const qrContent = extractQrContent(result) || '';
      const qrImage = extractQrImage(result) || '';

      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'success',
        amount: amount,
        api_amount: Math.round(amount * 100000),
        transaction_sn: orderSn,
        qr_content: qrContent,
        qr_image: qrImage,
        expired_minutes: 20,
        raw: result
      }, null, 2));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Gagal membuat QRIS', detail: e.message }));
    }
    return;
  }

  if (pathname === '/cekpembayaran' || pathname.startsWith('/cekpembayaran/')) {
    const snStr = pathname.replace('/cekpembayaran/', '').split('=')[1];
    const transactionSn = snStr;

    if (!transactionSn) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Parameter transaction_sn diperlukan. Contoh: /cekpembayaran/transaction_sn=117324352315795435' }));
      return;
    }

    try {
      const result = await checkPayment(transactionSn);
      const txData = extractTransactionData(result);
      const orderStatus = txData.order_status !== undefined ? txData.order_status : null;

      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'success',
        transaction_sn: transactionSn,
        order_status: orderStatus,
        paid: orderStatus === 1,
        amount: txData.amount || null,
        amount_txt: txData.amount_txt || null,
        complete_time: txData.complete_time || null,
        real_amount: txData.real_amount || null,
        transaction_data: txData,
        raw: result
      }, null, 2));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Gagal mengecek pembayaran', detail: e.message }));
    }
    return;
  }

  if (pathname === '/') {
    const fs = require('fs');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync('./index.html'));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Endpoint tidak ditemukan', endpoints: ['/createqris/amount=X', '/cekpembayaran/transaction_sn=X'] }));
});

server.listen(2007, () => {
  console.log('Server QRIS Dinamis running on http://localhost:2007');
  console.log('Endpoints:');
  console.log('  Create QRIS:  http://localhost:2007/createqris/amount=1000');
  console.log('  Cek Bayar:    http://localhost:2007/cekpembayaran/transaction_sn=<order_sn>');
});
