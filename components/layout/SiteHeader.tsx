import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { DesktopNav } from "./NavLinks";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-vapno-tien bg-vapno/95 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <div className="hidden xl:block">
          <DesktopNav />
        </div>
        <MobileMenu />
      </Container>
    </header>
  );
}
