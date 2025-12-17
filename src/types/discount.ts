export interface Discount {
  __typename: string;
  title: string;
  summary: string;
  status: string;
  startsAt: string;
  endsAt: string | null;
  appliesOncePerCustomer?: boolean;
  usesPerOrderLimit?: number;
  usageLimit?: number | null;
  codes?: { nodes: any[] }[];
  destinationSelection?: { countries?: string[]; allCountries?: boolean };
  minimumRequirement?: {
    greaterThanOrEqualToSubtotal?: { amount?: string; currencyCode?: string };
    greaterThanOrEqualToQuantity?: { quantity: string };
  };
  context?: { customers?: { id: string }[] };
  combinesWith?: {
    orderDiscounts: boolean;
    productDiscounts: boolean;
    shippingDiscounts?: boolean;
  };
  customerGets?: {
    items?: {
      products: any[];
    };
    value?: { percentage: number };
  };
  customerBuys?: {
    isOneTimePurchase: boolean;
    isSubscription: boolean;
    value?: { quantity?: string };
    items?: {
      products: any[];
    };
  };
}
