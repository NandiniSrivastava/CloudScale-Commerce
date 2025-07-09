import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertCartItemSchema, insertAwsMetricsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Products routes
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Cart routes (using userId = 1 for demo)
  app.get("/api/cart", async (_req, res) => {
    try {
      const cartItems = await storage.getCartItems(1);
      const itemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return { ...item, product };
        })
      );
      res.json(itemsWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        userId: 1 // Demo user
      });
      const cartItem = await storage.addToCart(validatedData);
      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid cart item data" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      const updatedItem = await storage.updateCartItemQuantity(id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.removeFromCart(id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", async (_req, res) => {
    try {
      await storage.clearCart(1);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // AWS Metrics routes
  app.get("/api/metrics", async (_req, res) => {
    try {
      const metrics = await storage.getLatestMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get("/api/metrics/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getMetricsHistory(limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics history" });
    }
  });

  // WebSocket server for real-time metrics
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Track active connections for user simulation
  let activeConnections = new Set<WebSocket>();
  
  wss.on('connection', function connection(ws) {
    activeConnections.add(ws);
    console.log('Client connected. Active connections:', activeConnections.size);
    
    // Send initial metrics
    sendMetricsUpdate();
    
    ws.on('close', function() {
      activeConnections.delete(ws);
      console.log('Client disconnected. Active connections:', activeConnections.size);
      sendMetricsUpdate();
    });
    
    ws.on('error', function(error) {
      console.error('WebSocket error:', error);
      activeConnections.delete(ws);
    });
  });

  // Function to broadcast metrics to all clients
  async function sendMetricsUpdate() {
    const activeUsers = Math.max(activeConnections.size, Math.floor(Math.random() * 3) + 3);
    const ec2Instances = activeUsers >= 5 ? Math.min(Math.floor(activeUsers / 2) + 1, 10) : 2;
    const cpuUtilization = (Math.random() * 30 + 20).toFixed(2);
    const responseTime = Math.floor(Math.random() * 100) + 200;
    const loadPercentage = Math.floor((activeUsers / 10) * 100);
    const scalingStatus = activeUsers >= 5 ? "scaling" : "healthy";

    const metrics = {
      activeUsers,
      ec2Instances,
      cpuUtilization,
      responseTime,
      loadPercentage,
      scalingStatus
    };

    // Store metrics in storage
    try {
      await storage.createMetrics(metrics);
    } catch (error) {
      console.error('Failed to store metrics:', error);
    }

    // Broadcast to all connected clients
    const message = JSON.stringify({
      type: 'metrics_update',
      data: metrics
    });

    activeConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // Send metrics updates every 5 seconds
  setInterval(sendMetricsUpdate, 5000);

  return httpServer;
}
