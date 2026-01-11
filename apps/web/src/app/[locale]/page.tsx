import { ChatInterface } from "@/components/chat-interface";
import { LandingPage } from "@/components/landing-page";
import { Header } from "@/components/header";
import { auth } from "@/auth";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params; // Consume promise for Next.js 15+
  const session = await auth();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground selection:bg-primary/20">
      {/* Header (Fixed Height) */}
      <Header />

      {/* Main Content (Fills remaining space) */}
      <main className="flex-1 w-full relative">
        {session ? (
          <div className="h-full w-full p-4 md:p-6 overflow-hidden">
            <ChatInterface />
          </div>
        ) : (
          <LandingPage />
        )}
      </main>
    </div>
  );
}