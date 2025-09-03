import type React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogPortal,
  DialogOverlay,
  DialogDescription,
  DialogContent,
} from "@/components/ui/dialog";
import { useControlledOpen } from "@/hooks/useControlledOpen";
import { useKitzeUI } from "@/components/KitzeUIContext";
import { CustomButton } from "@/components/CustomButton";
import "@/styles/dialog.css";

export type DialogMobileViewType = "keep" | "bottom-drawer";

export type DialogSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "full";

export type DialogClassNames = {
  root?: string;
  content?: string;
  header?: string;
  title?: string;
  body?: string;
  footer?: string;
  submitButton?: string;
  cancelButton?: string;
  drawerRoot?: string;
  drawerContent?: string;
  drawerHeader?: string;
  drawerFooter?: string;
};

export interface SimpleDialogProps {
  trigger?: React.ReactNode;
  title?: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: DialogSize;
  classNames?: DialogClassNames;
  mobileView?: DialogMobileViewType;
  drawerTitle?: string;
  showCancel?: boolean;
  showCloseButton?: boolean;
  onCancel?: () => void;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  description?: string;
  badge?: React.ReactNode;
}

export const SimpleDialog = ({
  trigger = "Open",
  title,
  children,
  open,
  onOpenChange,
  size = "sm",
  classNames = {},
  mobileView = "keep",
  drawerTitle,
  showCancel = true,
  showCloseButton = true,
  onCancel,
  onSubmit,
  submitText = "Submit",
  cancelText = "Cancel",
  badge,
  description,
}: SimpleDialogProps) => {
  const { isMobile } = useKitzeUI();
  const { isOpen, setIsOpen, close } = useControlledOpen({
    open,
    onOpenChange,
  });

  const handleCancel = () => {
    close();
    if (onCancel) onCancel();
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit();
    close();
  };

  const footerContent = (onSubmit || showCancel) && (
    <div className={cn("flex justify-end gap-2", classNames.footer)}>
      {showCancel && (
        <CustomButton
          variant="outline"
          onClick={handleCancel}
          className={classNames.cancelButton}
        >
          {cancelText}
        </CustomButton>
      )}
      {onSubmit && (
        <CustomButton
          onClick={handleSubmit}
          className={classNames.submitButton}
        >
          {submitText}
        </CustomButton>
      )}
    </div>
  );

  // if (isMobile && mobileView === "bottom-drawer") {
  //   return (
  //     <BottomDrawer
  //       open={isOpen}
  //       onOpenChange={setIsOpen}
  //       trigger={trigger}
  //       title={drawerTitle || title}
  //       classNames={{
  //         content: classNames.drawerContent,
  //         headerWrapper: classNames.drawerHeader,
  //       }}
  //     >
  //       <div className={classNames.body}>{children}</div>
  //       {footerContent && (
  //         <div
  //           className={cn(classNames.drawerFooter, "px-6 pt-4 pb-6 md:pb-2")}
  //         >
  //           {footerContent}
  //         </div>
  //       )}
  //     </BottomDrawer>
  //   );
  // }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && open === undefined && (
        <DialogTrigger asChild>
          {typeof trigger === "string" ? (
            <CustomButton>{trigger}</CustomButton>
          ) : (
            trigger
          )}
        </DialogTrigger>
      )}
      <DialogPortal>
        <DialogOverlay className="DialogOverlay" />
        <DialogContent
          className={cn("DialogContent dark:bg-zinc-900!", classNames.content)}
        >
          <DialogHeader
            className={cn("items-start space-y-1.5", classNames.header)}
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col items-start gap-1">
                <DialogTitle
                  className={cn(classNames.title, !title && "sr-only")}
                >
                  {title ?? "Dialog"}
                </DialogTitle>
                {description && (
                  <DialogDescription>{description}</DialogDescription>
                )}
              </div>
              {badge && <div className="mr-6">{badge}</div>}
            </div>
          </DialogHeader>
          <hr></hr>
          <div className={cn("flex-1 space-y-4", classNames.body)}>
            {children}
          </div>
        </DialogContent>
      </DialogPortal>
      {footerContent && (
        <DialogFooter className={cn("pt-4", classNames.footer)}>
          {footerContent}
        </DialogFooter>
      )}
    </Dialog>
  );
};
