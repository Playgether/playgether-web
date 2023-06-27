import '../app/globals.css'
import { useState } from "react";

export default function Profile(){
const Navbar = () => {
  const [isOpen, setOpen] = useState(false);
  const toggleMenu = () => setOpen(!isOpen);

  return (
      <header className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <a href="#">
                <span className="h-8 w-auto sm:h-10">LOGO</span>
              </a>
            </div>
            <div className="-mr-2 -my-2 md:hidden">
              <button
                onClick={toggleMenu}
                className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                Open
              </button>
            </div>
            <nav className="hidden md:flex space-x-10">
              <a href="#" className="text-base font-medium text-gray-500 hover:text-gray-900">
                About
              </a>
            </nav>
          </div>
        </div>
        {isOpen && (
          <div className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden">
            <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50">
              <div className="pt-5 pb-6 px-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="h-8 w-auto">LOGO</span>
                  </div>
                  <div className="-mr-2">
                    <button
                      onClick={toggleMenu}
                      className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    >
                      X
                    </button>
                  </div>
                </div>
                <div className="mt-6">
                  <nav className="grid gap-y-8">
                    <a href="#" className="p-3 flex items-center rounded-md hover:bg-gray-50">
                      About
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
  );
};
}
