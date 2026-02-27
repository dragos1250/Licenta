import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950/70 py-4 text-center text-sm text-slate-400">
        © 2026 ConfigEXP - Sistem configurare PC
      </footer>
    </div>
  );
}

export default App;