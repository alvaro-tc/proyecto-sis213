import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import TrustBar from "../components/landing/TrustBar";
import BentoMenu from "../components/landing/BentoMenu";
import Contact from "../components/landing/Contact";
import Footer from "../components/landing/Footer";

const Landing = () => {
  const navigate = useNavigate();
  const { isAuth } = useSelector((s) => s.user);

  useEffect(() => {
    document.title = "Cafeteria 5 · Café de especialidad";
  }, []);

  const goToApp = () => navigate(isAuth ? "/home" : "/auth");

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased">
      <Navbar onCta={goToApp} />
      <main>
        <Hero onCta={goToApp} />
        <TrustBar />
        <BentoMenu />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
