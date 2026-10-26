const env = import.meta.env;

/**
 * Launch offer. Switch it off at any time with VITE_PROMO_ENABLED=false (then redeploy), for example when the
 * first customers have booked. It also switches itself off after `endsOn`, judged on the customer's date in Johannesburg.
 */
export const promo = {
  enabled: env.VITE_PROMO_ENABLED !== "false",
  name: "Launch offer",
  percent: 20,
  /** Most rand off one booking. */
  maxAmount: 500,
  /** Last day (inclusive) on which a booking counts for the offer, YYYY-MM-DD. */
  endsOn: (env.VITE_PROMO_ENDS as string | undefined) || "2026-12-31",
} as const;

export const promoActive = (today: string): boolean => promo.enabled && /^\d{4}-\d{2}-\d{2}$/.test(today) && today <= promo.endsOn;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const promoEndsLabel = (): string => {
  const [y, m, d] = promo.endsOn.split("-").map(Number);
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : promo.endsOn;
};
