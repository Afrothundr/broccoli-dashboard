"use client";

import { useEffect, useState } from "react";
import { CustomButton } from "./CustomButton";
import { Download, X } from "lucide-react";
import PWAPrompt from "react-ios-pwa-prompt";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Check if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event (Chrome/Android only)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install prompt
      setShowPrompt(true);
      console.log("[PWA] Install prompt available");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener("appinstalled", () => {
      console.log("[PWA] App installed successfully");
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("[PWA] No install prompt available");
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User response: ${outcome}`);

    if (outcome === "accepted") {
      console.log("[PWA] User accepted the install prompt");
    } else {
      console.log("[PWA] User dismissed the install prompt");
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  // Don't show if already installed or dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed =
        (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setShowPrompt(false);
      }
    }
  }, []);

  // If already installed, don't show anything
  if (isInstalled) {
    return null;
  }

  // For iOS devices, use the react-ios-pwa-prompt library
  if (isIOS) {
    return (
      <PWAPrompt
        timesToShow={3}
        promptOnVisit={1}
        delay={2000}
        copyTitle="Install Broccoli"
        copySubtitle="Broccoli Grocery Manager"
        copyDescription="Install this app on your home screen for quick access and offline use."
        copyShareStep="Press the 'Share' button on the menu bar below"
        copyAddToHomeScreenStep="Press 'Add to Home Screen'"
      />
    );
  }

  // For Chrome/Android, show custom prompt if beforeinstallprompt event fired
  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 left-4 z-50 md:right-4 md:left-auto md:max-w-sm">
      <div className="bg-card rounded-lg border p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Download className="text-primary h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 text-sm font-semibold">Install Broccoli</h3>
            <p className="text-muted-foreground mb-3 text-xs">
              Install this app on your device for quick access and offline use.
            </p>
            <div className="flex gap-2">
              <CustomButton
                size="sm"
                variant="filled"
                color="primary"
                onClick={handleInstallClick}
              >
                Install
              </CustomButton>
              <CustomButton size="sm" variant="ghost" onClick={handleDismiss}>
                Not now
              </CustomButton>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
