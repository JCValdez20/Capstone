import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "./ui/navigation-menu";

const Navigation = () => {
  return (
    <nav className="bg-white py-12">
      <div className="container mx-auto px-15 flex items-center justify-between">
        <div className="text-3xl italic font-black text-red-600">
          BookUp MotMot
        </div>
        <NavigationMenu>
          <NavigationMenuList className="flex items-center space-x-8">
            <NavigationMenuItem>
              <ScrollLink
                to="services"
                smooth={true}
                duration={500}
                offset={-80}
                className="text-gray-600 hover:text-red-600 transition-all text-1xl cursor-pointer font-medium relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-red-600 after:left-0 after:bottom-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
              >
                Services
              </ScrollLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <ScrollLink
                to="contact"
                smooth={true}
                duration={500}
                offset={-80}
                className="text-gray-600 hover:text-red-600 transition-all text-1xl cursor-pointer font-medium relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-red-600 after:left-0 after:bottom-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
              >
                Contact
              </ScrollLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="text-black font-medium transition-all text-lg px-6 py-7 relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-red-600 after:left-0 after:bottom-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
                >
                  Sign In
                </Button>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/register">
                <Button
                  variant="default"
                  className="bg-red-600 text-white hover:bg-red-700 transition-all text-lg px-6 py-7 font-semibold shadow-md hover:shadow-lg"
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
