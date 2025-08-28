import { register } from '@shopify/web-pixels-extension';

// Generate a UUID v4 function
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

register(async ({ analytics, browser, settings }) => {
  // Get the webhook URL from settings, fallback to your default endpoint
  const webhookUrl = settings.webhookUrl || 'https://poc-shopify-wheat.vercel.app/webhook/shopify-events';
  const shopName = settings.shopName || 'default';

  console.log('Custom pixel script loaded for shop:', shopName);
  console.log('Initializing custom pixel analytics');
  console.log('Webhook URL:', webhookUrl);
  
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
  
  // Get all cookies for debugging and analysis
  let allCookies = {};
  try {
    // This is a simplified approach - in a real implementation you would need to 
    // parse document.cookie which isn't directly accessible in the sandbox
    // Here we're just demonstrating the concept
    console.log('Using muid for user identification:', muid);
  } catch (error) {
    console.error('Error retrieving cookies:', error);
  }
  
  // Log consent status for debugging
  console.log('Pixel is running, which means consent has been granted or is not required');
  console.log('If you see this message in testing but the pixel still shows "awaiting consent", refresh the page');

  // Subscribe to all Shopify events
  analytics.subscribe('all_events', async (event) => {
    console.log('Shopify event captured:', event.name, event);
    
    try {
      // Prepare payload for webhook
      const payload = {
        timestamp: new Date().toISOString(),
        shop: shopName,
        eventName: event.name,
        eventData: event,
        customerId: event.customerId || null,
        clientId: event.clientId || null,
        muid: muid, // Include the muid in the payload
        url: event.context?.document?.url || null,
        userAgent: event.context?.navigator?.userAgent || null,
        pixelId: event.pixelEventLabel || null,
        sessionId: event.context?.session?.id || null,
        // Additional context data
        page: {
          title: event.context?.document?.title || null,
          referrer: event.context?.document?.referrer || null,
          location: event.context?.window?.location || null
        },
        // Browser and device info
        viewport: {
          height: event.context?.window?.innerHeight || null,
          width: event.context?.window?.innerWidth || null
        },
        screen: {
          height: event.context?.screen?.height || null,
          width: event.context?.screen?.width || null
        }
      };
      
      // Send to webhook endpoint
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Shopify-Pixel-Extension/1.0'
        },
        body: JSON.stringify(payload),
        keepalive: true,
      });

      if (!response.ok) {
        console.error('Failed to send event to webhook. Status:', response.status);
      } else {
        console.log('Event successfully sent to webhook:', event.name);
      }
    } catch (error) {
      console.error('Failed to send event to webhook:', error);
    }
  });
  
  // Subscribe to specific high-value events for additional processing
  const highValueEvents = [
    'page_viewed',
    'product_viewed', 
    'product_added_to_cart',
    'checkout_started',
    'checkout_completed',
    'payment_info_submitted'
  ];

  highValueEvents.forEach(eventName => {
    analytics.subscribe(eventName, (event) => {
      console.log(`High-value event captured: ${eventName}`, event);
      // Additional processing for high-value events can go here
    });
  });
  
  console.log('Custom pixel initialized successfully');
  console.log('Subscribed to all_events and high-value events');
});
