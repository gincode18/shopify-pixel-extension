import { register } from '@shopify/web-pixels-extension';

// Generate a UUID v4 function using crypto.randomUUID with fallback
function generateUUID() {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    console.log('Using crypto.randomUUID for UUID generation');
    return crypto.randomUUID();
  }
  
  // Fallback for older environments
  console.log('Using fallback for UUID generation');
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Map Shopify events to MarkTag event types
function mapShopifyToMarkTagEvent(shopifyEventName, eventData) {
  const eventMappings = {
    // Cart events
    'product_added_to_cart': 'AddToCart',
    'product_removed_from_cart': 'RemoveFromCart',
    'cart_viewed': 'ViewCart',
    
    // Checkout events
    'checkout_started': 'BeginCheckout',
    'checkout_completed': 'Purchase',
    'checkout_address_info_submitted': 'AddShippingInfo',
    'checkout_contact_info_submitted': 'CompleteRegistration',
    'checkout_shipping_info_submitted': 'AddShippingInfo',
    'payment_info_submitted': 'AddPaymentInfo',
    
    // Product and content events
    'product_viewed': 'ViewItem',
    'collection_viewed': 'ViewContent',
    'page_viewed': 'ViewContent',
    'search_submitted': 'Search',
    
    // Account events
    'account_created': 'Signup',
    'login': 'Login',
    
    // Other events
    'alert_displayed': 'ViewContent',
    'ui_extension_errored': 'ViewContent'
  };
  
  return eventMappings[shopifyEventName] || 'ViewContent';
}

