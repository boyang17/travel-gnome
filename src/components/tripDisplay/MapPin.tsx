import {
  ListOrdered,
  CarFront,
  CircleParking,
  Camera,
  Ship,
  ShoppingCart,
  Utensils,
  BusFront,
  Coffee,
  Wine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const MapPin = ({
  displayOrder,
  color,
  icon,
  scaleUp,
  showNumber,
}: {
  displayOrder: number;
  color: string;
  icon: string;
  scaleUp: boolean;
  showNumber: boolean;
}) => {
  type IconName =
    | "ListOrdered"
    | "CarFront"
    | "CircleParking"
    | "Camera"
    | "Ship"
    | "ShoppingCart"
    | "Utensils"
    | "BusFront"
    | "Coffee"
    | "Wine";
  const iconMap: Record<IconName, LucideIcon> = {
    ListOrdered,
    CarFront,
    CircleParking,
    Camera,
    Ship,
    ShoppingCart,
    Utensils,
    BusFront,
    Coffee,
    Wine,
  };
  const IconComponent = iconMap[icon as IconName];

  return (
    <div
      className={`transition duration-100 ${scaleUp ? "relative scale-150 z-50" : "z-0"} cursor-pointer`}
    >
      <svg width="100%" height="40" viewBox="0 0 55 50" >
        <path
          d="M27.5 3C19.2 3 12.5 9.7 12.5 18c0 10 15 30 15 30s15-20 15-30c0-8.3-6.7-15-15-15z"
          fill={color}
          stroke="white"
          strokeWidth="4"
        />
        {showNumber || !icon || icon === "ListOrdered" ? (
          <text
            x="27.5"
            y="24"
            textAnchor="middle"
            fill="white"
            fontSize="16"
            fontWeight="bold"
          >
            {displayOrder + 1}
          </text>
        ) : (
          <foreignObject x="18.75" y="11" width="100%" height="100%">
            <IconComponent size={17} strokeWidth={3} color="white" />
          </foreignObject>
        )}
      </svg>
    </div>
  );
};
