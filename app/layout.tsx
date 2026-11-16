import type { Metadata } from "next";
import Script from "next/script";
import { Hanken_Grotesk, Source_Serif_4 } from "next/font/google";
import { AEM_AUTHOR } from "@/lib/aem";
import "./globals.css";

const display = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
});

const body = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WKND Bank — Banking that shows its work",
  description: "Clear rates, plain fees, and people who answer. A fictional bank demo on AEM headless.",
  // Universal Editor: which AEM instance the data-aue-resource URNs (urn:aemconnection:…) point at.
  ...(AEM_AUTHOR ? { other: { "urn:adobe:aue:system:aemconnection": `aem:${AEM_AUTHOR}` } } : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <script type="application/vnd.adobe.aue.component+json" src="/component-definition.json" async />
        <script type="application/vnd.adobe.aue.model+json" src="/component-models.json" async />
        <script type="application/vnd.adobe.aue.filter+json" src="/component-filters.json" async />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {children}
        <Script src="https://universal-editor-service.adobe.io/cors.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
