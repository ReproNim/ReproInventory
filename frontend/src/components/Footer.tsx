import React from "react";
import { Heart, Github } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t bg-background py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>by the</span>
            <a 
              href="https://www.repronim.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground transition-colors"
            >
              ReproNim Community
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/ReproNim/ReproInventory" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <span>© 2025 ReproNim</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;