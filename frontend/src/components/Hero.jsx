import motor from "../assets/Motorcycle.jpg";
import logo from "../assets/WashUpLogo.png";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <Card className="border-none shadow-xl overflow-hidden relative">
          <div className="absolute inset-0">
            <img
              src={motor}
              alt="Background Motorcycle"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          </div>
          <div className="grid lg:grid-cols-2 gap-8 items-center p-8 relative z-10">
            <div className="flex justify-center lg:order-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-red-600/20 rounded-full blur-2xl" />
                <img
                  src={logo}
                  alt="Wash Up MotMot Logo"
                  className="w-[400px] relative transform hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <CardHeader className="space-y-6 lg:order-1">
              <CardTitle className="text-5xl font-bold leading-tight text-white">
                Skip the Grime{" "}
                <span className="block mt-2">
                  Book a Premium Wash or Coating in Seconds with{" "}
                  <span className="text-red-500 italic font-black animate-pulse">
                    WashUp MotMot
                  </span>
                  !
                </span>
              </CardTitle>
              <CardDescription className="text-lg text-gray-200">
                Experience premium car care services that bring out the true
                beauty of your vehicle.
              </CardDescription>
              <div className="flex gap-4 pt-4">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-500 text-white text-lg px-8 py-6 rounded-lg font-bold shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Book Now!
                  </Button>
                </Link>
                <ScrollLink
                  to="services"
                  smooth={true}
                  duration={500}
                  offset={-80}
                  className="inline-block"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/30 text-black hover:bg-white hover:text-gray-900 text-lg px-8 py-6 rounded-lg font-bold shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    View Services
                  </Button>
                </ScrollLink>
              </div>
            </CardHeader>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Hero;
