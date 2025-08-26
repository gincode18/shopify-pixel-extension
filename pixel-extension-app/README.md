# Shopify Web Pixel Extension - Analytics Tracker

This Shopify app extension captures all events from your store and sends them to your webhook endpoint for analytics processing.

## Features

- **All Events Capture**: Subscribes to all Shopify events including page views, product views, cart actions, checkout events, etc.
- **Webhook Integration**: Sends captured events to your specified webhook URL
- **Rich Event Data**: Includes customer info, browser data, page context, and more
- **Privacy Compliant**: Configured with proper privacy settings for analytics and marketing purposes
- **Error Handling**: Robust error handling with console logging for debugging

## Getting Started

### Prerequisites

1. [Partner account](https://partners.shopify.com/signup) 
2. [Development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store)
3. [Shopify CLI 3.50+](https://shopify.dev/docs/apps/tools/cli) installed
4. [Node.js 18+](https://nodejs.org/en/download/) installed

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# This will:
# - Connect to your development store
# - Build and serve your extension
# - Provide a preview URL for your app
```

### Configure Extension Settings

Your extension is configured with two settings fields:

- **Webhook URL**: Your server endpoint to receive events (default: https://poc-shopify-wheat.vercel.app/webhook/shopify-events)
- **Shop Name**: Identifier for your shop (used in event payload)

### Activate the Web Pixel

After starting the dev server and installing the app on your development store:

1. **Accept Permissions**: Click "Update app" to accept the required access scopes
2. **Create Web Pixel**: Use GraphQL to activate the pixel (see `graphql-mutations.md`)
3. **Verify Status**: Check Settings > Customer events in your store admin

### Testing

1. **Open Development Store**: Navigate to your store's frontend
2. **Open Browser Console**: Right-click > Inspect > Console
3. **Perform Actions**: Browse products, add to cart, etc.
4. **Check Console**: You should see logs like:
   ```
   Custom pixel script loaded for shop: my-store
   Shopify event captured: page_viewed
   Event successfully sent to webhook: page_viewed
   ```
5. **Monitor Webhook**: Check your webhook endpoint to verify events are being received

## Event Payload Structure

Each event sent to your webhook includes:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "shop": "my-store",
  "eventName": "product_viewed",
  "eventData": { /* Full Shopify event object */ },
  "customerId": "customer_id_if_logged_in",
  "clientId": "unique_browser_id",
  "url": "https://shop.myshopify.com/products/example",
  "userAgent": "Mozilla/5.0...",
  "page": {
    "title": "Product Name - Store Name",
    "referrer": "https://google.com"
  },
  "viewport": { "height": 768, "width": 1024 },
  "screen": { "height": 1080, "width": 1920 }
}
```

## Privacy Configuration

- **Analytics**: `true` - Collects interaction data
- **Marketing**: `true` - Supports marketing communications  
- **Preferences**: `false` - Not used for personalization
- **Sale of Data**: `enabled` - Participates in data sharing

## File Structure

```
pixel-extension-app/
├── extensions/
│   └── analytics-pixel/
│       ├── src/
│       │   └── index.js          # Main pixel script
│       └── shopify.extension.toml # Extension configuration
├── shopify.app.toml              # App configuration
├── graphql-mutations.md          # GraphQL examples
└── README.md                     # This file
```

## Deployment

```bash
# Deploy to production
npm run deploy
```

## Resources

- [Web Pixel API](https://shopify.dev/docs/api/web-pixels-api)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql)
