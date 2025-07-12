import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, MapPin, CreditCard } from "lucide-react";
import { Order } from "@shared/schema";

interface OrderWithItems extends Order {
  items?: Array<{
    id: number;
    productId: number;
    quantity: number;
    priceAtTime: string;
    product: {
      id: number;
      name: string;
      price: string;
      imageUrl: string;
    };
  }>;
}

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Your Orders</h1>
              <p className="text-muted-foreground">Track and manage your order history</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">
                When you make your first purchase, it will appear here
              </p>
              <Button>Start Shopping</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'shipped':
        return 'secondary';
      case 'confirmed':
        return 'outline';
      case 'pending':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Placed';
      case 'confirmed':
        return 'Confirmed';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Order #{order.id}</span>
            </CardTitle>
            <CardDescription className="flex items-center space-x-4 mt-2">
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </span>
              <span className="flex items-center space-x-1">
                <CreditCard className="w-4 h-4" />
                <span>${order.totalAmount}</span>
              </span>
            </CardDescription>
          </div>
          <Badge variant={getStatusColor(order.status)}>
            {getStatusText(order.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Order Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span>#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={getStatusColor(order.status)} className="text-xs">
                    {getStatusText(order.status)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold">${order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Shipping Address</span>
              </h4>
              <div className="text-sm text-muted-foreground">
                {order.shippingAddressId ? (
                  <p>Address ID: {order.shippingAddressId}</p>
                ) : (
                  <p>No shipping address</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
            <Button variant="outline" className="w-full">
              Track Order
            </Button>
            {order.status === 'delivered' && (
              <Button variant="outline" className="w-full">
                Reorder
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}