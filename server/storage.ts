import { 
  users, 
  addresses,
  products, 
  cartItems, 
  orders,
  orderItems,
  sessions,
  awsMetrics,
  type User, 
  type InsertUser,
  type Address,
  type InsertAddress,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Session,
  type InsertSession,
  type AwsMetrics,
  type InsertAwsMetrics
} from "@shared/schema";
import bcrypt from "bcrypt";

export interface IStorage {
  // Users & Authentication
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Addresses
  getUserAddresses(userId: number): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, updates: Partial<Address>): Promise<Address | undefined>;
  deleteAddress(id: number): Promise<boolean>;
  
  // Products
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductStock(id: number, quantity: number): Promise<boolean>;
  
  // Cart
  getCartItems(userId: number): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Orders
  getUserOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  updateSessionActivity(sessionId: string): Promise<void>;
  getActiveSessions(): Promise<Session[]>;
  deactivateSession(sessionId: string): Promise<void>;
  
  // AWS Metrics
  getLatestMetrics(): Promise<AwsMetrics | undefined>;
  createMetrics(metrics: InsertAwsMetrics): Promise<AwsMetrics>;
  getMetricsHistory(limit: number): Promise<AwsMetrics[]>;
  getActiveUserCount(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private addresses: Map<number, Address>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private sessions: Map<string, Session>;
  private awsMetrics: Map<number, AwsMetrics>;
  private currentUserId: number;
  private currentAddressId: number;
  private currentProductId: number;
  private currentCartItemId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private currentMetricsId: number;

  constructor() {
    this.users = new Map();
    this.addresses = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.sessions = new Map();
    this.awsMetrics = new Map();
    this.currentUserId = 1;
    this.currentAddressId = 1;
    this.currentProductId = 1;
    this.currentCartItemId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentMetricsId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Initialize default user for development
    const defaultUser: User = {
      id: 1,
      username: "Nandini_Srivastava",
      email: "nandini.srivastava2004@gmail.com",
      password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password123
      firstName: "Nandini",
      lastName: "Srivastava",
      phone: "+1234567890",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date()
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2; // Next user ID will be 2
    
    // Initialize products
    const sampleProducts: InsertProduct[] = [
      {
        name: "Premium Smartphone",
        description: "Latest flagship with AI camera",
        price: "899.00",
        category: "electronics",
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: true
      },
      {
        name: "Wireless Headphones",
        description: "Premium noise-cancelling",
        price: "299.00",
        category: "electronics",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: true
      },
      {
        name: "Gaming Laptop",
        description: "High-performance gaming",
        price: "1299.00",
        category: "gadgets",
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: true
      },
      {
        name: "Smartwatch Pro",
        description: "Health & fitness tracking",
        price: "399.00",
        category: "gadgets",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: true
      },
      {
        name: "Professional Camera",
        description: "DSLR with 50MP sensor",
        price: "1899.00",
        category: "electronics",
        imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: true
      },
      {
        name: "Digital Tablet Pro",
        description: "Creative design tablet",
        price: "699.00",
        category: "gadgets",
        imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: true
      },
      {
        name: "Designer Jacket",
        description: "Premium leather material",
        price: "249.00",
        category: "fashion",
        imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: true
      },
      {
        name: "Premium Sneakers",
        description: "Limited edition design",
        price: "189.00",
        category: "fashion",
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: true
      },
      {
        name: "Smart Speaker",
        description: "Voice-controlled assistant",
        price: "129.00",
        category: "electronics",
        imageUrl: "https://images.unsplash.com/photo-1589003077984-894e133dabab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: true
      },
      {
        name: "VR Headset",
        description: "Immersive virtual reality",
        price: "499.00",
        category: "gadgets",
        imageUrl: "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: true
      },
      {
        name: "Luxury Watch",
        description: "Swiss craftsmanship",
        price: "799.00",
        category: "fashion",
        imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: true
      },
      {
        name: "Wireless Charger",
        description: "Fast charging technology",
        price: "59.00",
        category: "electronics",
        imageUrl: "https://images.unsplash.com/photo-1515041219749-89347f83291a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: true
      }
    ];

    sampleProducts.forEach(product => {
      this.createProduct(product);
    });
    
    // Initialize demo user
    this.createUser({
      username: "demo",
      email: "demo@cloudscale.com",
      password: "password123",
      firstName: "Demo",
      lastName: "User",
      phone: "+1234567890"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = { 
      ...insertUser, 
      id,
      password: hashedPassword,
      createdAt: new Date(),
      lastActive: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Address methods
  async getUserAddresses(userId: number): Promise<Address[]> {
    return Array.from(this.addresses.values()).filter(addr => addr.userId === userId);
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const id = this.currentAddressId++;
    const address: Address = { ...insertAddress, id };
    this.addresses.set(id, address);
    return address;
  }

  async updateAddress(id: number, updates: Partial<Address>): Promise<Address | undefined> {
    const address = this.addresses.get(id);
    if (!address) return undefined;
    
    const updatedAddress = { ...address, ...updates };
    this.addresses.set(id, updatedAddress);
    return updatedAddress;
  }

  async deleteAddress(id: number): Promise<boolean> {
    return this.addresses.delete(id);
  }

  // Product methods

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.category === category);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...insertProduct, 
      id,
      inStock: insertProduct.inStock ?? true,
      stockCount: insertProduct.stockCount ?? 100
    };
    this.products.set(id, product);
    return product;
  }

  async updateProductStock(id: number, quantity: number): Promise<boolean> {
    const product = this.products.get(id);
    if (!product) return false;
    
    product.stockCount = quantity;
    product.inStock = quantity > 0;
    this.products.set(id, product);
    return true;
  }

  // Cart methods

  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.userId === userId);
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId
    );
    
    if (existingItem) {
      // Update quantity instead of adding new item
      existingItem.quantity += insertCartItem.quantity ?? 1;
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    }
    
    const id = this.currentCartItemId++;
    const cartItem: CartItem = { 
      ...insertCartItem, 
      id,
      quantity: insertCartItem.quantity ?? 1,
      addedAt: new Date()
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (item) {
      item.quantity = quantity;
      this.cartItems.set(id, item);
      return item;
    }
    return undefined;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const userItems = Array.from(this.cartItems.entries()).filter(([, item]) => item.userId === userId);
    userItems.forEach(([id]) => this.cartItems.delete(id));
    return true;
  }

  // Order methods
  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { 
      ...insertOrder, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    order.status = status;
    order.updatedAt = new Date();
    this.orders.set(id, order);
    return order;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Session methods
  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.sessions.size + 1;
    const session: Session = { 
      ...insertSession, 
      id,
      createdAt: new Date(),
      lastActivity: new Date()
    };
    this.sessions.set(insertSession.sessionId, session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      this.sessions.set(sessionId, session);
    }
  }

  async getActiveSessions(): Promise<Session[]> {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
    
    return Array.from(this.sessions.values()).filter(session => 
      session.isActive && session.lastActivity > thirtyMinutesAgo
    );
  }

  async deactivateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.sessions.set(sessionId, session);
    }
  }

  // AWS Metrics methods
  async getLatestMetrics(): Promise<AwsMetrics | undefined> {
    const allMetrics = Array.from(this.awsMetrics.values());
    return allMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }

  async createMetrics(insertMetrics: InsertAwsMetrics): Promise<AwsMetrics> {
    const id = this.currentMetricsId++;
    const metrics: AwsMetrics = { 
      ...insertMetrics, 
      id,
      timestamp: new Date()
    };
    this.awsMetrics.set(id, metrics);
    return metrics;
  }

  async getMetricsHistory(limit: number): Promise<AwsMetrics[]> {
    const allMetrics = Array.from(this.awsMetrics.values());
    return allMetrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getActiveUserCount(): Promise<number> {
    const activeSessions = await this.getActiveSessions();
    return activeSessions.length;
  }

  async clearCart(userId: number): Promise<boolean> {
    const userItems = Array.from(this.cartItems.entries()).filter(([_, item]) => item.userId === userId);
    userItems.forEach(([id]) => this.cartItems.delete(id));
    return true;
  }

  async getLatestMetrics(): Promise<AwsMetrics | undefined> {
    const metrics = Array.from(this.awsMetrics.values());
    return metrics.length > 0 ? metrics[metrics.length - 1] : undefined;
  }

  async createMetrics(insertMetrics: InsertAwsMetrics): Promise<AwsMetrics> {
    const id = this.currentMetricsId++;
    const metrics: AwsMetrics = { 
      ...insertMetrics, 
      id, 
      timestamp: new Date(),
      scalingStatus: insertMetrics.scalingStatus ?? 'healthy'
    };
    this.awsMetrics.set(id, metrics);
    return metrics;
  }

  async getMetricsHistory(limit: number): Promise<AwsMetrics[]> {
    const metrics = Array.from(this.awsMetrics.values());
    return metrics.slice(-limit);
  }
}

export const storage = new MemStorage();
