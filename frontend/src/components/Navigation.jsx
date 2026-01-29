import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "./ui/navigation-menu";
import logo from "../assets/bookup logo.png";

const Navigation = () => {
  return (
    <nav className="bg-white py-6 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-8 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={logo}
            alt="BookUp MotMot"
            className="h-28 w-auto transition-transform hover:scale-105 duration-300"
          />
        </div>
        <NavigationMenu>
          <NavigationMenuList className="flex items-center space-x-2">
            <NavigationMenuItem>
              <ScrollLink
                to="services"
                smooth={true}
                duration={500}
                offset={-80}
                className="text-gray-700 hover:text-red-600 transition-all text-base cursor-pointer font-semibold px-4 py-2 rounded-lg hover:bg-red-50 relative group"
              >
                Services
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
              </ScrollLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <ScrollLink
                to="contact"
                smooth={true}
                duration={500}
                offset={-80}
                className="text-gray-700 hover:text-red-600 transition-all text-base cursor-pointer font-semibold px-4 py-2 rounded-lg hover:bg-red-50 relative group"
              >
                Contact
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
              </ScrollLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-red-600 font-semibold transition-all text-base px-5 py-2.5 hover:bg-red-50 rounded-lg"
                >
                  Sign In
                </Button>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/register">
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all text-base px-6 py-2.5 font-semibold shadow-lg hover:shadow-xl rounded-lg transform hover:-translate-y-0.5 duration-300"
                >
                  Sign Up
                </Button>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
};

export default Navigation;
