'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ShoppingBag,
  RefreshCw,
  Check,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useUIStore } from '@/state/ui.store';
import { useCartStore } from '@/state/cart.store';
import { useNotificationStore } from '@/state/notification.store';
import { Product } from '@/interfaces/product.interface';
import { chatService } from '@/api/services/chat.service';
import { mapApiProductToProduct } from '@/api/services/product.service';
import { useConfirmChatAction, useClearChatHistory, useChatHistory } from '@/api/queries/useChat';
import { ChatAction } from '@/interfaces/chat.interface';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestedProducts?: Product[];
  actions?: ChatAction[];
  quickReplies?: string[];
  imagePreview?: string;
  isError?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: "Hello! 👋 I'm your SRIBEES AI Smart Assistant. How can I help you today? Ask me for Sri Lankan recipes, grocery suggestions, stock checks, or order status!",
    timestamp: 'Just now',
    quickReplies: [
      '🍲 Sri Lankan Chicken Curry Ingredients',
      '📦 Track SriBees Express Delivery',
      '☕ Recommended Ceylon Teas',
      '🥗 Low-Carb Healthy Grocery List',
    ],
  },
];

const SAMPLE_PRODUCTS: Record<string, Partial<Product>[]> = {
  curry: [
    {
      id: 'prod-curry-1',
      title: 'Fresh Free-Range Whole Chicken (1kg)',
      price: 1450,
      originalPrice: 1600,
      unit: 'kg',
      image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-curry-2',
      title: 'SRIBEES Roasted Curry Powder (250g)',
      price: 380,
      unit: 'pack',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&auto=format&fit=crop&q=80',
    },
  ],
  tea: [
    {
      id: 'prod-tea-1',
      title: 'Premium Dilmah Ceylon FBOP Black Tea (500g)',
      price: 1850,
      unit: 'pack',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=80',
    },
  ],
};

