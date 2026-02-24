import type { ReviewCardProps } from "@/interface/ReviewCardProps";
export function getLabelReviewType(review: ReviewCardProps['review']) {
  if (review.type === "MARKET") {
    return "ตลาด";
  }

  return "บูธ";
}