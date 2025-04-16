
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";
import { ArrowLeft, ShoppingCart, Star, Plus, Minus, Heart, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Define types for products
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  inStock: boolean;
}

// Sample product data
const products: Product[] = [
  {
    id: "1",
    name: "Organic Cotton Pads",
    description: "Pack of 10 organic cotton pads with wings. Eco-friendly and biodegradable.",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=300&h=300",
    category: "Pads",
    rating: 4.5,
    inStock: true
  },
  {
    id: "2",
    name: "Reusable Menstrual Cup",
    description: "Medical-grade silicone cup. Eco-friendly alternative lasting up to 10 years.",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300",
    category: "Cups",
    rating: 4.8,
    inStock: true
  },
  {
    id: "3",
    name: "Period Panties",
    description: "Absorbent underwear that can replace pads and tampons. Machine washable.",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=300&h=300",
    category: "Underwear",
    rating: 4.7,
    inStock: true
  },
  {
    id: "4",
    name: "Organic Tampons",
    description: "Pack of 16 organic cotton tampons. No chemicals or synthetic materials.",
    price: 6.49,
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=300&h=300",
    category: "Tampons",
    rating: 4.3,
    inStock: true
  },
  {
    id: "5",
    name: "Heating Pad",
    description: "Electric heating pad to relieve menstrual cramps. Multiple heat settings.",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300",
    category: "Pain Relief",
    rating: 4.6,
    inStock: true
  },
  {
    id: "6",
    name: "Menstrual Disc",
    description: "Flexible disc that sits at the base of the cervix. Can be worn during intercourse.",
    price: 27.99,
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=300&h=300",
    category: "Discs",
    rating: 4.4,
    inStock: false
  }
];

// Cart interface
interface CartItem {
  product: Product;
  quantity: number;
}

export default function Store() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get all unique categories
  const categories = Array.from(new Set(products.map(product => product.category)));

  // Filter products by category if selected
  const filteredProducts = selectedCategory 
    ? products.filter(product => product.category === selectedCategory)
    : products;

  // Add product to cart
  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevItems, { product, quantity: 1 }];
      }
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Remove product from cart
  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map(item => 
          item.product.id === productId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        return prevItems.filter(item => item.product.id !== productId);
      }
    });
  };

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity, 
    0
  );

  // Rating Stars component
  const RatingStars = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-femme-pink text-femme-pink" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="h-4 w-4 text-femme-pink" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="h-4 w-4 fill-femme-pink text-femme-pink" />
            </div>
          </div>
        )}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-femme-pink" />
        ))}
        <span className="ml-1 text-xs text-femme-burgundy/70">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-femme-beige to-femme-pink-light">
      <header className="bg-white shadow-md py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Logo className="h-10" />
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild className="border-femme-pink text-femme-burgundy hover:bg-femme-pink-light hover:text-femme-burgundy">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="border-femme-pink text-femme-burgundy hover:bg-femme-pink-light hover:text-femme-burgundy relative"
              onClick={() => setShowCart(!showCart)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
              {cartItems.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-femme-pink text-white text-xs px-1.5 py-0.5 rounded-full">
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-femme-burgundy mb-4">FemmeStore</h1>
          <p className="text-femme-burgundy/70 mb-4">
            Shop for high-quality menstrual products that are both comfortable and environmentally friendly.
          </p>
          
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button 
              variant={selectedCategory === null ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-femme-pink hover:bg-femme-pink/90" : ""}
            >
              All
            </Button>
            {categories.map(category => (
              <Button 
                key={category} 
                variant={selectedCategory === category ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-femme-pink hover:bg-femme-pink/90" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="overflow-hidden shadow-lg border-femme-taupe border-opacity-50 h-full flex flex-col">
              <div className="relative pb-[56.25%] bg-femme-beige">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold px-3 py-1 bg-femme-burgundy rounded-full">Out of Stock</span>
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-femme-burgundy text-lg">{product.name}</CardTitle>
                  <Button variant="ghost" size="icon" className="text-femme-pink hover:text-femme-burgundy hover:bg-femme-pink-light h-8 w-8">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
                <RatingStars rating={product.rating} />
              </CardHeader>
              <CardContent className="pb-2 flex-grow">
                <p className="text-sm text-femme-burgundy/70 line-clamp-2">{product.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-2">
                <div className="font-semibold text-femme-burgundy">${product.price.toFixed(2)}</div>
                <Button 
                  className="bg-femme-pink hover:bg-femme-pink/90" 
                  size="sm"
                  disabled={!product.inStock}
                  onClick={() => addToCart(product)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Cart sidebar */}
        {showCart && (
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-20 overflow-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-femme-burgundy">Your Cart</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCart(false)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Continue Shopping
                </Button>
              </div>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-femme-pink/50 mb-4" />
                  <p className="text-femme-burgundy/70">Your cart is empty</p>
                  <Button 
                    className="mt-4 bg-femme-pink hover:bg-femme-pink/90"
                    onClick={() => setShowCart(false)}
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cartItems.map(item => (
                      <div key={item.product.id} className="flex items-center border-b border-femme-taupe/20 pb-2">
                        <div className="h-16 w-16 bg-femme-beige rounded-md overflow-hidden mr-4">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-sm font-medium text-femme-burgundy">{item.product.name}</h3>
                          <p className="text-sm text-femme-burgundy/70">${item.product.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 border-femme-taupe"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-2 text-femme-burgundy">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 border-femme-taupe"
                            onClick={() => addToCart(item.product)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-femme-taupe/20 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-femme-burgundy/70">Subtotal</span>
                      <span className="text-femme-burgundy">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-femme-burgundy/70">Shipping</span>
                      <span className="text-femme-burgundy">$5.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold mb-6">
                      <span className="text-femme-burgundy">Total</span>
                      <span className="text-femme-burgundy">${(totalPrice + 5).toFixed(2)}</span>
                    </div>
                    <Button 
                      className="w-full bg-femme-pink hover:bg-femme-pink/90 mb-2"
                      onClick={() => {
                        toast({
                          title: "Order Placed!",
                          description: "Your order has been successfully placed.",
                        });
                        setCartItems([]);
                        setShowCart(false);
                      }}
                    >
                      Checkout
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-femme-pink text-femme-burgundy hover:bg-femme-pink-light hover:text-femme-burgundy"
                      onClick={() => setShowCart(false)}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
