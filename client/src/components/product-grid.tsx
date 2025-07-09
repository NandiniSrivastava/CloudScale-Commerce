import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface ProductGridProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function ProductGrid({ selectedCategory, onCategoryChange }: ProductGridProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity?: number }) => {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'gadgets', name: 'Tech Gadgets' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handleAddToCart = (productId: number) => {
    addToCartMutation.mutate({ productId });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Category Filters Skeleton */}
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 w-24 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
        
        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="w-full h-48 bg-gray-800 animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-800 rounded animate-pulse" />
                <div className="h-3 bg-gray-800 rounded w-3/4 animate-pulse" />
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-800 rounded w-16 animate-pulse" />
                  <div className="h-9 bg-gray-800 rounded w-20 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-4">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`category-filter ${
              selectedCategory === category.id ? 'active' : ''
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="product-card group">
            <div className="relative overflow-hidden">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {!product.inStock && (
                <Badge className="absolute top-2 right-2 bg-red-500/20 text-red-400">
                  Out of Stock
                </Badge>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">(4.5)</span>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xl font-bold text-primary">
                    ${product.price}
                  </span>
                  
                  <Button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={!product.inStock || addToCartMutation.isPending}
                    className="cart-button"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No products found in this category.</p>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {filteredProducts.length > 0 && (
        <div className="text-center">
          <Button 
            variant="outline" 
            className="bg-secondary hover:bg-secondary/80"
          >
            Load More Products
          </Button>
        </div>
      )}
    </div>
  );
}
