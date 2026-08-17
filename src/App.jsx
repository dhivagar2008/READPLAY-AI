import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "./components/Navbar.jsx";
import { Footer } from "./components/Footer.jsx";
import { ScrollToTop } from "./components/ScrollToTop.jsx";
import { Home } from "./pages/Home.jsx";
import { Lessons } from "./pages/Lessons.jsx";
import { Lesson } from "./pages/Lesson.jsx";
import { Games } from "./pages/Games.jsx";
import { Create } from "./pages/Create.jsx";
import { Progress } from "./pages/Progress.jsx";
import { Login } from "./pages/Login.jsx";
import { Tutor } from "./pages/Tutor.jsx";
import { Insights } from "./pages/Insights.jsx";
import { RequireParent } from "./components/RequireParent.jsx";
import { PageStub } from "./pages/PageStub.jsx";

function RoutedApp() {
  const location = useLocation();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/lessons/:slug" element={<Lesson />} />
          <Route path="/games" element={<Games />} />
          <Route path="/create" element={<Create />} />
          <Route path="/tutor" element={<Tutor />} />
          <Route path="/progress" element={<Progress />} />
          <Route
            path="/insights"
            element={
              <RequireParent>
                <Insights />
              </RequireParent>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="*"
            element={<PageStub title="Hmm, this page took a wrong turn" />}
          />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RoutedApp />
    </BrowserRouter>
  );
}

export default App;
