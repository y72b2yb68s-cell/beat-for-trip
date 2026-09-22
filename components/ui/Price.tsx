import { useLocale } from "next-intl";
import { formatPrice, cn } from "@/lib/utils";

export default function Price({ price, className }: { price: number; className?: string }) {
  const locale = useLocale();

  return (
    <span className={cn("font-semibold text-green", className)}>{formatPrice(price, locale)}</span>
  );
}
