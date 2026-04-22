import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Shorts from "./pages/Shorts.tsx";
import Profile from "./pages/Profile.tsx";
import UserProfile from "./pages/UserProfile.tsx";
import Alerts from "./pages/Alerts.tsx";
import Create from "./pages/Create.tsx";
import Menu from "./pages/Menu.tsx";
import Chats from "./pages/Chats.tsx";
import ChatThread from "./pages/ChatThread.tsx";
import SellerDashboard from "./pages/SellerDashboard.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/u/:handle" element={<UserProfile />} />
          <Route path="/account" element={<Profile />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/chats/:handle" element={<ChatThread />} />
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/p/:id" element={<ProductDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/create" element={<Create />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
