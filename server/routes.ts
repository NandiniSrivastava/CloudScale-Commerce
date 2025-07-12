import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertCartItemSchema, 
  insertAwsMetricsSchema, 
  insertUserSchema, 
  loginSchema,
  insertOrderSchema,
  insertAddressSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import cookieParser from "cookie-parser";
import crypto from "crypto";

// Session tracking for real user metrics
const activeSessions = new Set<string>();

// Middleware for authentication
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if ((req.session as any)?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

// Session tracking middleware
function trackSession(req: Request, res: Response, next: NextFunction) {
  const sessionId = (req.session as any)?.id || req.sessionID;
  const userId = (req.session as any)?.userId;
  
  if (!activeSessions.has(sessionId)) {
    activeSessions.add(sessionId);
    
    // Create session record for metrics
    if (userId) {
      storage.createSession({
        userId,
        sessionId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        isActive: true
      });
    }
  }
  
  // Update session activity
  if (userId) {
    storage.updateSessionActivity(sessionId);
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Session configuration
  app.use(cookieParser());
  app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 30 * 60 * 1000 // 30 minutes
    }
  }));
  
  // Apply session tracking to all routes
  app.use(trackSession);

  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      (req.session as any).userId = user.id;
      
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Update last active time
      await storage.updateUser(user.id, { lastActive: new Date() });
      
      (req.session as any).userId = user.id;
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.post("/api/logout", (req, res) => {
    const sessionId = req.sessionID;
    activeSessions.delete(sessionId);
    
    if ((req.session as any)?.userId) {
      storage.deactivateSession(sessionId);
    }
    
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/me", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

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

  // Cart routes (requires authentication)
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const cartItems = await storage.getCartItems(userId);
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

  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        userId
      });
      const cartItem = await storage.addToCart(validatedData);
      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid cart item data" });
    }
  });

  app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
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

  app.delete("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Address routes
  app.get("/api/addresses", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const addresses = await storage.getUserAddresses(userId);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.post("/api/addresses", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const validatedData = insertAddressSchema.parse({
        ...req.body,
        userId
      });
      const address = await storage.createAddress(validatedData);
      res.json(address);
    } catch (error) {
      res.status(400).json({ message: "Invalid address data" });
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { shippingAddressId, billingAddressId } = req.body;
      
      // Get cart items
      const cartItems = await storage.getCartItems(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total
      let totalAmount = 0;
      const orderItemsData = [];
      
      for (const cartItem of cartItems) {
        const product = await storage.getProduct(cartItem.productId);
        if (!product) continue;
        
        const itemTotal = parseFloat(product.price) * cartItem.quantity;
        totalAmount += itemTotal;
        
        orderItemsData.push({
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          priceAtTime: product.price
        });
      }
      
      // Create order
      const order = await storage.createOrder({
        userId,
        status: "pending",
        totalAmount: totalAmount.toFixed(2),
        shippingAddressId,
        billingAddressId
      });
      
      // Create order items
      for (const itemData of orderItemsData) {
        await storage.createOrderItem({
          orderId: order.id,
          ...itemData
        });
      }
      
      // Clear cart
      await storage.clearCart(userId);
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to create order" });
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

  // Function to broadcast real metrics to all clients
  async function sendMetricsUpdate() {
    // Get real active user count from sessions
    const realActiveUsers = await storage.getActiveUserCount();
    const totalConnections = activeConnections.size;
    
    // Use real metrics for auto-scaling decisions
    const activeUsers = Math.max(realActiveUsers, totalConnections);
    
    // Auto-scaling logic: scale up when 4+ users are active
    const shouldScale = activeUsers >= 4;
    const ec2Instances = shouldScale ? Math.min(Math.floor(activeUsers / 2) + 1, 10) : 2;
    
    // Dynamic CPU and response time based on load
    const loadFactor = activeUsers / 10;
    const cpuUtilization = Math.min(20 + (loadFactor * 50), 90).toFixed(2);
    const responseTime = Math.floor(200 + (loadFactor * 300));
    const loadPercentage = Math.min(Math.floor(loadFactor * 100), 95);
    
    const scalingStatus = shouldScale ? "scaling" : "healthy";

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
