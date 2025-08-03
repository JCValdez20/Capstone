import { Button } from "./ui/button";
import { Clock, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>
        <div className="max-w-md mx-auto text-center">
          <p className="text-muted-foreground mb-6">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>

          <div className="space-y-6">
            {/* Location */}
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5" />
              <p className="font-medium">
                Mabayuan, Olongapo City, Zambales, Philippines
              </p>
            </div>

            {/* Business Hours */}
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5" />
              <p className="font-medium">Open Everyday: 9AM - 9PM</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <p className="font-medium">Email: washupmotmot@gmail.com</p>
              <p className="font-medium">Phone: 0915 512 3222</p>
            </div>

            <Button variant="outline" className="w-full mt-4">
              Send us a message
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
