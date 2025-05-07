import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";
import { ArrowLeft, ShoppingCart, Star, Plus, Minus, Heart, Info, Cookie, Pizza, IceCream } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Product interface definition
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

// CartItem interface definition
interface CartItem {
  product: Product;
  quantity: number;
}

// Sample products data
const products: Product[] = [
  {
    id: "1",
    name: "Organic Cotton Pads",
    description: "Pack of 10 organic cotton pads with wings. Eco-friendly and biodegradable.",
    price: 249,
    image: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=300&h=300",
    category: "Pads",
    rating: 4.5,
    inStock: true
  },
  {
    id: "2",
    name: "Reusable Menstrual Cup",
    description: "Medical-grade silicone cup. Eco-friendly alternative lasting up to 10 years.",
    price: 999,
    image: "https://images.unsplash.com/photo-1620553967329-53063e0f7dba?auto=format&fit=crop&w=300&h=300",
    category: "Cups",
    rating: 4.8,
    inStock: true
  },
  {
    id: "3",
    name: "Period Panties",
    description: "Absorbent underwear that can replace pads and tampons. Machine washable.",
    price: 799,
    image: "https://images.unsplash.com/photo-1651151856697-1539952ace4f?auto=format&fit=crop&w=300&h=300",
    category: "Underwear",
    rating: 4.7,
    inStock: true
  },
  {
    id: "4",
    name: "Organic Tampons",
    description: "Pack of 16 organic cotton tampons. No chemicals or synthetic materials.",
    price: 299,
    image: "https://images.unsplash.com/photo-1628624598821-b1e75af0f152?auto=format&fit=crop&w=300&h=300",
    category: "Tampons",
    rating: 4.3,
    inStock: true
  },
  {
    id: "5",
    name: "Heating Pad",
    description: "Electric heating pad to relieve menstrual cramps. Multiple heat settings.",
    price: 1499,
    image: "https://images.unsplash.com/photo-1584155828260-3f115bb741a8?auto=format&fit=crop&w=300&h=300",
    category: "Pain Relief",
    rating: 4.6,
    inStock: true
  },
  {
    id: "6",
    name: "Menstrual Disc",
    description: "Flexible disc that sits at the base of the cervix. Can be worn during intercourse.",
    price: 1199,
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=300&h=300",
    category: "Discs",
    rating: 4.4,
    inStock: false
  },
  {
    id: "7",
    name: "Dark Chocolate Bar",
    description: "Rich dark chocolate with 70% cocoa. Perfect for satisfying chocolate cravings.",
    price: 199,
    image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=300&h=300",
    category: "Cravings",
    rating: 4.9,
    inStock: true
  },
  {
    id: "8",
    name: "Sea Salt Potato Chips",
    description: "Crunchy potato chips with sea salt. The perfect salty snack for period cravings.",
    price: 99,
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&h=300",
    category: "Cravings",
    rating: 4.6,
    inStock: true
  },
  {
    id: "9",
    name: "Cookies & Cream Ice Cream",
    description: "Premium ice cream with chocolate cookie pieces. A sweet treat for your period.",
    price: 299,
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=300&h=300",
    category: "Cravings",
    rating: 4.7,
    inStock: true
  },
  {
    id: "10",
    name: "Cheese Pizza",
    description: "8-inch cheese pizza ready to heat. Comfort food for your period cravings.",
    price: 349,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&h=300",
    category: "Cravings",
    rating: 4.4,
    inStock: true
  },
  {
    id: "11",
    name: "Spicy Instant Noodles",
    description: "Pack of 5 spicy instant noodles. Quick and satisfying snack for period days.",
    price: 149,
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=300&h=300",
    category: "Cravings",
    rating: 4.2,
    inStock: true
  },
  {
    id: "12",
    name: "Caramel Popcorn",
    description: "Sweet and salty caramel popcorn. Perfect movie snack during your period.",
    price: 179,
    image: "https://images.unsplash.com/photo-1578849278619-e73a158e97c7?auto=format&fit=crop&w=300&h=300",
    category: "Cravings",
    rating: 4.5,
    inStock: true
  }
];

// Function to load Razorpay script
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("razorpay-script")) {
      resolve();
      return;
    }
    
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.body.appendChild(script);
  });
}

