"use client";

import { useEffect, useState } from "react";
import { Plus, Minus, Trash2, ShoppingCart, Loader2 } from "lucide-react";

export default function POSPage() {
    const [items, setItems] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/pos/items')
            .then(res => res.json())
            .then(data => {
                if (data.success) setItems(data.items);
                setLoading(false);
            });
    }, []);

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i._id === id) {
                const newQty = i.qty + delta;
                return newQty > 0 ? { ...i, qty: newQty } : i;
            }
            return i;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(i => i._id !== id));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    const handleCheckout = async () => {
        if (!confirm(`Confirm order total: BDT ${total}?`)) return;
        setLoading(true);

        try {
            const res = await fetch('/api/pos/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    paymentMethod: 'cash', // Default to cash for MVP
                    guestDetails: { name: 'Walk-in Customer' } // Default
                })
            });

            const data = await res.json();
            if (data.success) {
                alert('Order created successfully!');
                setCart([]); // Clear cart
            } else {
                alert('Failed: ' + data.error);
            }
        } catch (err) {
            alert('Error creating order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-theme(spacing.24))] gap-6">
            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto pr-2">
                <h1 className="text-2xl font-bold mb-6">Point of Sale</h1>

                {loading ? <div>Loading...</div> : (
                    <div className="grid grid-cols-3 gap-4">
                        {items.map(item => (
                            <div
                                key={item._id}
                                onClick={() => addToCart(item)}
                                className="bg-white p-4 rounded-xl border shadow-sm cursor-pointer hover:border-blue-500 transition-all active:scale-95"
                            >
                                <div className="h-24 bg-gray-100 rounded-lg mb-3"></div>
                                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                <p className="text-blue-600 font-bold mt-1">BDT {item.price}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cart Sidebar */}
            <div className="w-96 bg-white rounded-xl shadow-lg border flex flex-col">
                <div className="p-4 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" /> Current Order
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">Empty Cart</div>
                    ) : (
                        cart.map(item => (
                            <div key={item._id} className="flex justify-between items-center group">
                                <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-gray-500">BDT {item.price} x {item.qty}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border rounded-lg bg-gray-50">
                                        <button onClick={() => updateQty(item._id, -1)} className="p-1 hover:bg-gray-200 rounded-l-lg"><Minus className="h-3 w-3" /></button>
                                        <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                                        <button onClick={() => updateQty(item._id, 1)} className="p-1 hover:bg-gray-200 rounded-r-lg"><Plus className="h-3 w-3" /></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item._id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-xl space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total (est. tax +5%)</span>
                        <span>BDT {(total * 1.05).toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Proceed to Payment"}
                    </button>
                </div>
            </div>
        </div>
    );
}
