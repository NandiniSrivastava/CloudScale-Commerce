import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Cloud, Search, ShoppingCart, User, Server, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onCartToggle: () => void;
}

interface CartItemWithProduct {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: string;
  };
}

export default function Header({ onCartToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart'],
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/logout", {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search query:', searchQuery);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary flex items-center">
              <Cloud className="w-8 h-8 mr-2" />
              CloudScale Commerce
            </h1>
            <div className="ml-6 text-sm text-muted-foreground flex items-center">
              <Server className="w-4 h-4 mr-1" />
              Auto-Scaling E-commerce Platform
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background border-border pl-10 w-64 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            </form>
            
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2"
              onClick={onCartToggle}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {totalItems > 99 ? '99+' : totalItems}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative p-2">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {logoutMutation.isPending ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
