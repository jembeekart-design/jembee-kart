"use client";

import { type LucideProps } from "lucide-react";
import { getIcon } from "@/lib/admin-config/iconMapper";

interface DynamicIconProps extends LucideProps {
  name?: string;
}

export default function DynamicIcon({
  name,
  ...props
}: DynamicIconProps) {
  const Icon = getIcon(name);

  return <Icon {...props} />;
}
