/**
 * Custom Service Worker Entry Point
 * This file is used by next-pwa to generate the service worker
 * It imports the push notification handlers
 */

// Import push notification handlers
importScripts('/sw-push.js');

console.log('[Service Worker] Custom worker with push notification support loaded.');

