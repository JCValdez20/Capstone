import Autoplay from "embla-carousel-autoplay";
import {
  Carousel as CarouselPrimitive,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import carousel1 from "../assets/Carousel1.jpg";
import carousel2 from "../assets/Carousel2.jpg";
import carousel3 from "../assets/Carousel3.jpg";
import carousel4 from "../assets/Carousel4.jpg";

const carouselImages = [carousel1, carousel2, carousel3, carousel4];

const Carousel = () => {
  const plugin = Autoplay({ delay: 4000 });

  return (
    <section className="pt-6 pb-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-black">
          Our Work
        </h2>
        <CarouselPrimitive
          plugins={[plugin]}
          className="w-full max-w-6xl mx-auto relative group"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent>
            {[1, 2, 3, 4].map((index) => (
              <CarouselItem key={index} className="relative">
                <div className="aspect-[16/9] relative overflow-hidden rounded-2xl shadow-2xl bg-black flex items-center justify-center">
                  <img
                    src={carouselImages[index - 1]}
                    alt={`Slide ${index}`}
                    className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">
                      Premium Detailing Service
                    </h3>
                    <p className="text-sm text-gray-200">
                      Experience our professional car care services
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 -left-12 bg-red-600 hover:bg-red-700 text-white border-none" />
          <CarouselNext className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 -right-12 bg-red-600 hover:bg-red-700 text-white border-none" />
        </CarouselPrimitive>
      </div>
    </section>
  );
};

export default Carousel;
