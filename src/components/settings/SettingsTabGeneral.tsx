"use client";

import * as React from "react";
import { SettingsPanel } from "./SettingsPanel";
import { UserSettingSwitchCard } from "@/components/UserSettingSwitchCard";

export function SettingsTabGeneral() {
  return (
    <SettingsPanel
      title="General Settings"
      description="Configure general application preferences."
    >
      <div className="space-y-2">
        <UserSettingSwitchCard
          settingKey="notifications"
          label="Notifications"
          description="Enable or disable application notifications."
        />

        <UserSettingSwitchCard
          settingKey="emailFrequency"
          label="Email Frequency"
          description="Set how often you would like updates on your inventory."
        />
      </div>
    </SettingsPanel>
  );
}