export const AiChatWidget: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const {
    isAiChatOpen,
    toggleAiChat,
    setIsAiChatOpen,
    isLoginModalOpen,
    isLocationModalOpen,
    quickViewProduct,
    isUserDropdownOpen,
  } = useUIStore();
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const isNotificationOpen = useNotificationStore((state) => state.isDropdownOpen);
  const addItemToCart = useCartStore((state) => state.addItem);

  // Dynamic DOM modal / popup detection
  const [isDomModalOpen, setIsDomModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkDomModal = () => {
      const isBodyLocked =
        document.body.style.overflow === 'hidden' ||
        document.body.getAttribute('data-modal-open') === 'true';

      const hasModalOverlay = Boolean(
        document.querySelector(
          '.fixed.inset-0:not([data-ai-chat-ignore]), [role="dialog"]:not([data-ai-chat-ignore]), [aria-modal="true"]:not([data-ai-chat-ignore])'
        )
      );

      setIsDomModalOpen(isBodyLocked || hasModalOverlay);
    };

    checkDomModal();

    const handleModalToggle = (e: Event) => {
      const customEvt = e as CustomEvent<{ isOpen?: boolean }>;
      if (typeof customEvt.detail?.isOpen === 'boolean') {
        setIsDomModalOpen(customEvt.detail.isOpen);
      } else {
        checkDomModal();
      }
    };

    window.addEventListener('app:modal-toggle', handleModalToggle);

    const observer = new MutationObserver(() => {
      checkDomModal();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class', 'data-modal-open'],
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener('app:modal-toggle', handleModalToggle);
      observer.disconnect();
    };
  }, []);

  const isModalOrPopupOpen =
    isLocationModalOpen ||
    isLoginModalOpen ||
    Boolean(quickViewProduct) ||
    isUserDropdownOpen ||
    isCartOpen ||
    isNotificationOpen ||
    isDomModalOpen;

  // Auto-close chat window if a modal/popup opens
  useEffect(() => {
    if (isModalOrPopupOpen && isAiChatOpen) {
      setIsAiChatOpen(false);
    }
  }, [isModalOrPopupOpen, isAiChatOpen, setIsAiChatOpen]);

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [confirmedTokens, setConfirmedTokens] = useState<Record<string, boolean>>({});

  // Image Attachment state
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    preview: string;
    base64: string;
    mimeType: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // TanStack Query Hooks
  const { data: serverHistory } = useChatHistory();
  const confirmActionMutation = useConfirmChatAction();
  const clearHistoryMutation = useClearChatHistory();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydrate messages from backend server history if available
  useEffect(() => {
    if (serverHistory && Array.isArray(serverHistory) && serverHistory.length > 0) {
      const formattedHistory: Message[] = serverHistory.map((item: any, idx: number) => ({
        id: item.id || `hist-${idx}-${Date.now()}`,
        sender: item.role === 'user' || item.sender === 'user' ? 'user' : 'ai',
        text: item.content || item.reply || item.message || '',
        timestamp: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        suggestedProducts: item.products ? item.products.map(mapApiProductToProduct) : undefined,
        actions: item.actions || undefined,
      }));
      if (formattedHistory.length > 0) {
        setMessages(formattedHistory);
      }
    }
  }, [serverHistory]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAiChatOpen) {
      scrollToBottom();
    }
  }, [messages, isAiChatOpen, isTyping, currentStage]);

  if (!mounted) return null;

  // Handle Image File Selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Image size must be less than 4MB');
      return;
    }

    const mimeType = file.type || 'image/jpeg';
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Strip data URL prefix for base64 payload as per WEB_STOREFRONT_API.md spec
      const base64Data = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');

      setSelectedImage({
        file,
        preview: dataUrl,
        base64: base64Data,
        mimeType,
      });
    };

    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() && !selectedImage) return;

    const currentImage = selectedImage;
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text || (currentImage ? '📷 Sent an image' : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imagePreview: currentImage?.preview,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setIsTyping(true);
    setCurrentStage('Connecting to SRIBEES AI...');

    const payload = {
      message: text || 'Analyze this image',
      image_base64: currentImage?.base64 || null,
      image_mime_type: currentImage?.mimeType || null,
    };

    // Helper to process AI response payload
    const processAiResponse = (resData: any) => {
      const rawProducts = resData.products || [];
      const mappedProducts: Product[] = rawProducts.map((p: any) => mapApiProductToProduct(p));

      let quickReplies: string[] | undefined = undefined;
      if (!resData.actions || resData.actions.length === 0) {
        quickReplies = ['🛒 View My Cart', '🌶️ Spice Deals Today', '🚚 Express Delivery Info'];
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: resData.reply || "I've checked our SRIBEES database! How else can I assist your grocery shopping today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProducts: mappedProducts.length > 0 ? mappedProducts : undefined,
        actions: resData.actions && resData.actions.length > 0 ? resData.actions : undefined,
        quickReplies,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      setCurrentStage(null);
    };

    // Attempt standard REST API call first for maximum reliability & CORS compatibility
    try {
      const resData = await chatService.sendMessage(payload);
      processAiResponse(resData);
    } catch (apiErr: any) {
      console.warn('REST Chat API returned error or 503, attempting stream or fallback:', apiErr);

      // Attempt stream API call as secondary option
      let streamSuccess = false;
      await chatService.sendMessageStream(payload, {
        onStage: (stageData) => {
          let stageText = 'Thinking...';
          if (stageData.stage === 'understanding') {
            stageText = 'Understanding your request...';
          } else if (stageData.stage === 'searching') {
            stageText = `Searching catalog (${stageData.terms?.join(', ') || 'products'})...`;
          } else if (stageData.stage === 'orders') {
            stageText = 'Checking order records...';
          } else if (stageData.stage === 'preparing') {
            stageText = 'Preparing assistant recommendations...';
          }
          setCurrentStage(stageText);
        },
        onDone: (resData) => {
          streamSuccess = true;
          processAiResponse(resData);
        },
        onError: (errData) => {
          console.warn('Stream API error:', errData);
        },
      });

      if (!streamSuccess) {
        // Handle server 503 / capacity limits or offline status gracefully
        const lower = payload.message.toLowerCase();
        let aiText = "SRIBEES AI service is currently at peak capacity on the server (503 Service Unavailable). Here are top recommendations for your search:";
        let sampleProds: Partial<Product>[] | undefined = undefined;

        if (lower.includes('curry') || lower.includes('chicken') || lower.includes('recipe') || lower.includes('hi') || lower.includes('mokd')) {
          aiText = "Here are fresh free-range meats and authentic curry ingredients ready for express delivery:";
          sampleProds = SAMPLE_PRODUCTS.curry;
        } else if (lower.includes('tea') || lower.includes('ceylon')) {
          aiText = "Ceylon Black Tea is fresh from the Nuwara Eliya estates. Here is our top export quality tea:";
          sampleProds = SAMPLE_PRODUCTS.tea;
        } else if (lower.includes('track') || lower.includes('order')) {
          aiText = "⚡ All SRIBEES Express orders are dispatched quickly! Check your Orders tab for real-time tracking.";
        }

        const fallbackProducts: Product[] = (sampleProds || SAMPLE_PRODUCTS.curry || []).map((p) => mapApiProductToProduct(p));

        const fallbackMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedProducts: fallbackProducts.length > 0 ? fallbackProducts : undefined,
          quickReplies: ['🛒 View My Cart', '🌶️ Spice Deals Today', '🚚 Express Delivery Info'],
        };

        setMessages((prev) => [...prev, fallbackMsg]);
        setIsTyping(false);
        setCurrentStage(null);
      }
    }
  };

  const handleAddToCart = (product: Product | Partial<Product>) => {
    const prodId = product.id || product.product_id || `ai-p-${Date.now()}`;
    const formattedProd = mapApiProductToProduct(product);

    addItemToCart({
      id: prodId,
      title: formattedProd.title || formattedProd.name || 'SRIBEES Item',
      price: formattedProd.price || 500,
      originalPrice: formattedProd.originalPrice,
      rating: 4.9,
      reviewsCount: 42,
      inStock: true,
      category: formattedProd.category || 'Fresh Essentials',
      brand: formattedProd.brand || 'SRIBEES Select',
      image: formattedProd.image || '',
      unit: formattedProd.unit || 'unit',
      cashback_percentage: formattedProd.cashback_percentage,
      description: 'Recommended by SRIBEES AI Assistant',
    });

    setAddedItems((prev) => ({ ...prev, [prodId]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [prodId]: false }));
    }, 2000);
  };

  const handleConfirmAction = async (token?: string) => {
    if (!token) return;
    try {
      await confirmActionMutation.mutateAsync(token);
      setConfirmedTokens((prev) => ({ ...prev, [token]: true }));
    } catch (err: any) {
      alert(err.message || 'Failed to confirm action.');
    }
  };

  const handleResetChat = async () => {
    setMessages(INITIAL_MESSAGES);
    try {
      await clearHistoryMutation.mutateAsync();
    } catch (_) {}
  };

  return (
    <>
      {/* ----------------- FLOATING BUTTON AT BOTTOM RIGHT ----------------- */}
      <div
        data-ai-chat-ignore="true"
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 transition-all duration-300 ${
          isModalOrPopupOpen
            ? 'opacity-0 pointer-events-none scale-75 translate-y-4 invisible'
            : 'opacity-100 pointer-events-auto scale-100 translate-y-0 visible'
        }`}
        aria-hidden={isModalOrPopupOpen}
        suppressHydrationWarning
      >
        <button
          onClick={toggleAiChat}
          disabled={isModalOrPopupOpen}
          tabIndex={isModalOrPopupOpen ? -1 : 0}
          aria-label="Open SRIBEES AI Assistant"
          className="group relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl shadow-pink-600/30"
        >
          {/* Outer Pulsing Aura Glow */}
          <span className="absolute inset-0 rounded-full bg-pink-500/30 animate-ping opacity-75 pointer-events-none" />

          {/* Main Hot Pink Circular Container with White Ring */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-[#D81B60] via-[#E91E63] to-[#EC4899] p-[3px] shadow-lg flex items-center justify-center">
            {/* White Inner Circle Ring */}
            <div className="w-full h-full rounded-full border-2 border-white/95 flex items-center justify-center bg-gradient-to-tr from-[#D81B60] to-[#E91E63] transition-transform duration-300 group-hover:rotate-12">
              <Sparkles className="w-6 h-6 text-white drop-shadow-md" />
            </div>
          </div>

          {/* Tooltip Badge on Hover when closed */}
          {!isAiChatOpen && !isModalOrPopupOpen && (
            <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none flex items-center gap-1.5 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI Assistant ✨
            </span>
          )}
        </button>
      </div>

      {/* ----------------- CHAT WINDOW / MODAL AT BOTTOM RIGHT ----------------- */}
      {isAiChatOpen && !isModalOrPopupOpen && (
        <div
          data-ai-chat-ignore="true"
          className="fixed bottom-24 right-6 z-50 w-[90vw] sm:w-[420px] h-[580px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#D81B60] via-[#E91E63] to-[#C2185B] p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#D81B60]" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                  SRIBEES AI Assistant
                  <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full font-medium text-pink-100">
                    v2.5 API
                  </span>
                </h3>
                <p className="text-[11px] text-pink-100/90 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online & Connected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset Chat History"
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsAiChatOpen(false)}
                title="Close AI Chat"
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#D81B60] to-[#E91E63] flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[82%] space-y-2`}>
                  {/* Image Attachment Preview in Bubble */}
                  {msg.imagePreview && (
                    <div className="mb-1 rounded-xl overflow-hidden border border-pink-200 max-w-[200px]">
                      <img
                        src={msg.imagePreview}
                        alt="User uploaded attachment"
                        className="w-full h-auto object-cover max-h-40"
                      />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#D81B60] text-white rounded-tr-none font-medium'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1.5 text-right ${
                        msg.sender === 'user' ? 'text-pink-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Proposed Actions Cards */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {msg.actions.map((act, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-r from-pink-50 to-rose-50 p-3 rounded-xl border border-pink-200 shadow-xs space-y-2"
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-[#D81B60] shrink-0 mt-0.5" />
                            <div>
                              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                {act.action_type || 'Proposed Action'}
                              </h5>
                              <p className="text-xs text-slate-600 leading-snug">{act.description}</p>
                            </div>
                          </div>

                          {act.token && (
                            <button
                              onClick={() => handleConfirmAction(act.token)}
                              disabled={confirmedTokens[act.token] || confirmActionMutation.isPending}
                              className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                                confirmedTokens[act.token]
                                  ? 'bg-emerald-600 text-white cursor-default'
                                  : 'bg-[#D81B60] hover:bg-pink-700 text-white'
                              }`}
                            >
                              {confirmedTokens[act.token] ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Action Confirmed
                                </>
                              ) : confirmActionMutation.isPending ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
                                </>
                              ) : (
                                <>Confirm Action</>
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Products Cards if present */}
                  {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {msg.suggestedProducts.map((p) => {
                        const pId = p.id || p.product_id || `prod-${Math.random()}`;
                        return (
                          <div
                            key={pId}
                            className="bg-white p-2.5 rounded-xl border border-rose-100 shadow-sm flex items-center gap-3 hover:border-pink-300 transition-colors"
                          >
                            {p.image && (
                              <img
                                src={p.image}
                                alt={p.title || p.name || 'Product'}
                                className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-slate-800 truncate">
                                {p.title || p.name}
                              </h4>
                              <p className="text-xs font-bold text-[#D81B60]">
                                Rs. {(p.price ?? 0).toLocaleString()}
                                {p.unit && (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    /{p.unit}
                                  </span>
                                )}
                              </p>
                            </div>
                            <button
                              onClick={() => handleAddToCart(p)}
                              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                addedItems[pId]
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-rose-50 text-[#D81B60] hover:bg-[#D81B60] hover:text-white'
                              }`}
                            >
                              {addedItems[pId] ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Added
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3.5 h-3.5" /> Add
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick Replies Chips */}
                  {msg.quickReplies && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(reply)}
                          className="text-[11px] bg-white hover:bg-pink-50 text-[#D81B60] border border-pink-200 hover:border-pink-400 px-3 py-1.5 rounded-full shadow-2xs font-medium transition-all transform active:scale-95 text-left"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-500 pl-2">
                <div className="w-6 h-6 rounded-full bg-[#D81B60] flex items-center justify-center text-white shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-2xs">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  {currentStage && (
                    <span className="text-[11px] text-pink-600 font-medium italic">
                      {currentStage}
                    </span>
                  )}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Selected Image Thumbnail Preview above input */}
          {selectedImage && (
            <div className="px-3 pt-2 bg-white border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-pink-50 p-1.5 rounded-xl border border-pink-200">
                <img
                  src={selectedImage.preview}
                  alt="Attachment preview"
                  className="w-10 h-10 object-cover rounded-lg"
                />
                <div className="text-[11px]">
                  <p className="font-semibold text-slate-700 truncate max-w-[180px]">
                    {selectedImage.file.name}
                  </p>
                  <p className="text-slate-400 text-[9px]">
                    {(selectedImage.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeSelectedImage}
                className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            {/* Hidden File Input for Image Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach an image (JPEG, PNG, WebP)"
              className="p-2 text-slate-400 hover:text-[#D81B60] hover:bg-pink-50 rounded-full transition-colors shrink-0"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask SRIBEES AI anything..."
              className="flex-1 text-xs bg-slate-100 text-slate-800 placeholder-slate-400 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-500/40 border border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedImage) || isTyping}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-[#D81B60] to-[#E91E63] hover:opacity-90 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
