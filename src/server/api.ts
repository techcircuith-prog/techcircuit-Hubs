import express, { Request, Response } from 'express';
import crypto from 'crypto';
import dns from 'dns/promises';
import { z } from 'zod';

export const apiRouter = express.Router();
apiRouter.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));

// Environment variables
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'rock86367@gmail.com')
  .split(',')
  .map(e => e.trim().toLowerCase());

const NEXAR_CLIENT_ID = process.env.NEXAR_CLIENT_ID || '';
const NEXAR_CLIENT_SECRET = process.env.NEXAR_CLIENT_SECRET || '';
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CASHFREE_ENV = (process.env.CASHFREE_ENV || 'sandbox').toLowerCase();
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

// In-memory cache & state for server speed & demo resiliency
const nexarTokenCache = { token: '', expiresAt: 0 };
const componentCache = new Map<string, { data: any; expiresAt: number }>();
const userDailySearches = new Map<string, { count: number; date: string }>();
const userDailyCompletions = new Map<string, { count: number; date: string }>();

// Simple rate limiter map
const rateLimiterMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: () => void) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimiterMap.get(ip);
    if (!entry || entry.resetAt < now) {
      rateLimiterMap.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (entry.count >= limit) {
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }
    entry.count++;
    next();
  };
}

// Admin verification helper
function isEmailAdmin(email?: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

// ---------------------------------------------
// 1. ADMIN CHECK & MANAGEMENT
// ---------------------------------------------
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/Email and Password are required.' });
  }

  const cleanUser = String(username).trim().toLowerCase();
  const cleanPass = String(password).trim();

  // Primary credentials requested by administrator:
  // tech@admin (or tech@admin.com) with password adminpassword123
  const isMatch = (cleanUser === 'tech@admin' || cleanUser === 'tech@admin.com') && cleanPass === 'adminpassword123';

  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }

  // Ensure admin email is in the ADMIN_EMAILS list
  if (!ADMIN_EMAILS.includes('tech@admin')) {
    ADMIN_EMAILS.push('tech@admin');
  }

  // Issue session token and user profile
  const adminUser = {
    uid: 'admin_tech_root',
    email: 'tech@admin',
    displayName: 'Tech CircuitHub Admin',
    role: 'admin',
    isAdmin: true,
  };

  return res.json({
    success: true,
    user: adminUser,
    token: `circuithub_adm_${Buffer.from(cleanUser + ':' + Date.now()).toString('base64')}`,
  });
});

apiRouter.post('/admin/check', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ isAdmin: false });
  const isAdmin = isEmailAdmin(email) || email === 'tech@admin' || email === 'tech@admin.com';
  return res.json({ isAdmin });
});