// Extract product data from Shopify event
function extractProducts(eventData, initData = null) {
  if (!eventData && !initData) return [];
  
  const products = [];
  console.log("extractProducts", eventData, initData);
  
  // Handle single cartLine (product_removed_from_cart, etc.)
  if (eventData?.cartLine) {
    products.push({
      id: eventData.cartLine.merchandise?.id?.toString(),
      name: eventData.cartLine.merchandise?.product?.title,
      category: eventData.cartLine.merchandise?.product?.type,
      variant: eventData.cartLine.merchandise?.title,
      quantity: eventData.cartLine.quantity,
      price: eventData.cartLine.merchandise?.price ? parseFloat(eventData.cartLine.merchandise.price.amount) : undefined,
      description: eventData.cartLine.merchandise?.product?.description
    });
  }
  
  // Handle single product (product_viewed, etc.)
  if (eventData?.variant) {
    products.push({
      id: eventData.variant.id?.toString(),
      name: eventData.variant.product?.title,
      category: eventData.variant.product?.type,
      variant: eventData.variant.title,
      quantity: eventData.quantity || 1,
      price: eventData.variant.price ? parseFloat(eventData.variant.price.amount) : undefined,
      description: eventData.variant.product?.description
    });
  }
  
  // Handle cart items from event data
  if (eventData?.cart?.lines) {
    eventData.cart.lines.forEach(line => {
      if (line.merchandise) {
        products.push({
          id: line.merchandise.id?.toString(),
          name: line.merchandise.product?.title,
          category: line.merchandise.product?.type,
          variant: line.merchandise.title,
          quantity: line.quantity,
          price: line.merchandise.price ? parseFloat(line.merchandise.price.amount) : undefined,
          description: line.merchandise.product?.description
        });
      }
    });
  }
  
  // Handle checkout events (checkout_started, checkout_completed, etc.)
  if (eventData?.checkout?.lines) {
    eventData.checkout.lines.forEach(line => {
      if (line.variant) {
        products.push({
          id: line.variant.id?.toString(),
          name: line.variant.product?.title,
          category: line.variant.product?.type,
          variant: line.variant.title,
          quantity: line.quantity,
          price: line.variant.price ? parseFloat(line.variant.price.amount) : undefined,
          description: line.variant.product?.description
        });
      }
    });
  }
  
  // Handle checkout lineItems structure (alternative structure)
  if (eventData?.checkout?.lineItems) {
    eventData.checkout.lineItems.forEach(line => {
      if (line.variant) {
        products.push({
          id: line.variant.id?.toString(),
          name: line.variant.product?.title,
          category: line.variant.product?.type,
          variant: line.variant.title,
          quantity: line.quantity,
          price: line.variant.price ? parseFloat(line.variant.price.amount) : undefined,
          description: line.variant.product?.description
        });
      }
    });
  }
  
  // Handle direct lines array (common in many event types)
  if (eventData?.lines && Array.isArray(eventData.lines)) {
    eventData.lines.forEach(line => {
      if (line.merchandise) {
        // Cart/storefront format
        products.push({
          id: line.merchandise.id?.toString(),
          name: line.merchandise.product?.title,
          category: line.merchandise.product?.type,
          variant: line.merchandise.title,
          quantity: line.quantity,
          price: line.merchandise.price ? parseFloat(line.merchandise.price.amount) : undefined,
          description: line.merchandise.product?.description
        });
      } else if (line.variant) {
        // Checkout format
        products.push({
          id: line.variant.id?.toString(),
          name: line.variant.product?.title,
          category: line.variant.product?.type,
          variant: line.variant.title,
          quantity: line.quantity,
          price: line.variant.price ? parseFloat(line.variant.price.amount) : undefined,
          description: line.variant.product?.description
        });
      }
    });
  }
  
  // Fallback: Extract from init data (contains cart snapshot at page load)
  if (products.length === 0 && initData?.data?.cart?.lines) {
    initData.data.cart.lines.forEach(line => {
      if (line.merchandise) {
        products.push({
          id: line.merchandise.id?.toString(),
          name: line.merchandise.product?.title,
          category: line.merchandise.product?.type,
          variant: line.merchandise.title,
          quantity: line.quantity,
          price: line.merchandise.price ? parseFloat(line.merchandise.price.amount) : undefined,
          description: line.merchandise.product?.description
        });
      } else if (line.variant) {
        products.push({
          id: line.variant.id?.toString(),
          name: line.variant.product?.title,
          category: line.variant.product?.type,
          variant: line.variant.title,
          quantity: line.quantity,
          price: line.variant.price ? parseFloat(line.variant.price.amount) : undefined,
          description: line.variant.product?.description
        });
      }
    });
  }
  
  return products.filter(p => p.id); // Only return products with valid IDs
}

// Calculate total value from products or event data
function calculateValue(eventData, products) {
  if (eventData.checkout?.totalPrice?.amount) {
    return parseFloat(eventData.checkout.totalPrice.amount);
  }
  
  if (eventData.cart?.cost?.totalAmount?.amount) {
    return parseFloat(eventData.cart.cost.totalAmount.amount);
  }
  
  // Handle cartLine data structure (product_removed_from_cart, etc.)
  if (eventData.cartLine?.cost?.totalAmount?.amount) {
    return parseFloat(eventData.cartLine.cost.totalAmount.amount);
  }
  
  if (eventData.variant?.price?.amount) {
    const quantity = eventData.quantity || 1;
    return parseFloat(eventData.variant.price.amount) * quantity;
  }
  
  // Calculate from products if available
  if (products && products.length > 0) {
    return products.reduce((total, product) => {
      return total + ((product.price || 0) * (product.quantity || 1));
    }, 0);
  }
  
  return 0;
}

// Get currency from event data
function getCurrency(eventData) {
  return eventData.checkout?.currencyCode ||
         eventData.cart?.cost?.totalAmount?.currencyCode ||
         eventData.cartLine?.cost?.totalAmount?.currencyCode ||
         eventData.cartLine?.merchandise?.price?.currencyCode ||
         eventData.variant?.price?.currencyCode ||
         'USD';
}

