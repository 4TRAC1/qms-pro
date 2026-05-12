// api/generate.js — Vercel serverless function
// Proxies requests to Anthropic API. Uses non-streaming JSON for reliability.

export const config = {
  runtime: 'edge',
};

const ALLOWED_ORIGIN = '*';

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured on the server.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
    });
  }

  const { system, userContent } = body;

  if (!userContent) {
    return new Response(JSON.stringify({ error: 'userContent is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
    });
  }

  const SYSTEM_DEFAULT = `You are QMS Pro AI — an expert quality management system document generator for manufacturers certified to ISO 9001:2015, IATF 16949, and AS9145.

Generate precise, professional compliance documents. Always:
- Structure output with === SECTION NAME === headers
- Mark results: ✓ PASS for conforming, ✗ FAIL for nonconforming, ⚠ WARNING: for risks
- Reference specific standard clauses (e.g. ISO 9001:2015 Cl. 8.6)
- For PSW: validate all 18 AIAG PPAP elements explicitly
- For 8D: include all 8 disciplines with a full 5-Why root cause in D4
- For COA: evaluate every test result against specification with PASS or FAIL
- End every document with === AI REVIEW NOTES === containing compliance observations and audit pitfall warnings
- Be complete but concise (400-600 words)`;

  let anthropicRes;
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        system: system || SYSTEM_DEFAULT,
        messages: [{ role: 'user', content: userContent }],
        stream: false,
      }),
    });
  } catch (fetchErr) {
    return new Response(JSON.stringify({ error: `Failed to reach Anthropic API: ${fetchErr.message}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
    });
  }

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    return new Response(JSON.stringify({ error: `Anthropic API error ${anthropicRes.status}: ${errText}` }), {
      status: anthropicRes.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
    });
  }

  const data = await anthropicRes.json();
  const text = data?.content?.[0]?.text ?? '';

  return new Response(JSON.stringify({ text }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
  });
}
