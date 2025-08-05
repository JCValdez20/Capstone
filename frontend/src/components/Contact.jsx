import { Button } from "./ui/button";
import { Clock, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-black">
          Get in Touch
        </h2>

        <div className="max-w-2xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-white p-6 rounded-lg border border-gray-100 hover:border-red-100 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <span className="p-2 rounded-full bg-red-50">
                  <MapPin className="h-5 w-5 text-red-600" />
                </span>
                <h3 className="font-semibold text-lg">Visit Us</h3>
              </div>
              <p className="text-gray-600">
                Mabayuan, Olongapo City,
                <br />
                Zambales, Philippines
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-100 hover:border-red-100 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <span className="p-2 rounded-full bg-red-50">
                  <Clock className="h-5 w-5 text-red-600" />
                </span>
                <h3 className="font-semibold text-lg">Business Hours</h3>
              </div>
              <p className="text-gray-600">
                Open Daily
                <br />
                9:00 AM - 9:00 PM
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-100 hover:border-red-100 transition-all duration-300 md:col-span-2">
              <div className="flex flex-col space-y-2">
                <p className="text-gray-600">
                  <span className="font-semibold">Email:</span>{" "}
                  washupmotmot@gmail.com
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Phone:</span> 0915 512 3222
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
