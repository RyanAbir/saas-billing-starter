export const FREE_PROJECT_LIMIT = 3;

type SubscriptionLikeUser = {
  subscriptionStatus: string;
  subscriptionPlan: string;
};

export function hasProAccess(user: SubscriptionLikeUser): boolean {
  return (
    user.subscriptionStatus === "active" &&
    user.subscriptionPlan.toLowerCase().startsWith("pro")
  );
}
