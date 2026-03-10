import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import DataSantri from "./pages/DataSantri";
import DataUstadz from "./pages/DataUstadz";
import InputSetoran from "./pages/InputSetoran";
import Laporan from "./pages/Laporan";
import Pengaturan from "./pages/Pengaturan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/santri" element={<DataSantri />} />
              <Route path="/ustadz" element={<DataUstadz />} />
              <Route path="/setoran" element={<InputSetoran />} />
              <Route path="/laporan" element={<Laporan />} />
              <Route path="/pengaturan" element={<Pengaturan />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
