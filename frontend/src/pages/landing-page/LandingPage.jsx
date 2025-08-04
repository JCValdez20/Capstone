import Hero from "../../components/Hero";
import Navigation from "../../components/Navigation";
import Services from "../../components/Services";
import Contact from "../../components/Contact";
import Footer from "../../components/Footer";
import Carousel from "../../components/Carousel";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Services />
      <Carousel />
      <Contact />
      <Footer />
    </div>
  );
};

export default LandingPage;
