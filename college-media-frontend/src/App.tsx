import AppRoutes
from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

export default function App() {
  return <><AppRoutes /><Toaster position="top-right" toastOptions={{ duration: 3500, style: { borderRadius: "14px", background: "#172033", color: "#fff" } }} /></>;
}
