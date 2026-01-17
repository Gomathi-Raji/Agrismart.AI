import { ReactNode } from "react";
import { MobileHeader } from "./MobileHeader";
import { Footer } from "./Footer";
import { BottomNavigation } from "./BottomNavigation";
import { NavigationBreadcrumb } from "@/components/navigation/NavigationBreadcrumb";
import { FloatingActionMenu } from "@/components/navigation/FloatingActionMenu";
import { BackToTopButton } from "@/components/navigation/BackToTopButton";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
  hideBreadcrumb?: boolean;
}

export function Layout({ children, hideFooter = false, hideBreadcrumb = false }: LayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader />
      <main className={`flex-1 ${isMobile ? 'pb-20' : ''}`}>
        {!hideBreadcrumb && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <NavigationBreadcrumb />
          </div>
        )}
        {children}
      </main>
      {!hideFooter && !isMobile && <Footer />}
      <BottomNavigation />
      <FloatingActionMenu />
      <BackToTopButton />
    </div>
  );
}