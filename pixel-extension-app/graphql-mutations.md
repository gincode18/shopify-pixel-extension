# GraphQL Mutations for Web Pixel Management

## 1. Create Web Pixel (Activate Extension)

```graphql
mutation CreateWebPixel($webPixel: WebPixelInput!) {
  webPixelCreate(webPixel: $webPixel) {
    userErrors {
      code
      field
      message
    }
    webPixel {
      id
      settings
    }
  }
}
```

### Variables for Creating Web Pixel
```json
{
  "webPixel": {
    "settings": "{\"webhookUrl\":\"https://poc-shopify-wheat.vercel.app/webhook/shopify-events\",\"shopName\":\"my-development-store\"}"
  }
}
```

## 2. Update Web Pixel Settings

```graphql
mutation UpdateWebPixel($id: ID!, $webPixel: WebPixelInput!) {
  webPixelUpdate(id: $id, webPixel: $webPixel) {
    userErrors {
      code
      field
      message
    }
    webPixel {
      id
      settings
    }
  }
}
```

### Variables for Updating Web Pixel
```json
{
  "id": "gid://shopify/WebPixel/1",
  "webPixel": {
    "settings": "{\"webhookUrl\":\"https://your-new-webhook-url.com/webhook\",\"shopName\":\"updated-shop-name\"}"
  }
}
```

## 3. Query Existing Web Pixels

```graphql
query GetWebPixels {
  webPixels(first: 10) {
    edges {
      node {
        id
        settings
      }
    }
  }
}
```

## 4. Delete Web Pixel

```graphql
mutation DeleteWebPixel($id: ID!) {
  webPixelDelete(id: $id) {
    userErrors {
      code
      field
      message
    }
    deletedWebPixelId
  }
}
```

### Variables for Deleting Web Pixel
```json
{
  "id": "gid://shopify/WebPixel/1"
}
```