// Capture all available cookies
async function captureAllCookies(browser) {
  const cookieNames = [
    '_shopify_y', '_shopify_s', '_shopify_sa_p', '_shopify_sa_t',
    '_y', '_s', '_landing_page', '_orig_referrer', '_fbp', '_fbc',
    'ttclid', 'ttp', '_ga', '_gid', '_gat', '_gcl_au', '_uetsid',
    'muid', 'session_id', 'user_id'
  ];
  
  const cookies = {};
  
  for (const cookieName of cookieNames) {
    try {
      const cookieValue = await browser.cookie.get(cookieName);
      if (cookieValue) {
        cookies[cookieName] = cookieValue;
      }
    } catch (error) {
      // Continue if cookie doesn't exist or can't be accessed
    }
  }
  
  return cookies;
}

register(async ({ analytics, browser, settings, init }) => {
  // Get the webhook URL from settings, fallback to your default endpoint
  const webhookUrl = settings.webhookUrl || 'https://poc-shopify-wheat.vercel.app/webhook/shopify-events';
  const shopName = settings.shopName || 'default';

  console.log('Custom pixel script loaded for shop:', shopName);
  console.log('Initializing custom pixel analytics');
  console.log('Webhook URL:', webhookUrl);
  
  // Generate session ID
  let sessionId = generateUUID();
  
  // Check for muid cookie and create one if it doesn't exist
  let muid;
  try {
    muid = await browser.cookie.get('muid');
    console.log('Found existing muid cookie:', muid);
    
    if (!muid) {
      muid = generateUUID();
      console.log('Generated new muid:', muid);
      // Set cookie with 1 year expiry
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      await browser.cookie.set(`muid=${muid}; expires=${expiryDate.toUTCString()}; path=/`);
      console.log('Set new muid cookie');
    }
  } catch (error) {
    console.error('Error handling muid cookie:', error);
    // Fallback to generating a new ID if there's an error
    muid = generateUUID();
  }
  
  // Capture all available cookies
  const allCookies = await captureAllCookies(browser);
  console.log('Captured cookies:', Object.keys(allCookies));
  
  // Log consent status for debugging
  console.log('Pixel is running, which means consent has been granted or is not required');
  console.log('If you see this message in testing but the pixel still shows "awaiting consent", refresh the page');

  // Subscribe to all Shopify events
  analytics.subscribe('all_events', async (event) => {
    console.log('Shopify event captured:', event.name, event);
    
    try {
      // Map Shopify event to MarkTag event type
      const markTagEventType = mapShopifyToMarkTagEvent(event.name, event);
      
      // Extract products from event data and init data fallback
      const products = extractProducts(event, init);
      
      // Calculate value and get currency
      const value = calculateValue(event, products);
      const currency = getCurrency(event);
      
      // Build base MarkTag common attributes
      const commonAttributes = {
        event: markTagEventType,
        event_source: 'shopify_pixel',
        pageUrl: event.context?.document?.url || '',
        email: event.context?.customer?.email || allCookies.email || undefined,
        phone: event.context?.customer?.phone || allCookies.phone || undefined,
        mt_ref_src: event.context?.document?.referrer || undefined,
        sessionId: sessionId,
        duration: undefined, // Will be set for duration-based events
        scroll: undefined // Will be set for scroll events
      };

      // Build event-specific payload based on MarkTag event type
      let eventPayload = { ...commonAttributes };
      
      switch (markTagEventType) {
        case 'AddToCart':
        case 'RemoveFromCart':
          eventPayload = {
            ...eventPayload,
            currency: currency,
            value: value,
            products: products
          };
          break;
          
        case 'Purchase':
          eventPayload = {
            ...eventPayload,
            value: value,
            currency: currency,
            products: products,
            transaction_id: event.checkout?.token || event.id?.toString(),
            tax: event.checkout?.totalTax?.amount ? parseFloat(event.checkout.totalTax.amount) : undefined,
            shipping_cost: event.checkout?.shippingLine?.price?.amount ? parseFloat(event.checkout.shippingLine.price.amount) : undefined
          };
          break;
          
        case 'BeginCheckout':
        case 'InitiateCheckout':
          eventPayload = {
            ...eventPayload,
            currency: currency,
            value: value,
            products: products,
            tax: event.checkout?.totalTax?.amount ? parseFloat(event.checkout.totalTax.amount) : undefined,
            shipping_cost: event.checkout?.shippingLine?.price?.amount ? parseFloat(event.checkout.shippingLine.price.amount) : undefined
          };
          break;
          
        case 'ViewItem':
          eventPayload = {
            ...eventPayload,
            content_type: 'product',
            currency: currency,
            value: value,
            products: products
          };
          break;
          
        case 'ViewCart':
          eventPayload = {
            ...eventPayload,
            currency: currency,
            value: value,
            products: products
          };
          break;
          
        case 'Search':
          eventPayload = {
            ...eventPayload,
            search_term: event.searchQuery || event.query || undefined
          };
          break;
          
        case 'AddPaymentInfo':
          eventPayload = {
            ...eventPayload,
            payment_type: event.paymentMethod?.type || undefined,
            value: value.toString(),
            currency: currency,
            products: products
          };
          break;
          
        default:
          // For ViewContent and other general events
          eventPayload = {
            ...eventPayload
          };
      }

      // Build comprehensive payload with additional tracking data
      const payload = {
        // MarkTag formatted event data
        ...eventPayload,
        
        // Additional tracking data
        external_id: muid,
        ttclid: allCookies.ttclid,
        ttp: allCookies.ttp,
        fbc: allCookies._fbc,
        fbp: allCookies._fbp,
        url: event.context?.document?.url || '',
        referrer: event.context?.document?.referrer || '',
        user_agent: event.context?.navigator?.userAgent || '',
        event_time: new Date(),
        
        // All captured cookies for analysis
        all_cookies: allCookies,
        
        // Original Shopify event data for debugging
        shopify_event: {
          name: event.name,
          id: event.id,
          clientId: event.clientId,
          customerId: event.customerId,
          timestamp: event.timestamp
        },
        
        // Shop and tracking metadata
        shop: shopName,
        pixel_id: event.pixelEventLabel || null,
        
        // Browser context
        viewport: {
          height: event.context?.window?.innerHeight || null,
          width: event.context?.window?.innerWidth || null
        },
        screen: {
          height: event.context?.screen?.height || null,
          width: event.context?.screen?.width || null
        },
        
        // Page context
        page_title: event.context?.document?.title || null,
        page_location: event.context?.window?.location || null
      };

      // Create cookie header string from all captured cookies
      const cookieHeader = Object.entries(allCookies)
        .map(([name, value]) => `${name}=${value}`)
        .join('; `');
      console.log('Cookie header:', cookieHeader);
      
      // Send to webhook endpoint
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Shopify-Pixel-Extension/1.0',
          'Cookie': cookieHeader,
        },
        body: JSON.stringify(payload),
        keepalive: true,
      });

      if (!response.ok) {
        console.error('Failed to send MarkTag event to webhook. Status:', response.status);
        console.error('Event type:', markTagEventType, 'Original:', event.name);
      } else {
        console.log('MarkTag event successfully sent:', markTagEventType, '(from', event.name + ')');
      }
    } catch (error) {
      console.error('Failed to send MarkTag event to webhook:', error);
    }
  });

  // No need for specific event subscriptions since we're capturing all events via 'all_events'
  // All Shopify standard events are now properly mapped and handled
  
  console.log('MarkTag-compatible pixel initialized successfully');
  console.log('Subscribed to all_events with MarkTag formatting');
  console.log('Available cookies:', Object.keys(allCookies));
  console.log('Session ID:', sessionId);
  console.log('MUID:', muid);
});
