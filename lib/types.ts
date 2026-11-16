export type Fragment = {
  _path: string;
  _variation?: string;
  _model?: { title: string; _path?: string };
};

export type RichText = { html?: string; plaintext?: string } | null;
export type ImageRef = { _path?: string; _authorUrl?: string; _publishUrl?: string } | null;

export type Disclosure = Fragment & { title?: string; body?: RichText };

export type Rate = Fragment & {
  product?: string;
  detail?: string;
  rate?: number | null;
  rateType?: "APY" | "APR";
  term?: string;
  effectiveDate?: string | null;
  status?: "sample" | "approved";
  disclosure?: Disclosure | null;
  ctaText?: string;
  ctaLink?: string;
};

export type BankHero = Fragment & {
  headline?: string;
  subHeadline?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  ratesTitle?: string;
  layout?: "split" | "stacked";
  rates?: Rate[];
};

export type RatesTable = Fragment & {
  title?: string;
  linkText?: string;
  linkUrl?: string;
  rates?: Rate[];
};

export type ProductLine = Fragment & { name?: string; summary?: string; ctaText?: string; ctaLink?: string };
export type ProductList = Fragment & { title?: string; anchor?: string; items?: ProductLine[] };

export type FeatureSplit = Fragment & {
  headline?: string;
  body?: RichText;
  image?: ImageRef;
  imageAlt?: string;
  mediaPosition?: "right" | "left";
  mobileOrder?: "text-first" | "media-first";
  background?: "mist" | "paper";
};

export type CtaBand = Fragment & { headline?: string; ctaText?: string; ctaLink?: string; tone?: "spruce" | "ink" };

export type Block = BankHero | RatesTable | ProductList | FeatureSplit | CtaBand;

export type Screen = Fragment & { title?: string; block?: Block[]; disclosures?: Disclosure[] };
