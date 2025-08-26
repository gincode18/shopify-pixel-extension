# Shopify Web Pixel Extension - Analytics Tracker

This Shopify app extension captures all events from your store and sends them to your webhook endpoint for analytics processing.

## Features

- **All Events Capture**: Subscribes to all Shopify events including page views, product views, cart actions, checkout events, etc.
- **Webhook Integration**: Sends captured events to your specified webhook URL
- **Rich Event Data**: Includes customer info, browser data, page context, and more
- **Privacy Compliant**: Configured with proper privacy settings for analytics and marketing purposes
- **Error Handling**: Robust error handling with console logging for debugging

## Setup Instructions

### 1. Prerequisites

- Partner account at [partners.shopify.com](https://partners.shopify.com)
- Development store created from Partner Dashboard
- Shopify CLI 3.50 or higher installed
- Node.js 18+ installed

### 2. Development Setup

```bash
# Start development server
shopify app dev

# This will:
# - Connect to your development store
# - Build and serve your extension
# - Provide a preview URL for your app
```

### 3. Configure Extension Settings

Your extension is configured with two settings fields:

- **Webhook URL**: Your server endpoint to receive events (default: https://poc-shopify-wheat.vercel.app/webhook/shopify-events)
- **Shop Name**: Identifier for your shop (used in event payload)

### 4. Activate the Web Pixel

After starting the dev server and installing the app on your development store:

1. **Accept Permissions**: Click "Update app" to accept the required access scopes
2. **Create Web Pixel**: Use GraphQL to activate the pixel (see GraphQL examples below)
3. **Verify Status**: Check Settings > Customer events in your store admin

### 5. GraphQL Activation

Use the following mutation in GraphiQL or your preferred GraphQL client:

```graphql
mutation {
  webPixelCreate(webPixel: { 
    settings: "{\"webhookUrl\":\"https://poc-shopify-wheat.vercel.app/webhook/shopify-events\",\"shopName\":\"my-store\"}" 
  }) {
    userErrors {
      code
      field
      message
    }
    webPixel {
      settings
      id
    }
  }
}
```

### 6. Testing

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

### 7. Event Payload Structure

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
  "pixelId": "pixel_event_label",
  "sessionId": "session_id",
  "page": {
    "title": "Product Name - Store Name",
    "referrer": "https://google.com",
    "location": "https://shop.myshopify.com/products/example"
  },
  "viewport": {
    "height": 768,
    "width": 1024
  },
  "screen": {
    "height": 1080,
    "width": 1920
  }
}
```

### 8. Deployment

```bash
# Deploy to production
shopify app deploy

# This creates an app version that can be distributed
```

## Monitored Events

The extension captures all Shopify events, with special attention to high-value events:

- `page_viewed`
- `product_viewed` 
- `product_added_to_cart`
- `checkout_started`
- `checkout_completed`
- `payment_info_submitted`

## Privacy Configuration

The extension is configured with:
- **Analytics**: `true` - Collects interaction data
- **Marketing**: `true` - Supports marketing communications  
- **Preferences**: `false` - Not used for personalization
- **Sale of Data**: `enabled` - Participates in data sharing (won't fire if customer opts out)

## Troubleshooting

### Extension Not Loading
- Check that access scopes include `write_pixels` and `read_customer_events`
- Verify the web pixel was created successfully via GraphQL
- Check browser console for any JavaScript errors

### Events Not Reaching Webhook
- Verify webhook URL is accessible and returns 200 status
- Check browser console for fetch errors
- Ensure webhook endpoint accepts POST requests with JSON payload
- Check CORS settings on your webhook server

### Permission Issues
- Redeploy your app configuration: `shopify app deploy`
- Reinstall the app on your development store
- Check that your Partner app has the correct access scopes configured

## File Structure

```
shopify-pixel-extension/
├── extensions/
│   └── analytics-pixel/
│       ├── src/
│       │   └── index.js          # Main pixel script
│       └── shopify.extension.toml # Extension configuration
├── shopify.app.toml              # App configuration
├── graphql-mutations.md          # GraphQL examples
└── README.md                     # This file
```

## Support

For issues related to:
- **Shopify API**: Check [Shopify GraphQL Admin API docs](https://shopify.dev/docs/api/admin-graphql)
- **Web Pixels**: See [Web Pixel API reference](https://shopify.dev/docs/api/web-pixels-api)
- **Events**: Review [Customer Events documentation](https://shopify.dev/docs/api/web-pixels-api/standard-events)
