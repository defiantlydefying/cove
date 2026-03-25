import { ReactNode } from "react";

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
  zone: "main" | "sidebar";
  icon?: ReactNode;
}
