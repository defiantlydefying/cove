import { getAvatarByKey, getAvatarUrl } from "@/lib/avatars";

interface AvatarDisplayProps {
  avatarKey?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeConfig = {
  sm: { className: "w-6 h-6", px: 24 },
  md: { className: "w-8 h-8", px: 32 },
  lg: { className: "w-12 h-12", px: 48 },
};

export default function AvatarDisplay({ avatarKey, size = "md", className = "" }: AvatarDisplayProps) {
  const avatar = avatarKey ? getAvatarByKey(avatarKey) : null;
  const key = avatarKey ?? "default";
  const category = avatar?.category ?? "starter";
  const { className: sizeClass, px } = sizeConfig[size];

  return (
    <img
      src={getAvatarUrl(key, category, px * 2)}
      alt={avatar?.label ?? "Avatar"}
      width={px}
      height={px}
      className={`rounded-full bg-cove-offwhite border border-cove-border-light shrink-0 ${sizeClass} ${className}`}
    />
  );
}
