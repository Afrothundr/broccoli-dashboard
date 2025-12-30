#!/usr/bin/env bun
/**
 * Generate VAPID keys for web push notifications
 * Run with: bun scripts/generate-vapid-keys.ts
 */

import webpush from "web-push";

const vapidKeys = webpush.generateVAPIDKeys();

console.log("\n🔑 Generated VAPID Keys for Web Push Notifications\n");
console.log("Add these to your .env file:\n");
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@example.com`);
console.log("\nMake sure to replace 'your-email@example.com' with your actual email address.\n");

