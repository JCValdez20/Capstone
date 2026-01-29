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
import { useState } from "react";

const carouselImages = [carousel1, carousel2, carousel3, carousel4];

const Carousel = () => {
  const plugin = Autoplay({ delay: 5000, stopOnInteraction: false });
  const [api, setApi] = useState(null);

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-4 text-gray-900 tracking-tight">
            Our Work
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto font-light">
            See the quality and precision we bring to every vehicle
          </p>
        </div>
        <div className="flex items-center justify-center">
          <CarouselPrimitive
            plugins={[plugin]}
            className="w-full max-w-6xl"
            opts={{
              align: "center",
              loop: true,
            }}
            setApi={setApi}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {carouselImages.map((image, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 basis-[85%] md:basis-[60%] lg:basis-[50%]"
                >
                  <div
                    className="p-2 transition-all duration-500 cursor-pointer"
                    onClick={() => {
                      if (api) {
                        const currentIndex = api.selectedScrollSnap();
                        if (index < currentIndex) {
                          api.scrollPrev();
                        } else if (index > currentIndex) {
                          api.scrollNext();
                        }
                      }
                    }}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl group bg-gray-800">
                      <img
                        src={image}
                        alt={`Professional detailing work ${index + 1}`}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-4 md:p-6 border border-white/10">
                          <h3 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                            Premium Detailing Service
                          </h3>
                          <p className="text-sm md:text-base text-gray-200 leading-relaxed font-light">
                            Experience our professional motorcycle care services
                            with attention to every detail
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden" />
            <CarouselNext className="hidden" />
          </CarouselPrimitive>
        </div>
      </div>
      <style jsx>{`
        .embla__slide {
          transition: transform 0.5s ease, opacity 0.5s ease;
        }
        .embla__slide:not(.is-snapped) {
          opacity: 0.5;
          transform: scale(0.88);
        }
        .embla__slide.is-snapped {
          opacity: 1;
          transform: scale(1);
          z-index: 10;
        }
      `}</style>
    </section>
  );
};

export default Carousel;
