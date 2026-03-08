import { Link, useLocation } from 'react-router-dom';
import { BookOpen, LayoutDashboard, FolderOpen, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import { APP_NAME } from '@/utils/constants';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/projects', label: 'Projects', icon: FolderOpen, exact: false },
];

/**
 * Application header with navigation, dark mode toggle, and mobile menu
 */
export function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const isActive = (to: string, exact: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold text-lg text-foreground">{APP_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.to, link.exact)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: theme toggle + mobile menu */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <button
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <nav className="md:hidden pb-3 border-t border-border mt-1">
            <div className="flex flex-col gap-1 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(link.to, link.exact)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
