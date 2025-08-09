import { SwitchCard } from "@/components/SwitchCard";
import { useUserSetting } from "@/hooks/useUserSetting";
import { type PreferenceKey } from "@/types/user-preferences";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { SegmentedControl } from "./SegmentedControl";

interface UserSettingSwitchCardProps {
  settingKey: PreferenceKey;
  id?: string;
  label?: string;
  description?: string;
}

export function UserSettingSwitchCard({
  settingKey,
  id,
  label,
  description,
}: UserSettingSwitchCardProps) {
  // Format the key for display if no label is provided
  const displayLabel = label ?? formatKeyToLabel(settingKey);

  // Format a default description if none is provided
  const displayDescription =
    description ?? `Enable or disable ${settingKey.toLowerCase()}.`;

  // Use the supplied id or the setting key
  const displayId = id ?? settingKey;

  const { value, setValue, isLoading, isUpdating } = useUserSetting(settingKey);

  if (settingKey === "emailFrequency") {
    return (
      <div
        className={cn(
          "hover:bg-accent bg-foreground/3 flex items-center justify-between rounded-lg p-4 transition-colors",
          isLoading || isUpdating
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer",
        )}
      >
        <div className="space-y-0.5">
          <Label htmlFor={id}>{label}</Label>
          <p className="text-muted-foreground text-sm">
            Choose how often you want to receive emails.
          </p>
        </div>
        <SegmentedControl
          options={[
            { label: "Daily", value: "daily" },
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
          ]}
          value={value as string}
          onChange={(newValue) =>
            setValue(newValue as "daily" | "weekly" | "monthly")
          }
          size="md"
        />
      </div>
    );
  }

  return (
    <SwitchCard
      id={displayId}
      label={displayLabel}
      description={displayDescription}
      checked={value as boolean}
      onCheckedChange={setValue}
      disabled={isLoading || isUpdating}
    />
  );
}

// Helper function to format a key like "notifications" to "Notifications"
function formatKeyToLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}