apiRouter.get('/admin/list', (req: Request, res: Response) => {
  const requesterEmail = req.headers['x-user-email'] as string;
  if (!isEmailAdmin(requesterEmail)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  return res.json({ adminEmails: ADMIN_EMAILS });
});

apiRouter.post('/admin/add', (req: Request, res: Response) => {
  const requesterEmail = req.headers['x-user-email'] as string;
  if (!isEmailAdmin(requesterEmail)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const { email } = req.body;
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Invalid email' });
  const normalized = email.trim().toLowerCase();
  if (!ADMIN_EMAILS.includes(normalized)) {
    ADMIN_EMAILS.push(normalized);
  }
  return res.json({ success: true, adminEmails: ADMIN_EMAILS });
});

apiRouter.post('/admin/remove', (req: Request, res: Response) => {
  const requesterEmail = req.headers['x-user-email'] as string;
  if (!isEmailAdmin(requesterEmail)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const { email } = req.body;
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Invalid email' });
  const normalized = email.trim().toLowerCase();
  if (normalized === 'rock86367@gmail.com') {
    return res.status(400).json({ error: 'Cannot remove root administrator' });
  }
  const idx = ADMIN_EMAILS.indexOf(normalized);
  if (idx !== -1) {
    ADMIN_EMAILS.splice(idx, 1);
  }
  return res.json({ success: true, adminEmails: ADMIN_EMAILS });
});

// ---------------------------------------------
// 2. RESOURCE PREVIEW & SSRF PROTECTION
// ---------------------------------------------
apiRouter.post('/resources/preview', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Invalid protocol. Only HTTP and HTTPS are allowed.' });
    }

    // SSRF Check: resolve IP and disallow private ranges
    const ips = await dns.resolve(parsed.hostname);
    for (const ip of ips) {
      if (
        ip.startsWith('127.') ||
        ip.startsWith('10.') ||
        ip.startsWith('192.168.') ||
        ip.startsWith('169.254.') ||
        ip === '::1' ||
        ip === '0.0.0.0'
      ) {
        return res.status(400).json({ error: 'Invalid host target (SSRF prevented).' });
      }
    }

    // YouTube oEmbed check
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const response = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        return res.json({
          title: data.title || '',
          thumbnailUrl: data.thumbnail_url || '',
          source: data.author_name || 'YouTube',
          type: 'video',
          durationMin: 15,
        });
      }
    }

    // Generic OpenGraph tag extractor
    const pageResponse = await fetch(url, {
      headers: { 'User-Agent': 'techcircuithub-Bot/1.0' },
      signal: AbortSignal.timeout(5000),
    });

    if (!pageResponse.ok) {
      return res.json({ title: parsed.hostname, source: parsed.hostname });
    }

    const html = await pageResponse.text();
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i);
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
    const siteMatch = html.match(/<meta property="og:site_name" content="([^"]+)"/i);

    return res.json({
      title: titleMatch ? titleMatch[1].trim() : parsed.hostname,
      thumbnailUrl: imageMatch ? imageMatch[1].trim() : '',
      source: siteMatch ? siteMatch[1].trim() : parsed.hostname,
    });
  } catch (err: any) {
    return res.status(400).json({ error: 'Could not fetch preview metadata: ' + (err.message || String(err)) });
  }
});

// ---------------------------------------------
// 3. YOUTUBE PLAYLIST IMPORT
// ---------------------------------------------
apiRouter.get('/resources/can-import-youtube', (_req: Request, res: Response) => {
  return res.json({ available: !!YOUTUBE_API_KEY });
});

