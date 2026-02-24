export interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    type: string;
    user: {
      name: string | null;
      email: string;
    };
    booth: {
      name: string;
    };
  };
}