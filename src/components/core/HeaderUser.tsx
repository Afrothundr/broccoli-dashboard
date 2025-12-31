"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { CustomButton } from "@/components/CustomButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HeaderUserDropdownMenu,
  type LinkType,
} from "./HeaderUserDropdownMenu";
import { authClient } from "@/server/auth/client";
import { useUserBillingStatus } from "@/hooks/useUserBillingStatus";
import { Crown, LucideLogIn, LucideMenu } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CustomBadge } from "@/components/CustomBadge";
import { AnimatePresence, motion } from "framer-motion";
import { CommonMenuItem } from "@/components/CommonMenuItem";
import { useKitzeUI } from "@/components/KitzeUIContext";
import { filterEnabledLinks } from "@/lib/linkUtils";
import { useIsImpersonating } from "@/hooks/useIsImpersonating";
import { SimpleTooltip } from "@/components/SimpleTooltip";
import { CommonMenuSeparator } from "@/components/CommonMenuSeparator";
import { useState } from "react";
import { MenuProvider } from "@/components/MenuContext";

interface AppHeaderUserProps {
  links: (LinkType | null | undefined)[] | undefined;
}

export function AppHeaderUser({ links }: AppHeaderUserProps) {
  const realUser = useCurrentUser();
  const { data: userSession, isPending } = authClient.useSession();
  const { isPro } = useUserBillingStatus({ enabled: !!userSession });
  const { isMobile } = useKitzeUI();
  const { isImpersonating, impersonatedUserName } = useIsImpersonating();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Filter the links passed in
  const enabledLinks = filterEnabledLinks(links);

  const motionProps = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 },
  };

  const isLoading = isPending;
  const isLoggedOut = !isPending && !userSession;
  const isLoggedIn = !isPending && userSession;

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div key="loading" {...motionProps}>
          <Avatar>
            <AvatarFallback className="animate-pulse cursor-wait bg-gray-300 select-none dark:bg-gray-700">
              U
            </AvatarFallback>
          </Avatar>
        </motion.div>
      )}

      {isLoggedOut && (
        <motion.div
          className="flex items-center gap-2"
          key="login"
          {...motionProps}
        >
          {!isMobile && (
            <CustomButton leftIcon={LucideLogIn} href="/signin">
              Login
            </CustomButton>
          )}
          {isMobile && (
            <DropdownMenu.Root
              open={mobileMenuOpen}
              onOpenChange={setMobileMenuOpen}
            >
              <DropdownMenu.Trigger asChild>
                <CustomButton
                  variant="ghost"
                  color="bg-zinc-400"
                  leftIcon={LucideMenu}
                />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={4}
                  className="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md"
                >
                  <MenuProvider
                    menuType="dropdown"
                    closeMenu={() => setMobileMenuOpen(false)}
                  >
                    {enabledLinks.map((link) => (
                      <CommonMenuItem
                        key={link.href}
                        href={link.href}
                        leftIcon={link.icon}
                      >
                        {link.label}
                      </CommonMenuItem>
                    ))}
                    <CommonMenuSeparator />
                    <CommonMenuItem leftIcon={LucideLogIn} href="/signin">
                      Login
                    </CommonMenuItem>
                  </MenuProvider>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </motion.div>
      )}

      {isLoggedIn && (
        <motion.div
          key="user"
          {...motionProps}
          className="flex items-center gap-2"
        >
          <AnimatePresence>
            {isPro && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <CustomBadge color="bg-violet-500" size="sm" leftIcon={Crown}>
                  Pro
                </CustomBadge>
              </motion.div>
            )}
          </AnimatePresence>
          <DropdownMenu.Root
            open={userMenuOpen}
            onOpenChange={setUserMenuOpen}
            key={`${realUser?.profilePic ?? "no-pic"}-${realUser?.name ?? "no-name"}`}
          >
            <DropdownMenu.Trigger asChild>
              <div className="relative">
                <SimpleTooltip
                  content={
                    isImpersonating
                      ? `Impersonating ${impersonatedUserName}`
                      : ""
                  }
                >
                  <Avatar className="cursor-pointer">
                    {realUser?.profilePic && (
                      <AvatarImage
                        className="object-cover"
                        src={realUser.profilePic}
                        alt="User Avatar"
                      />
                    )}
                    <AvatarFallback className="bg-gray-300 select-none dark:bg-gray-700">
                      {realUser?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </SimpleTooltip>
                {isImpersonating && (
                  <div className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-yellow-500 ring-1 ring-white" />
                )}
              </div>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md"
              >
                <MenuProvider
                  menuType="dropdown"
                  closeMenu={() => setUserMenuOpen(false)}
                >
                  <HeaderUserDropdownMenu links={enabledLinks} />
                </MenuProvider>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
