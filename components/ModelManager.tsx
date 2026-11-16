import type { ComponentType } from "react";
import type { Block } from "@/lib/types";
import { BankHero } from "./BankHero";
import { CtaBand } from "./CtaBand";
import { FeatureSplit } from "./FeatureSplit";
import { ProductList } from "./ProductList";
import { RatesTable } from "./RatesTable";

// Keyed on the CF model title without spaces, e.g. "Bank Hero" → BankHero.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentMapping: Record<string, ComponentType<{ content: any }>> = {
  BankHero,
  RatesTable,
  ProductList,
  FeatureSplit,
  CtaBand,
};

export function ModelManager({ content }: { content: Block }) {
  const key = content?._model?.title?.replace(/\s+/g, "") ?? "";
  const Component = componentMapping[key];
  if (Component) return <Component content={content} />;
  if (process.env.NODE_ENV === "production") return null;
  return (
    <p className="wrap" style={{ padding: "24px" }}>
      Add <code>{content?._model?.title ?? "unknown model"}</code> to <code>components/ModelManager.tsx</code>.
    </p>
  );
}
