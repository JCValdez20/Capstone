const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              BookUp MotMot
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Premium motorcycle detailing and care services in Olongapo City.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Contact</h3>
            <p className="text-gray-600 text-sm mb-1">
              📧 washupmotmot@gmail.com
            </p>
            <p className="text-gray-600 text-sm mb-1">📞 0915 512 3222</p>
            <p className="text-gray-600 text-sm">📍 Mabayuan, Olongapo City</p>
          </div>
          <div className="text-center md:text-right">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Hours</h3>
            <p className="text-gray-600 text-sm mb-1">Open Daily</p>
            <p className="text-gray-900 text-sm font-semibold">
              9:00 AM - 9:00 PM
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-6">
          <p className="text-center text-gray-500 text-sm">
            &copy; 2025 BookUp MotMot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
