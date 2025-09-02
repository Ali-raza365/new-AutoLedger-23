import { Link, useLocation } from "wouter";
import {
  Car,
  BarChart3,
  Receipt,
  ChartBar,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Car Inventory", href: "/inventory", icon: Car },
  { name: "Sales Log", href: "/sales", icon: Receipt },
  { name: "Reports", href: "/reports", icon: ChartBar },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <Car className="text-primary text-2xl mr-3" />
        <h1 className="text-xl font-semibold text-gray-900">DealerPro</h1>
      </div>

      <nav className="mt-6">
        <div className="px-3">
          {navigation.map((item) => {
            const isActive =
              location === item.href ||
              (location === "/" && item.href === "/dashboard");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
              >
                <button
                  className={cn(
                    "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors",
                    isActive
                      ? "text-primary bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                  )}
                >
                  <Icon className="mr-3" size={18} />
                  {item.name}
                </button>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 z-50 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
            <User className="text-white" size={16} />
          </div>
          <div className="ml-2 flex-1">
            <p
              className="text-sm font-medium text-gray-700"
              data-testid="text-username"
            >
              {user?.username || "User"}
            </p>
            <p
              className="text-xs text-gray-500 capitalize"
              data-testid="text-role"
            >
              {user?.userType || "employee"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="ml-auto p-1 text-gray-400 hover:text-gray-500"
            data-testid="button-logout"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
