import type { Rate } from "@/lib/types";
import { formatDate, formatRate } from "@/lib/format";
import styles from "./RateFigure.module.css";

export function RateFigure({ rate, showDate = false }: { rate: Rate; showDate?: boolean }) {
  const sample = rate.status !== "approved";
  return (
    <span className={styles.figure}>
      <span className={`figure ${styles.value}`}>{formatRate(rate.rate, rate.rateType)}</span>
      {sample && <span className={styles.sample}>Sample rate</span>}
      {showDate && rate.effectiveDate && (
        <span className={styles.date}>as of {formatDate(rate.effectiveDate)}</span>
      )}
    </span>
  );
}
