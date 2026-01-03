import Chat from "@/components/chat/Chat";
import NavigationBar from "@/components/test/NavigationBar";
import AuthGuard from "@/components/auth/AuthGuard";

export default function ChatPage() {
  return (
    <AuthGuard>
      <NavigationBar />
      <Chat />
    </AuthGuard>
  );
}
