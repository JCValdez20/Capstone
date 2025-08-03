const Services = () => {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold text-center mb-16 text-black">
          SERVICES OFFERED
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-xl hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <span className="bg-white rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </span>
              UV GRAPHENE CERAMIC COATING
            </h3>
            <p className="text-gray-100">
              Premium ceramic coating for ultimate protection and shine
            </p>
          </div>

          <div className="p-8 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-xl hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <span className="bg-white rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </span>
              POWDER COATING
            </h3>
            <p className="text-gray-100">
              Durable and attractive finish for your motorcycle parts
            </p>
          </div>

          <div className="p-8 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-xl hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <span className="bg-white rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              MOTO/OTO VIP
            </h3>
            <p className="text-gray-100">
              Premium detailing service for motorcycles and automobiles
            </p>
          </div>

          <div className="p-8 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-xl hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <span className="bg-white rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </span>
              FULL MOTO/OTO SPA
            </h3>
            <p className="text-gray-100">
              Complete cleaning and rejuvenation for your vehicle
            </p>
          </div>

          <div className="p-8 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-xl hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <span className="bg-white rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
              MODERNIZED INTERIOR DETAILING
            </h3>
            <p className="text-gray-100">
              Advanced interior cleaning and restoration services
            </p>
          </div>

          <div className="p-8 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-xl hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <span className="bg-white rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </span>
              MODERNIZED ENGINE DETAILING
            </h3>
            <p className="text-gray-100">
              Thorough cleaning and detailing of engine components
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
