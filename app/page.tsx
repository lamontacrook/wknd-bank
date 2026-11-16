import { SiteHeader } from "@/components/SiteHeader";
import { ScreenView } from "@/components/ScreenView";
import { loadScreen } from "@/lib/load-screen";

export default async function Home() {
  const { screen, source } = await loadScreen();
  return (
    <>
      <SiteHeader />
      <ScreenView initial={screen} source={source} />
    </>
  );
}
