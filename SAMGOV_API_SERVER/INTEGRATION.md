# SAM.gov API Server — Third-Party Integration Guide

This document covers everything a third-party website or application needs to integrate with, authenticate against, and consume data from this API server.

---

## Table of Contents

- [Overview](#overview)
- [Getting an API Key](#getting-an-api-key)
- [Authentication Model](#authentication-model)
- [Making API Requests](#making-api-requests)
- [Available Endpoints](#available-endpoints)
- [Response Formats](#response-formats)
- [Error Handling](#error-handling)
- [Subscription Lifecycle](#subscription-lifecycle)
- [Rate Limiting & Fair Use](#rate-limiting--fair-use)
- [CORS Configuration](#cors-configuration)
- [Code Examples](#code-examples)
  - [JavaScript / Fetch](#javascript--fetch)
  - [Node.js / Axios](#nodejs--axios)
  - [Python / requests](#python--requests)
  - [PHP / cURL](#php--curl)
- [Self-Service Subscription via Stripe](#self-service-subscription-via-stripe)
- [Webhook Notifications (Optional)](#webhook-notifications-optional)
- [Security Best Practices](#security-best-practices)

---

## Overview

The SAM.gov API Server proxies and transforms data from the U.S. government SAM.gov procurement database. It provides structured JSON responses for contract opportunities, award data, organization details, and NAICS/PSC code lookups.

**Base URL:** `https://your-api-domain.com` *(replace with the actual deployed server URL)*

All protected endpoints require a valid API key sent on every request.

---

## Getting an API Key

There are two ways to obtain an API key:

### Option 1 — Self-Service via Stripe (Recommended)

1. Register for an account: `POST /auth/register`
2. Start a subscription checkout: `POST /stripe/create-checkout-session` *(requires login JWT)*
3. Complete payment in the Stripe-hosted checkout
4. Your API key is automatically provisioned and returned via `GET /subscriptions/my`

### Option 2 — Admin-Provisioned Key

Contact the API administrator to have a subscription and key created manually. You will receive:
- Your API key string (format: `cgapi_<64-hex-chars>`)
- Subscription start and expiration dates
- Your assigned plan tier

---

## Authentication Model

This server uses **two separate authentication mechanisms** depending on what you are doing:

| Use Case | Mechanism | Header / Parameter |
|---|---|---|
| Querying SAM.gov data endpoints | **API Key** | `X-API-Key: cgapi_...` |
| Managing your account/subscription | **JWT Bearer Token** | `Authorization: Bearer <token>` |

For typical third-party data integrations, **only the API key is required**. JWT login is only needed if your system needs to manage subscriptions or account details programmatically.

---

## Making API Requests

### Required Header

Every request to a protected data endpoint **must** include your API key:

```http
X-API-Key: cgapi_e9918fca1f58e3e2e0c61ae4e09d6d784865b50e96d44e4c7a5f83ae45f6aed1
```

Alternatively, pass it as a query parameter (less preferred — avoid in browser URLs):

```
POST /api/search?apiKey=cgapi_...
```

### Content Type

All request bodies must be JSON:

```http
Content-Type: application/json
```

---

## Available Endpoints

All data endpoints use `POST` with a JSON body.

### Search Opportunities

```
POST /api/search
```

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `q` | String | No | Keyword search term |
| `qMode` | String | No | `ALL` (default), `EXACT`, or `ANY` |
| `page` | Number | No | 0-based page number (default: `0`) |
| `size` | Number | No | Results per page, 1–1000 (default: `25`) |
| `sort` | String | No | Comma-separated fields, prefix `-` for descending (e.g. `-modifiedDate`) |
| `is_active` | Boolean | No | Filter active/inactive opportunities |
| `naics` | String | No | Comma-separated NAICS codes (e.g. `"54151,54152"`) |
| `psc` | String | No | Product and Service Code |
| `notice_type` | String | No | Comma-separated codes: `r,s,p,i,o,k,a,u,g` |
| `response_date.from` | String | No | `YYYY-MM-DD-HH:MM` |
| `response_date.to` | String | No | `YYYY-MM-DD-HH:MM` |
| `modified_date.from` | String | No | `YYYY-MM-DD-HH:MM` |
| `modified_date.to` | String | No | `YYYY-MM-DD-HH:MM` |
| `includeFullDetails` | Boolean | No | Fetch award/history/related data per result (slower) |

---

### Get Opportunity Details

```
POST /api/opportunity/:noticeId
```

Returns full normalized data for a single opportunity including description, contacts, resource attachments, and award status.

---

### Get Award Details

```
POST /api/opportunity/:noticeId/award
```

---

### Get Opportunity History / Amendments

```
POST /api/opportunity/:noticeId/history
```

---

### Get Related Opportunities

```
POST /api/opportunity/:noticeId/related
```

---

### Get Organization Details

```
POST /api/organization/:organizationId
```

---

### Look Up NAICS Code

```
POST /api/naics
```

**Request body:** `{ "q": "541511" }`

---

### Look Up PSC Code

```
POST /api/psc
```

**Request body:** `{ "q": "D302" }`

---

### Natural Language Agent Query

```
POST /api/agent
```

**Request body:** `{ "query": "Show me IT software solicitations closing in the next 30 days" }`

Returns AI-interpreted search results with structured cards, summaries, and an auto-generated Excel export link.

---

## Response Formats

### Search Response

```json
{
  "opportunitiesData": [
    {
      "noticeId": "abc123",
      "title": "Software Development Services",
      "type": "Solicitation",
      "postedDate": "2025-06-01",
      "responseDeadLine": "2025-07-15T14:00:00-04:00",
      "naicsCode": "541511",
      "typeOfSetAsideDescription": "Small Business",
      "uiLink": "https://sam.gov/opp/abc123/view"
    }
  ],
  "pagination": {
    "totalElements": 142,
    "totalPages": 6,
    "number": 0,
    "size": 25
  }
}
```

### Opportunity Detail Response

```json
{
  "noticeId": "abc123",
  "title": "Software Development Services",
  "solicitationNumber": "FA8780-25-R-0001",
  "active": "true",
  "type": "Solicitation",
  "organizationHierarchy": "DEPT OF DEFENSE::DEPT OF THE AIR FORCE",
  "postedDate": "2025-06-01",
  "responseDeadLine": "2025-07-15T14:00:00-04:00",
  "naicsCode": "541511",
  "classificationCode": "D302",
  "typeOfSetAside": "SBA",
  "typeOfSetAsideDescription": "Small Business",
  "placeOfPerformance": { "city": "Arlington", "state": "VA" },
  "description": "Full text description...",
  "pointOfContact": [
    { "type": "primary", "email": "poc@agency.gov", "fullName": "Jane Smith" }
  ],
  "resourceLinks": [
    {
      "name": "Statement of Work.pdf",
      "mimeType": "application/pdf",
      "size": 1048576,
      "downloadUrl": "https://sam.gov/api/..."
    }
  ],
  "uiLink": "https://sam.gov/opp/abc123/view"
}
```

### Error Response

```json
{
  "error": "Descriptive error message"
}
```

---

## Error Handling

| HTTP Status | Meaning | Action |
|---|---|---|
| `200` | Success | Process response normally |
| `400` | Bad request (missing/invalid parameters) | Fix request body |
| `401` | Missing or invalid API key | Check key is correct and included |
| `403` | Key exists but subscription expired, suspended, or not yet started | Contact admin or renew via Stripe portal |
| `404` | Resource not found | Verify the ID |
| `500` | Server error | Retry with exponential backoff; contact support if persistent |

---

## Subscription Lifecycle

Your API key reflects your subscription status. Requests will be rejected with `403` if:

| Status | Cause | Resolution |
|---|---|---|
| `expired` | Past the expiration date | Renew subscription via Stripe or contact admin |
| `suspended` | Payment failed | Update payment method in the Stripe Customer Portal |
| `cancelled` | Manually cancelled | Purchase a new subscription |

You can check your own subscription status at any time:

```
GET /subscriptions/my
Authorization: Bearer <your-jwt-token>
```

---

## Rate Limiting & Fair Use

There are currently no hard rate limits enforced. However:
- Every API key request increments a `totalRequests` counter on your subscription record
- Abusive usage patterns may result in key suspension
- Implement client-side caching for frequently repeated queries

---

## CORS Configuration

The server has CORS enabled globally. If the admin has restricted allowed origins, your domain must be whitelisted. Contact the administrator with your domain if you receive CORS errors from a browser-based integration.

For server-to-server integrations, CORS does not apply.

---

## Code Examples

### JavaScript / Fetch

```javascript
const API_BASE = 'https://your-api-domain.com';
const API_KEY  = 'cgapi_your_key_here';

async function searchOpportunities(query, options = {}) {
  const response = await fetch(`${API_BASE}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      q: query,
      qMode: 'ALL',
      is_active: true,
      size: 25,
      page: 0,
      ...options
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`API error ${response.status}: ${err.error}`);
  }

  return response.json();
}

// Usage
searchOpportunities('software development', { naics: '541511' })
  .then(data => console.log(data.opportunitiesData))
  .catch(console.error);
```

---

### Node.js / Axios

```javascript
const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://your-api-domain.com',
  headers: {
    'X-API-Key': process.env.SAMGOV_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Search
const { data } = await apiClient.post('/api/search', {
  q: 'cybersecurity',
  is_active: true,
  size: 10
});

// Get details
const { data: detail } = await apiClient.post(`/api/opportunity/${noticeId}`);

// NAICS lookup
const { data: naics } = await apiClient.post('/api/naics', { q: '541511' });
```

---

### Python / requests

```python
import requests
import os

API_BASE = "https://your-api-domain.com"
API_KEY  = os.environ.get("SAMGOV_API_KEY")

HEADERS = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

def search_opportunities(query, **kwargs):
    payload = {"q": query, "is_active": True, "size": 25, **kwargs}
    resp = requests.post(f"{API_BASE}/api/search", json=payload, headers=HEADERS)
    resp.raise_for_status()
    return resp.json()

def get_opportunity(notice_id):
    resp = requests.post(f"{API_BASE}/api/opportunity/{notice_id}", headers=HEADERS)
    resp.raise_for_status()
    return resp.json()

# Usage
results = search_opportunities("IT services", naics="541512", size=10)
for opp in results["opportunitiesData"]:
    print(opp["title"], opp["uiLink"])
```

---

### PHP / cURL

```php
<?php
define('API_BASE', 'https://your-api-domain.com');
define('API_KEY',  getenv('SAMGOV_API_KEY'));

function samgov_request(string $endpoint, array $body): array {
    $ch = curl_init(API_BASE . $endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($body),
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'X-API-Key: ' . API_KEY,
        ],
    ]);
    $response = curl_exec($ch);
    $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($status !== 200) {
        throw new RuntimeException("API error $status: $response");
    }
    return json_decode($response, true);
}

// Search
$results = samgov_request('/api/search', [
    'q'         => 'construction',
    'is_active' => true,
    'size'      => 10,
]);

foreach ($results['opportunitiesData'] as $opp) {
    echo $opp['title'] . "\n";
}
```

---

## Self-Service Subscription via Stripe

If your integration needs to allow end-users to subscribe and receive API keys automatically, implement this flow:

### Step 1 — Register a user account

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword1!",
  "name": "Jane Developer",
  "company": "Acme Corp"
}
```

Response:
```json
{ "token": "<jwt>", "user": { "id": "...", "email": "..." } }
```

### Step 2 — Start Stripe Checkout

```http
POST /stripe/create-checkout-session
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "priceId": "price_monthly_or_annual"
}
```

Response:
```json
{ "url": "https://checkout.stripe.com/pay/...", "sessionId": "cs_..." }
```

Redirect the user to `url`. After successful payment, Stripe calls the server webhook, which automatically creates the subscription and API key.

### Step 3 — Retrieve the API key

```http
GET /subscriptions/my
Authorization: Bearer <jwt>
```

Response:
```json
{
  "subscriptions": [
    {
      "id": "uuid",
      "apiKey": "cgapi_...",
      "plan": "monthly",
      "status": "active",
      "startsAt": "2025-06-01T00:00:00.000Z",
      "expiresAt": "2025-07-01T00:00:00.000Z",
      "totalRequests": 0,
      "lastUsedAt": null
    }
  ]
}
```

Store the `apiKey` securely in your system (e.g. environment variable or encrypted secrets store). Use it on every API call.

### Step 4 — Manage billing

To allow users to update payment methods or cancel:

```http
POST /stripe/create-portal-session
Authorization: Bearer <jwt>
```

Response:
```json
{ "url": "https://billing.stripe.com/session/..." }
```

Redirect the user to the Stripe Customer Portal URL.

---

## Webhook Notifications (Optional)

If you want your system to be notified when a subscription's status changes (e.g. renewal, cancellation, payment failure), you can build a webhook receiver on your end and ask the API administrator to notify you of status changes. Currently this server manages Stripe events internally — contact the administrator to arrange outbound status notifications.

---

## Security Best Practices

- **Never expose your API key in client-side code** (browser JavaScript, mobile apps). Always proxy requests through your own backend.
- **Store the key as an environment variable** — never hard-code it in source files committed to version control.
- **Rotate keys** if you suspect a key has been compromised by revoking it via `DELETE /subscriptions/my/:id` and requesting a new one.
- **Use HTTPS** for all communication with the API server. Never send the key over plain HTTP.
- **Implement response caching** on your end for static/slow-changing data (NAICS, PSC, organization details) to minimize API consumption.
- **Validate API responses** before trusting the data — check for `error` fields and HTTP status codes before processing.

---

## Checklist for a New Integration

- [ ] Obtain API key (via Stripe checkout or admin provisioning)
- [ ] Store key securely as an environment variable on your server
- [ ] Set base URL to the production server address
- [ ] Add `X-API-Key` header to all requests
- [ ] Implement error handling for `401`, `403`, `500` responses
- [ ] Test with `POST /api/naics` `{ "q": "541511" }` — should return NAICS data
- [ ] Implement retry logic with backoff for `500` errors
- [ ] Never expose the key in frontend code or logs

---

*Last Updated: June 2026*
