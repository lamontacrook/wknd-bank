import { UE_URL } from "@/lib/aem";
import s from "./deck.module.css";

export function UeLink() {
  if (!UE_URL) return null;
  return (
    <a className={s.ueLink} href={UE_URL} target="_blank" rel="noopener noreferrer">
      Open the app in Universal Editor <span aria-hidden>↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
