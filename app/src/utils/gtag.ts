// google-analytics key
export const GA_ID = "G-1CQNQNPK1Y";

type EventParams = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
};

export const pageview = (url: string) => {
  if (typeof window === "undefined") return;
  (window as any).gtag?.("config", GA_ID, { page_path: url });
};

export const event = ({ action, category, label, value }: EventParams) => {
  if (typeof window === "undefined") return;
  (window as any).gtag?.("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
};
