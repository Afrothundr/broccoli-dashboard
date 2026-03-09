"use client";

import { HeaderCustomized } from "@/components/core/HeaderCustomized";
import { HeaderLinks } from "@/components/core/HeaderLinks";
import { useKitzeUI } from "@/components/KitzeUIContext";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeSwitchMinimalNextThemes } from "@/components/ThemeSwitchMinimalNextThemes";
import { blogLink, chatLink } from "@/config/links";
import { AppHeaderUser } from "./HeaderUser";
import { Logo } from "./Logo";

export default function AppHeader() {
  const { isMobile } = useKitzeUI();

  // Links are filtered inside the respective components
  const userLinks = [blogLink];
  const headerLinks = [chatLink];

  return (
    <HeaderCustomized
      classNames={{
        root: "relative",
      }}
      leftSide={
        <div className="horizontal gap-2">
          <Logo />
        </div>
      }
      renderRightSide={() => (
        <div className="horizontal center-v gap-4">
          {!isMobile && <HeaderLinks links={headerLinks} />}
          <ThemeSwitchMinimalNextThemes buttonProps={{ variant: "ghost" }} />
          <NotificationBell />
          <AppHeaderUser links={userLinks} />
        </div>
      )}
    />
  );
}
