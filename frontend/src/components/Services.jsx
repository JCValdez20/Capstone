import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";

const Services = () => {
  return (
    <section
      id="services"
      className="py-20 bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Our Services</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-red-500 bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="p-3 rounded-full bg-red-900/50 group-hover:bg-red-800 transition-colors duration-300">
                  <svg
                    className="h-6 w-6 text-red-400"
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
                <CardTitle className="text-xl font-semibold text-white">
                  UV Graphene Ceramic Coating
                </CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Premium ceramic coating that provides ultimate protection and a
                stunning glossy finish for your vehicle. Advanced UV-resistant
                formula.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-red-500 bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="p-3 rounded-full bg-red-900/50 group-hover:bg-red-800 transition-colors duration-300">
                  <svg
                    className="h-6 w-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </span>
                <CardTitle className="text-xl font-semibold text-white">
                  Powder Coating
                </CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Professional powder coating service for motorcycle parts and
                accessories. Durable, attractive finish that lasts.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-red-500 bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="p-3 rounded-full bg-red-900/50 group-hover:bg-red-800 transition-colors duration-300">
                  <svg
                    className="h-6 w-6 text-red-400"
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
                <CardTitle className="text-xl font-semibold text-white">
                  Moto/Oto VIP
                </CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Premium detailing service for both motorcycles and automobiles.
                VIP treatment for your prized vehicle.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-red-500 bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="p-3 rounded-full bg-red-900/50 group-hover:bg-red-800 transition-colors duration-300">
                  <svg
                    className="h-6 w-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </span>
                <CardTitle className="text-xl font-semibold text-white">
                  Full Moto/Oto SPA
                </CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Complete rejuvenation package for your vehicle. Comprehensive
                cleaning and detailing for that showroom shine.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-red-500 bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="p-3 rounded-full bg-red-900/50 group-hover:bg-red-800 transition-colors duration-300">
                  <svg
                    className="h-6 w-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
                <CardTitle className="text-xl font-semibold text-white">
                  Interior Detailing
                </CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Advanced interior cleaning techniques. Restore and protect your
                vehicle's cabin to pristine condition.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-red-500 bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="p-3 rounded-full bg-red-900/50 group-hover:bg-red-800 transition-colors duration-300">
                  <svg
                    className="h-6 w-6 text-red-400"
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
                <CardTitle className="text-xl font-semibold text-white">
                  Engine Detailing
                </CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Professional engine bay cleaning and detailing. Make your engine
                look as good as it performs.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Services;
