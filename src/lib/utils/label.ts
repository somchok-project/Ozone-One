import type { ReviewCardProps } from "@/interface/ReviewCardProps";

export function getLabelReviewType(review: ReviewCardProps['review']) {
  if (review.type === "MARKET") {
    return "ตลาด";
  }
  return "บูธ";
}

export function getLabelStatus(status: string) {
  switch (status) {
    case "SUCCESS":
      return "ชำระเงินแล้ว";
    case "PENDING":
      return "รอยืนยัน";
    case "CANCEL":
      return "ยกเลิก";
    default:
      return "ไม่ทราบ";
  }
}