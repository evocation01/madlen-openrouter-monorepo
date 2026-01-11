import { ChatInterface } from "@/components/chat-interface";
import { auth } from "@/auth";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params; // Consume promise
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Madlen OpenRouter</h1>
          <div>
            {session?.user ? (
              <span>Welcome, {session.user.name || session.user.email}</span>
            ) : (
              <span>Not logged in</span>
            )}
          </div>
        </div>
        
        <ChatInterface />
      </div>
    </main>
  );
}
