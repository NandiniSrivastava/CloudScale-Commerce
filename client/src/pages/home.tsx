import { useState } from "react";
import MonitoringSidebar from "@/components/monitoring-sidebar";
import Header from "@/components/header";
import ProductGrid from "@/components/product-grid";
import CartSidebar from "@/components/cart-sidebar";
import { useWebSocket } from "@/hooks/use-websocket";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const { metrics, connected } = useWebSocket();

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleCartToggle = () => {
    setCartOpen(!cartOpen);
  };

  const showScalingAlert = metrics && metrics.activeUsers >= 5;

  return (
    <div className="bg-background text-foreground min-h-screen overflow-hidden">
      <MonitoringSidebar 
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        metrics={metrics}
        connected={connected}
      />
      
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'ml-0' : 'ml-80'
      }`}>
        <Header onCartToggle={handleCartToggle} />
        
        {showScalingAlert && (
          <Alert className="bg-warning/10 border-warning text-warning mx-6 mt-4">
            <TriangleAlert className="h-4 w-4" />
            <AlertDescription>
              Auto-scaling triggered: High traffic detected ({metrics.activeUsers}+ users)
            </AlertDescription>
          </Alert>
        )}

        <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
          {/* Hero Section */}
          <div className="mb-12">
            <div 
              className="relative h-64 rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(16, 185, 129, 0.6)), url("https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400") center/cover'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Next-Gen E-commerce Platform
                  </h2>
                  <p className="text-xl text-gray-200 mb-6">
                    Powered by AWS Auto-Scaling Technology
                  </p>
                  <button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-colors"
                    onClick={() => {
                      document.getElementById('products-section')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }}
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div id="products-section">
            <ProductGrid 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-card border-t border-border mt-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">
                  CloudScale Commerce
                </h3>
                <p className="text-muted-foreground text-sm">
                  Auto-scaling e-commerce platform powered by AWS infrastructure.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Infrastructure</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Auto Scaling Groups</li>
                  <li>Application Load Balancer</li>
                  <li>CloudWatch Monitoring</li>
                  <li>Multi-AZ Deployment</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Regions</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>ap-south-1a (Mumbai)</li>
                  <li>ap-south-1b (Mumbai)</li>
                  <li>High Availability</li>
                  <li>Disaster Recovery</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Contact</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>support@cloudscale.com</li>
                  <li>+91 (0) 000-000-0000</li>
                  <li>24/7 Infrastructure Support</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; 2024 CloudScale Commerce. Powered by AWS Auto-Scaling Technology.</p>
            </div>
          </div>
        </footer>
      </div>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
