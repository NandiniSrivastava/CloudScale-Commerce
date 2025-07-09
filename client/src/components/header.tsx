import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Cloud, Search, ShoppingCart, User, Server } from "lucide-react";

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

  const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart'],
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search query:', searchQuery);
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
            
            {/* User Profile */}
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-foreground font-medium">John Doe</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
