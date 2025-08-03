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
        <div className="text-4xl font-bold text-red-600">BookUp MotMot</div>
        <NavigationMenu>
          <NavigationMenuList className="flex items-center space-x-8">
            <NavigationMenuItem>
              <ScrollLink
                to="services"
                smooth={true}
                duration={500}
                offset={-80} // adjust for navbar height if needed
                className="text-black font-medium hover:text-red-600 transition-colors text-1xl cursor-pointer"
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
                className="text-black font-medium hover:text-red-600 transition-colors text-1xl cursor-pointer"
              >
                Contact
              </ScrollLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="text-black font-medium hover:text-red-600 transition-colors text-1xl"
                >
                  Login
                </Button>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/register">
                <Button
                  variant="ghost"
                  className="text-black font-medium hover:text-red-600 transition-colors text-1xl"
                >
                  Register
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
