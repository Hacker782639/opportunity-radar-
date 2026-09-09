import { Badge } from "./badge";

type Status =
  | "saved"
  | "interested"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

type StatusBadgeProps = {
  status: Status;
};

const statusConfig = {
  saved: { label: "Saved", variant: "default" as const },
  interested: { label: "Interested", variant: "primary" as const },
  applied: { label: "Applied", variant: "primary" as const },
  interview: { label: "Interview", variant: "warning" as const },
  offer: { label: "Offer", variant: "success" as const },
  rejected: { label: "Rejected", variant: "danger" as const },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