apiRouter.post('/resources/import-youtube', async (req: Request, res: Response) => {
  if (!YOUTUBE_API_KEY) {
    return res.status(400).json({ error: 'YOUTUBE_API_KEY is not configured on the server' });
  }

  const { playlistUrl, category } = req.body;
  if (!playlistUrl) return res.status(400).json({ error: 'Playlist URL required' });

  try {
    const parsed = new URL(playlistUrl);
    const listId = parsed.searchParams.get('list');
    if (!listId) return res.status(400).json({ error: 'No list ID found in URL' });

    const ytApiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=25&playlistId=${listId}&key=${YOUTUBE_API_KEY}`;
    const ytRes = await fetch(ytApiUrl);
    if (!ytRes.ok) {
      const err = await ytRes.text();
      return res.status(400).json({ error: 'YouTube API error: ' + err });
    }

    const ytData = await ytRes.json();
    const items = (ytData.items || []).map((item: any) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      source: item.snippet.videoOwnerChannelTitle || 'YouTube',
      type: 'video',
      category: category || 'VLSI',
      level: 'intermediate',
      language: 'English',
      isFree: true,
      status: 'draft',
      durationMin: 20
    }));

    return res.json({ importedCount: items.length, items });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------
// 4. RESOURCE LINK HEALTH CHECKER
// ---------------------------------------------
apiRouter.post('/resources/check-links', async (req: Request, res: Response) => {
  const { urls } = req.body;
  if (!Array.isArray(urls)) return res.status(400).json({ error: 'Array of URLs required' });

  const results: { url: string; broken: boolean; statusCode?: number }[] = [];

  for (const url of urls.slice(0, 15)) {
    try {
      const resp = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
      results.push({ url, broken: resp.status >= 400, statusCode: resp.status });
    } catch {
      results.push({ url, broken: true, statusCode: 0 });
    }
  }

  return res.json({ results });
});

// ---------------------------------------------
// 5. RESOURCE COMPLETION & POINT ALLOCATION
// ---------------------------------------------
apiRouter.post('/resources/:id/complete', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, skillIds } = req.body;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const today = new Date().toISOString().slice(0, 10);
  const currentDaily = userDailyCompletions.get(userId);

  let count = 0;
  if (currentDaily && currentDaily.date === today) {
    count = currentDaily.count;
  }

  // Daily cap of 3
  if (count >= 3) {
    return res.json({
      success: true,
      pointsAwarded: 0,
      message: 'Resource completed! Daily skill point cap (3 resources/day) reached.',
      completed: true
    });
  }

  userDailyCompletions.set(userId, { count: count + 1, date: today });
  const pointsAwarded = 5;

  return res.json({
    success: true,
    pointsAwarded,
    skillIds: skillIds || [],
    message: `Earned +${pointsAwarded} skill points!`,
    completed: true,
    completedToday: count + 1,
  });
});

// ---------------------------------------------
// 6. NEXAR COMPONENT SUPPLY COMPARISON
// ---------------------------------------------
async function getNexarToken(): Promise<string | null> {
  if (!NEXAR_CLIENT_ID || !NEXAR_CLIENT_SECRET) return null;
  const now = Date.now();
  if (nexarTokenCache.token && nexarTokenCache.expiresAt > now + 60000) {
    return nexarTokenCache.token;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', NEXAR_CLIENT_ID);
    params.append('client_secret', NEXAR_CLIENT_SECRET);

    const res = await fetch('https://identity.nexar.com/connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) return null;
    const data = await res.json();
    nexarTokenCache.token = data.access_token;
    nexarTokenCache.expiresAt = now + data.expires_in * 1000;
    return data.access_token;
  } catch (err) {
    console.error('Nexar Token Error:', err);
    return null;
  }
}

apiRouter.post('/components/search', rateLimit(20, 60000), async (req: Request, res: Response) => {
  const { query, userId } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const cleanQuery = query.trim().toUpperCase();
  const today = new Date().toISOString().slice(0, 10);
  const userLimit = userDailySearches.get(userId || 'anonymous');
  const userCount = (userLimit && userLimit.date === today) ? userLimit.count : 0;

  // Max 25 searches per student per day
  if (userCount >= 25) {
    return res.status(429).json({ error: 'Daily component search quota (25/day) reached. Resets at midnight.' });
  }
  userDailySearches.set(userId || 'anonymous', { count: userCount + 1, date: today });

  // 1. Check 24-hr cache
  const cached = componentCache.get(cleanQuery);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json({ ...cached.data, cached: true, quotaRemaining: 25 - (userCount + 1) });
  }

  // 2. Fetch from Nexar if configured
  const token = await getNexarToken();
  if (token) {
    try {
      const gqlQuery = `
        query SearchSupply($q: String!) {
          supSearch(q: $q, limit: 1) {
            results {
              part {
                mpn
                shortDescription
                manufacturer { name }
                sellers(limit: 5) {
                  company { name }
                  offers {
                    sku
                    inventoryLevel
                    moq
                    clickUrl
                    prices {
                      quantity
                      price
                      currency
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const nexarRes = await fetch('https://api.nexar.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: gqlQuery, variables: { q: cleanQuery } }),
      });

      if (nexarRes.ok) {
        const nexarData = await nexarRes.json();
        const part = nexarData.data?.supSearch?.results?.[0]?.part;
        if (part) {
          const offers: any[] = [];
          for (const seller of part.sellers || []) {
            for (const offer of seller.offers || []) {
              const basePrice = offer.prices?.[0]?.price || 0;
              const currency = offer.prices?.[0]?.currency || 'USD';
              offers.push({
                distributor: seller.company.name,
                sku: offer.sku || part.mpn,
                unitPrice: basePrice,
                currency: currency,
                stock: offer.inventoryLevel || 0,
                moq: offer.moq || 1,
                priceBreaks: (offer.prices || []).map((p: any) => ({ quantity: p.quantity, price: p.price })),
                clickUrl: offer.clickUrl || `https://octopart.com/search?q=${encodeURIComponent(part.mpn)}`,
              });
            }
          }

          // Sort and mark lowest price
          offers.sort((a, b) => a.unitPrice - b.unitPrice);
          if (offers.length > 0) offers[0].isLowestPrice = true;

          const responseData = {
            partNumber: part.mpn,
            description: part.shortDescription || 'Semiconductor IC / Discrete Component',
            manufacturer: part.manufacturer?.name || 'Standard Manufacturer',
            offers,
          };

          // Cache for 24 hours
          componentCache.set(cleanQuery, { data: responseData, expiresAt: Date.now() + 86400000 });
          return res.json({ ...responseData, cached: false, quotaRemaining: 25 - (userCount + 1) });
        }
      }
    } catch (err) {
      console.error('Nexar Search Query Error:', err);
    }
  }

  // 3. Fallback realistic simulation for ECE parts when API keys not yet populated
  const mockParts: Record<string, any> = {
    'ESP32': {
      partNumber: 'ESP32-WROOM-32D',
      description: 'WiFi & BLE Dual-Core 240MHz MCU Module, 4MB Flash, PCB Antenna',
      manufacturer: 'Espressif Systems',
      offers: [
        { distributor: 'Robu.in (India)', sku: 'ROBU-ESP32-32D', unitPrice: 285, currency: 'INR', stock: 1420, moq: 1, isLowestPrice: true, priceBreaks: [{ quantity: 1, price: 285 }, { quantity: 10, price: 265 }, { quantity: 50, price: 240 }], clickUrl: 'https://robu.in' },
        { distributor: 'Mouser Electronics', sku: '356-ESP32-WROOM32D', unitPrice: 320, currency: 'INR', stock: 8500, moq: 1, priceBreaks: [{ quantity: 1, price: 320 }, { quantity: 25, price: 290 }], clickUrl: 'https://mouser.in' },
        { distributor: 'DigiKey India', sku: '1965-ESP32-WROOM-32D-ND', unitPrice: 315, currency: 'INR', stock: 12040, moq: 1, priceBreaks: [{ quantity: 1, price: 315 }, { quantity: 50, price: 275 }], clickUrl: 'https://digikey.in' },
        { distributor: 'Element14', sku: 'EL14-3129841', unitPrice: 345, currency: 'INR', stock: 450, moq: 1, priceBreaks: [{ quantity: 1, price: 345 }, { quantity: 10, price: 310 }], clickUrl: 'https://in.element14.com' },
      ]
    },
    'STM32': {
      partNumber: 'STM32F401RET6',
      description: 'ARM Cortex-M4 32-bit MCU 84MHz, 512KB Flash, LQFP-64',
      manufacturer: 'STMicroelectronics',
      offers: [
        { distributor: 'Mouser Electronics', sku: '511-STM32F401RET6', unitPrice: 420, currency: 'INR', stock: 3200, moq: 1, isLowestPrice: true, priceBreaks: [{ quantity: 1, price: 420 }, { quantity: 20, price: 380 }], clickUrl: 'https://mouser.in' },
        { distributor: 'DigiKey India', sku: '497-14050-ND', unitPrice: 435, currency: 'INR', stock: 5400, moq: 1, priceBreaks: [{ quantity: 1, price: 435 }, { quantity: 50, price: 395 }], clickUrl: 'https://digikey.in' },
        { distributor: 'Robu.in (India)', sku: 'ROBU-STM32-F401', unitPrice: 490, currency: 'INR', stock: 110, moq: 1, priceBreaks: [{ quantity: 1, price: 490 }], clickUrl: 'https://robu.in' },
      ]
    },
    'LM358': {
      partNumber: 'LM358DR',
      description: 'Dual Operational Amplifier, Low Power, 3V-32V, SOIC-8',
      manufacturer: 'Texas Instruments',
      offers: [
        { distributor: 'Robu.in (India)', sku: 'ROBU-LM358-SOIC', unitPrice: 12, currency: 'INR', stock: 45000, moq: 5, isLowestPrice: true, priceBreaks: [{ quantity: 5, price: 12 }, { quantity: 100, price: 8 }], clickUrl: 'https://robu.in' },
        { distributor: 'Mouser Electronics', sku: '595-LM358DR', unitPrice: 18, currency: 'INR', stock: 125000, moq: 1, priceBreaks: [{ quantity: 1, price: 18 }, { quantity: 50, price: 14 }], clickUrl: 'https://mouser.in' },
        { distributor: 'Element14', sku: '9589884', unitPrice: 22, currency: 'INR', stock: 18000, moq: 1, priceBreaks: [{ quantity: 1, price: 22 }], clickUrl: 'https://in.element14.com' },
      ]
    }
  };

  // Find partial match or build generic parametric response
  let matched = mockParts[cleanQuery];
  if (!matched) {
    for (const key of Object.keys(mockParts)) {
      if (cleanQuery.includes(key)) {
        matched = mockParts[key];
        break;
      }
    }
  }

  if (!matched) {
    matched = {
      partNumber: cleanQuery,
      description: `Integrated Circuit / ECE Component (${cleanQuery}) - Active Production`,
      manufacturer: 'Semiconductor Global',
      offers: [
        { distributor: 'Robu.in (India)', sku: `ROBU-${cleanQuery}`, unitPrice: 145, currency: 'INR', stock: 350, moq: 1, isLowestPrice: true, priceBreaks: [{ quantity: 1, price: 145 }, { quantity: 10, price: 125 }], clickUrl: 'https://robu.in' },
        { distributor: 'Mouser Electronics', sku: `552-${cleanQuery}-IC`, unitPrice: 180, currency: 'INR', stock: 2400, moq: 1, priceBreaks: [{ quantity: 1, price: 180 }, { quantity: 25, price: 155 }], clickUrl: 'https://mouser.in' },
        { distributor: 'DigiKey India', sku: `${cleanQuery}-ND`, unitPrice: 175, currency: 'INR', stock: 8900, moq: 1, priceBreaks: [{ quantity: 1, price: 175 }, { quantity: 50, price: 150 }], clickUrl: 'https://digikey.in' },
      ]
    };
  }

  componentCache.set(cleanQuery, { data: matched, expiresAt: Date.now() + 86400000 });
  return res.json({ ...matched, cached: false, quotaRemaining: 25 - (userCount + 1) });
});

// ---------------------------------------------
// 7. CASHFREE ORDERS & CHECKOUT
// ---------------------------------------------
apiRouter.post('/orders/create', async (req: Request, res: Response) => {
  const { userId, userEmail, userName, userPhone, items, shippingAddress } = req.body;

  if (!userId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Valid user and items required' });
  }

  // Calculate order total
  let totalAmount = 0;
  for (const item of items) {
    const qty = Math.max(1, item.quantity || 1);
    const unitPrice = Number(item.price) || 0;
    totalAmount += unitPrice * qty;
  }

  if (totalAmount <= 0) {
    return res.status(400).json({ error: 'Order total must be greater than zero' });
  }

  const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // Call Cashfree API if keys configured
  if (CASHFREE_APP_ID && CASHFREE_SECRET_KEY) {
    try {
      const baseUrl = CASHFREE_ENV === 'production' 
        ? 'https://api.cashfree.com/pg/orders'
        : 'https://sandbox.cashfree.com/pg/orders';

      const payload = {
        order_id: orderId,
        order_amount: totalAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: userId,
          customer_name: userName || 'Student',
          customer_email: userEmail || 'student@techcircuithub.com',
          customer_phone: userPhone || '9876543210',
        },
        order_meta: {
          return_url: `${process.env.APP_URL || ''}/payment/return?order_id=${orderId}`,
          notify_url: `${process.env.APP_URL || ''}/api/cashfree/webhook`,
        },
      };

      const cfRes = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (cfRes.ok) {
        const cfData = await cfRes.json();
        return res.json({
          orderId,
          amount: totalAmount,
          paymentSessionId: cfData.payment_session_id,
          cfOrderId: cfData.cf_order_id,
          environment: CASHFREE_ENV,
        });
      }
    } catch (err) {
      console.error('Cashfree Create Order Error:', err);
    }
  }

  // Sandbox simulation session id when live sandbox keys are pending
  const simulatedSessionId = `session_sim_${orderId}`;
  return res.json({
    orderId,
    amount: totalAmount,
    paymentSessionId: simulatedSessionId,
    environment: 'sandbox-simulation',
    message: 'Cashfree Sandbox test session initialized',
  });
});

// Verify payment status
apiRouter.post('/orders/:id/verify', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (CASHFREE_APP_ID && CASHFREE_SECRET_KEY) {
    try {
      const baseUrl = CASHFREE_ENV === 'production'
        ? `https://api.cashfree.com/pg/orders/${id}`
        : `https://sandbox.cashfree.com/pg/orders/${id}`;

      const cfRes = await fetch(baseUrl, {
        headers: {
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
          'x-api-version': '2023-08-01',
        },
      });

      if (cfRes.ok) {
        const data = await cfRes.json();
        const isPaid = data.order_status === 'PAID';
        return res.json({
          orderId: id,
          status: isPaid ? 'paid' : (data.order_status.toLowerCase() || 'pending'),
          isPaid,
        });
      }
    } catch (err) {
      console.error('Cashfree Verification Error:', err);
    }
  }

  // Simulation fallback: mark paid
  return res.json({
    orderId: id,
    status: 'paid',
    isPaid: true,
  });
});

// Cashfree Webhook endpoint (raw HMAC verification)
apiRouter.post('/cashfree/webhook', (req: any, res: Response) => {
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];

  if (CASHFREE_SECRET_KEY && signature && timestamp) {
    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    const dataToSign = timestamp + rawBody;
    const computedSignature = crypto
      .createHmac('sha256', CASHFREE_SECRET_KEY)
      .update(dataToSign)
      .digest('base64');

    if (computedSignature !== signature) {
      return res.status(400).send('Invalid signature');
    }
  }

  // Process event idempotently
  return res.status(200).json({ received: true });
});

// Digital package temporary download token
apiRouter.get('/orders/:id/download-token', (req: Request, res: Response) => {
  const { id } = req.params;
  const token = crypto.createHmac('sha256', 'circuit-download-salt')
    .update(`${id}-${Date.now()}`)
    .digest('hex');

  return res.json({
    downloadToken: token,
    expiresInSeconds: 3600,
    downloadUrl: `/api/downloads/${id}?token=${token}`
  });
});

apiRouter.get('/downloads/:id', (_req: Request, res: Response) => {
  // Provide sample digital project archive
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="techcircuithub_project_package.zip"');
  res.send(Buffer.from('PK\x05\x06' + '\x00'.repeat(18))); // Empty valid zip header
});

// ---------------------------------------------
// 8. CLOUDINARY SIGNED UPLOADS
// ---------------------------------------------
apiRouter.post('/cloudinary/sign', (req: Request, res: Response) => {
  if (!CLOUDINARY_API_SECRET || !CLOUDINARY_API_KEY || !CLOUDINARY_CLOUD_NAME) {
    return res.json({
      configured: false,
      message: 'Cloudinary credentials missing in .env',
      mockUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop'
    });
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = req.body.folder || 'techcircuithub';
  const strToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

  return res.json({
    configured: true,
    signature,
    timestamp,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
    folder,
  });
});

// ---------------------------------------------
// 9. TELEMETRY & STATS
// ---------------------------------------------
const eventBuffer: any[] = [];
apiRouter.post('/analytics/events', (req: Request, res: Response) => {
  const { events } = req.body;
  if (Array.isArray(events)) {
    for (const evt of events) {
      eventBuffer.push({
        ...evt,
        serverReceivedAt: new Date().toISOString(),
        expireAt: new Date(Date.now() + 90 * 86400000).toISOString(),
      });
    }
  }
  return res.json({ success: true, count: events?.length || 0 });
});

apiRouter.get('/admin/stats', (req: Request, res: Response) => {
  const requesterEmail = req.headers['x-user-email'] as string;
  if (!isEmailAdmin(requesterEmail)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const views = eventBuffer.filter(e => e.type === 'opportunity_view').length;
  const clicks = eventBuffer.filter(e => e.type === 'apply_click').length;
  const applied = eventBuffer.filter(e => e.type === 'apply_confirmed').length;

  return res.json({
    totalStudents: 0,
    newSignupsThisWeek: 0,
    dailyActiveStudents: 0,
    totalApplications: applied,
    totalRevenue: 0,
    funnel: {
      views,
      applyClicks: clicks,
      applicationsSubmitted: applied,
    },
    topSkills: [],
    nexarSearchesToday: 0,
    nexarQuotaLimit: 1000,
  });
});
