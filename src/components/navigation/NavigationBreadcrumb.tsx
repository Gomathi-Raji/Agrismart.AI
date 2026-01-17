import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const pathMapping: Record<string, BreadcrumbItem> = {
  "/": { label: "Home", path: "/", icon: Home },
  "/diagnose": { label: "Crop Diagnosis", path: "/diagnose" },
  "/buy": { label: "Buy Products", path: "/buy" },
  "/sell": { label: "Sell Products", path: "/sell" },
  "/marketplace": { label: "Marketplace", path: "/marketplace" },
  "/market-analysis": { label: "Market Analysis", path: "/market-analysis" },
  "/recommendations": { label: "Recommendations", path: "/recommendations" },
  "/government-schemes": { label: "Government Schemes", path: "/government-schemes" },
  "/community": { label: "Community", path: "/community" },
  "/hybrid": { label: "Crops & Hybrids", path: "/hybrid" },
  "/blogs": { label: "News & Blogs", path: "/blogs" },
  "/weather": { label: "Weather", path: "/weather" },
  "/support": { label: "Support", path: "/support" },
  "/user-profile": { label: "Profile", path: "/user-profile" },
  "/buyer-panel": { label: "Buyer Panel", path: "/buyer-panel" },
  "/admin": { label: "Admin Panel", path: "/admin" },
  "/auth": { label: "Authentication", path: "/auth" },
  "/chatbot": { label: "AI Assistant", path: "/chatbot" },
  "/farms": { label: "Farms", path: "/farms" },
  "/offices": { label: "Offices", path: "/offices" },
};

const categoryMapping: Record<string, BreadcrumbItem> = {
  "/diagnose": { label: "AI Tools", path: "#" },
  "/recommendations": { label: "AI Tools", path: "#" },
  "/buy": { label: "Marketplace", path: "#" },
  "/sell": { label: "Marketplace", path: "#" },
  "/marketplace": { label: "Marketplace", path: "#" },
  "/market-analysis": { label: "Analytics", path: "#" },
  "/government-schemes": { label: "Resources", path: "#" },
  "/community": { label: "Resources", path: "#" },
  "/hybrid": { label: "Resources", path: "#" },
  "/blogs": { label: "Resources", path: "#" },
  "/weather": { label: "Tools", path: "#" },
  "/support": { label: "Help", path: "#" },
  "/user-profile": { label: "Profile", path: "#" },
  "/buyer-panel": { label: "Business", path: "#" },
  "/admin": { label: "Admin", path: "#" },
};

interface NavigationBreadcrumbProps {
  className?: string;
  showHome?: boolean;
  showCategory?: boolean;
}

export function NavigationBreadcrumb({ 
  className, 
  showHome = true, 
  showCategory = true 
}: NavigationBreadcrumbProps) {
  const location = useLocation();
  const pathname = location.pathname;

  // Don't show breadcrumb on home page
  if (pathname === "/") {
    return null;
  }

  const currentPage = pathMapping[pathname];
  const category = showCategory ? categoryMapping[pathname] : null;

  if (!currentPage) {
    return null;
  }

  const breadcrumbItems: BreadcrumbItem[] = [];

  // Add home if requested
  if (showHome) {
    breadcrumbItems.push(pathMapping["/"]);
  }

  // Add category if it exists and is requested
  if (category) {
    breadcrumbItems.push(category);
  }

  // Add current page
  breadcrumbItems.push(currentPage);

  return (
    <nav className={cn("flex items-center space-x-2 text-sm bg-accent/30 px-4 py-2 rounded-lg mb-6", className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const IconComponent = item.icon;
          
          return (
            <li key={item.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}
              
              {isLast ? (
                <span className="flex items-center text-foreground font-medium">
                  {IconComponent && <IconComponent className="h-4 w-4 mr-1" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {IconComponent && <IconComponent className="h-4 w-4 mr-1" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}