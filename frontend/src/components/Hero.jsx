import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="py-33 bg-white">
      <div className="container mx-auto px-4 grid grid-cols-2 gap-8 items-center">
        <div className="flex justify-center">
          <img
            src="/src/assets/WashUpLogo.png"
            alt="Wash Up MotMot Logo"
            className="w-[500px]"
          />
        </div>
        <div className="space-y-8">
          <h1 className="text-5xl font-bold leading-tight text-black">
            Skip the Grime <br />
            Book a Premium Wash or Coating in Seconds with{" "}
            <span className="text-red-600 italic font-black">
              WashUp MotMot
            </span>
            !
          </h1>
          <div className="flex gap-4">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-6 rounded-lg font-bold shadow-lg transition-all duration-300 hover:scale-105"
            >
              Book Now!
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-black hover:bg-white hover:text-gray-900 text-lg px-8 py-6 rounded-lg font-bold shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => {
                document
                  .getElementById("services")
                  .scrollIntoView({ behavior: "smooth" });
              }}
            >
              View Services
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
