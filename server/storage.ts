import { 
  users, 
  products, 
  cartItems, 
  awsMetrics,
  type User, 
  type InsertUser,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type AwsMetrics,
  type InsertAwsMetrics
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Cart
  getCartItems(userId: number): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // AWS Metrics
  getLatestMetrics(): Promise<AwsMetrics | undefined>;
  createMetrics(metrics: InsertAwsMetrics): Promise<AwsMetrics>;
  getMetricsHistory(limit: number): Promise<AwsMetrics[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private awsMetrics: Map<number, AwsMetrics>;
  private currentUserId: number;
  private currentProductId: number;
  private currentCartItemId: number;
  private currentMetricsId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.awsMetrics = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCartItemId = 1;
    this.currentMetricsId = 1;
    
    // Initialize with sample products
    this.initializeProducts();
  }

  private initializeProducts() {
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
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

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
      inStock: insertProduct.inStock ?? true 
    };
    this.products.set(id, product);
    return product;
  }

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
      quantity: insertCartItem.quantity ?? 1
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
