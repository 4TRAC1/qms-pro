// api/generate.js — Vercel serverless function
// Securely proxies requests to Anthropic API so the key never reaches the browser.

export const config = {
  runtime: 'edge',
};

const SYSTEM_DEFAULT = `You are QMS Pro AI — an expert quality management system document generator for an ISO 9001:2015, IATF 16949, and AS9145 certified manufacturer.

Generate precise, professional compliance documents. Always:
- Structure output with === SECTION NAME === headers
- Mark passing results: ✓ PASS, failing: ✗ FAIL, issues: ⚠ WARNING:
- Reference specific standard clauses (e.g. ISO 9001:2015 Cl. 8.6)
- For PSW: validate all 18 AIAG elements explicitly
- For 8D: include all 8 disciplines with 5-Why in D4
- For COA: evaluate every test result vs specification
- End with === AI REVIEW NOTES === containing compliance observations and audit pitfall warnings
- Be complete but concise (350-600 words of content)`;

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { system, userContent } = body;

  if (!userContent) {
    return new Response(JSON.stringify({ error: 'userContent is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: system || SYSTEM_DEFAULT,
      messages: [{ role: 'user', content: userContent }],
      stream: true,
    }),
  });

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text();
    return new Response(JSON.stringify({ error: err }), {
      status: anthropicRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Stream the SSE response straight back to the client
  return new Response(anthropicRes.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
