import { Button } from "./ui/button";
import { Clock, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Get in Touch
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We're here to answer your questions and schedule your next service
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-red-200 transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <span className="p-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-6 w-6 text-white" />
                </span>
                <h3 className="font-bold text-xl mb-3 text-gray-900">
                  Visit Us
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Mabayuan, Olongapo City,
                  <br />
                  Zambales, Philippines
                </p>
              </div>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-red-200 transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <span className="p-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 text-white" />
                </span>
                <h3 className="font-bold text-xl mb-3 text-gray-900">
                  Business Hours
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Open Daily
                  <br />
                  <span className="font-semibold text-gray-800">
                    9:00 AM - 9:00 PM
                  </span>
                </p>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-red-600 to-red-700 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 md:col-span-2 lg:col-span-1 transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="font-bold text-xl mb-4 text-white">
                  Contact Info
                </h3>
                <div className="space-y-3 text-white/95">
                  <p className="flex items-center justify-center gap-2">
                    <span className="font-medium">📧</span>
                    <span className="text-sm">washupmotmot@gmail.com</span>
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="font-medium">📞</span>
                    <span className="text-sm font-semibold">0915 512 3222</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
