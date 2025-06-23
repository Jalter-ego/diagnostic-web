import { useEffect, useState } from "react";
import { IconLogo } from "@/assets/icons";
import { ToggleThemeButton } from "../ToggleThemeButton";
import SyncUserWithBackend from "@/hooks/SyncUserWithBackend";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/clerk-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export default function Navbar() {
    const [show, setShow] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setShow(false); // Scroll hacia abajo
            } else {
                setShow(true); // Scroll hacia arriba
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <nav
            className={`fixed w-full top-0 z-50 bg-background shadow-sm transition-transform duration-300 ${
                show ? "translate-y-0" : "-translate-y-full"
            }`}
        >
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo + título */}
                <div className="flex items-center space-x-2">
                    <IconLogo />
                    <span className="text-xl font-semibold text-foreground">
                        Diagnostic Assistant
                    </span>
                </div>

                {/* Navegación */}
                <div className="hidden md:flex space-x-6">
                     <Link to="/cancer-de-piel" className="text-foreground hover:text-primary font-medium transition-colors">
                    Cáncer de Piel
                </Link>
                <Link to="/dermatologia-general" className="text-foreground hover:text-primary font-medium transition-colors">
                    Dermatología General
                </Link>
                     <a href="#servicios" className="text-foreground hover:text-primary font-medium transition-colors">Servicios</a>
                    <a href="#sobre" className="text-foreground hover:text-primary font-medium transition-colors">Sobre Nosotros</a>
                    <a href="#contacto" className="text-foreground hover:text-primary font-medium transition-colors">Contacto</a>
                </div>

                {/* Botones de sesión y tema */}
                <section className="flex items-center gap-4">
                    <ToggleThemeButton />
                    <SignedOut>
                        <Button>
                            <SignInButton forceRedirectUrl={'/dashboard/organizations'} mode="redirect" />
                        </Button>
                    </SignedOut>
                    <SignedIn>
                        <UserButton
                            appearance={{
                                elements: {
                                    userButtonAvatarBox: "w-14 h-14",
                                },
                            }}
                        />
                        <SyncUserWithBackend />
                    </SignedIn>
                </section>
            </div>
        </nav>
    );
}
