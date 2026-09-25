import Sidebar from '@/components/layout/Sidebar';
import TopHeader from '@/components/layout/TopHeader';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning is required on the html tag when using next-themes
    <html lang="en" suppressHydrationWarning>
      <body className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] dark:bg-[#0B0C0E] text-[#1F2933] dark:text-white transition-colors duration-200">
        
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          <Sidebar />
          
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <TopHeader />
            
            <main className="flex-1 overflow-y-auto p-8">
              {children}
            </main>
          </div>
        </ThemeProvider>
        
      </body>
    </html>
  );
}