// Define Razorpay options interface
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    [key: string]: string;
  };
  theme?: {
    color: string;
  };
}

// Define Razorpay interface
interface RazorpayInterface {
  open(): void;
  on(event: string, callback: Function): void;
  close(): void;
}

// Declare Razorpay constructor in the global window object
declare global {
  interface Window {
    Razorpay(options: RazorpayOptions): RazorpayInterface;
  }
}

export default function Store() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const categories = Array.from(new Set(products.map(product => product.category)));

  const filteredProducts = selectedCategory 
    ? products.filter(product => product.category === selectedCategory)
    : products;

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

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity, 
    0
  );

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Cravings":
        return <Cookie className="h-4 w-4 mr-1 text-femme-pink" />;
      default:
        return null;
    }
  };

  // Enhanced Razorpay checkout function
  const handleRazorpayCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessingPayment(true);
      toast({
        title: "Processing Payment",
        description: "Preparing the checkout...",
      });

      // Load the Razorpay script
      await loadRazorpayScript();
      
      // Calculate final amount (in paise/cents)
      const totalAmount = (totalPrice + 99) * 100;
      
      // Create a Razorpay order
      // In a production app, this would be a call to your backend API
      // For demo purposes, we'll create an order directly here
      const orderData = {
        amount: totalAmount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          description: "Order from FemmeStore"
        }
      };
      
      // Normally you would call your backend API to create an order
      // For example: const response = await fetch('/api/create-order', { method: 'POST', body: JSON.stringify(orderData) });
      // And then get the order_id from the response
      
      // For demo purposes, we'll simulate an order creation response
      const orderId = `ord_${Date.now()}`;
      
      // Razorpay options configuration
      const options: RazorpayOptions = {
        key: "rzp_test_e9BjcfyTS09nFa", // Replace with your Razorpay key
        amount: totalAmount,
        currency: "INR",
        name: "FemmeStore",
        description: `Payment for ${cartItems.length} items`,
        image: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef", // Logo URL
        order_id: orderId, // This should come from your backend for security
        handler: function(response) {
          // Handle successful payment
          console.log("Payment successful", response);
          toast({
            title: "Payment Successful",
            description: "Your order has been placed successfully!",
          });
          // Clear the cart after successful payment
          setCartItems([]);
          setShowCart(false);
          
          // Redirect to success page
          // window.location.href = "/dashboard?payment=success";
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        notes: {
          address: "FemmeStore Office"
        },
        theme: {
          color: "#d1478c" // Femme pink color
        }
      };

      // Initialize Razorpay
      const rzp = new window.Razorpay(options);
      
      // Handle payment failures
      rzp.on('payment.failed', function(response: any) {
        console.error('Payment failed:', response.error);
        toast({
          title: "Payment Failed",
          description: response.error.description || "There was an issue with your payment.",
          variant: "destructive",
        });
      });
      
      // Open Razorpay checkout
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
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
                {getCategoryIcon(category)}
                {category}
              </Button>
            ))}
          </div>
        </div>

        {(selectedCategory === "Cravings" || selectedCategory === null) && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Cookie className="h-5 w-5 text-femme-burgundy mr-2" />
              <h2 className="text-xl font-semibold text-femme-burgundy">Period Cravings</h2>
            </div>
            <p className="text-femme-burgundy/70 mb-4">
              Satisfy your period cravings with our selection of comforting snacks and treats. We've got sweet, salty, and everything in between!
            </p>
          </div>
        )}

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
                {product.category === "Cravings" && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-femme-pink text-white">Cravings</Badge>
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
                <div className="font-semibold text-femme-burgundy">₹{product.price}</div>
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
                          <p className="text-sm text-femme-burgundy/70">₹{item.product.price}</p>
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
                      <span className="text-femme-burgundy">₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-femme-burgundy/70">Shipping</span>
                      <span className="text-femme-burgundy">₹99</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold mb-6">
                      <span className="text-femme-burgundy">Total</span>
                      <span className="text-femme-burgundy">₹{(totalPrice + 99)}</span>
                    </div>
                    <Button 
                      className="w-full bg-femme-pink hover:bg-femme-pink/90 mb-2"
                      onClick={handleRazorpayCheckout}
                      disabled={isProcessingPayment}
                    >
                      {isProcessingPayment ? 'Processing...' : 'Pay with Razorpay'}
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
