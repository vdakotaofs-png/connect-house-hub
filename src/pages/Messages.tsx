import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface MessagesProps {
  user: any;
}

const Messages = ({ user }: MessagesProps) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchConversations();
  }, [user, navigate]);

  const fetchConversations = async () => {
    setLoading(true);
    
    // Get unique conversations
    const { data } = await supabase
      .from("messages")
      .select("*, sender:profiles!messages_sender_id_fkey(id, full_name), receiver:profiles!messages_receiver_id_fkey(id, full_name), listings(id, title)")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (data) {
      // Group by conversation
      const grouped = data.reduce((acc: any, msg: any) => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const key = `${otherUserId}-${msg.listing_id}`;
        
        if (!acc[key]) {
          acc[key] = {
            key,
            otherUser: msg.sender_id === user.id ? msg.receiver : msg.sender,
            listing: msg.listings,
            lastMessage: msg,
            unreadCount: 0,
          };
        }
        
        if (!msg.read && msg.receiver_id === user.id) {
          acc[key].unreadCount++;
        }
        
        return acc;
      }, {});

      setConversations(Object.values(grouped));
    }
    setLoading(false);
  };

  const fetchMessages = async (conversation: any) => {
    setSelectedConversation(conversation);
    
    const { data } = await supabase
      .from("messages")
      .select("*, sender:profiles!messages_sender_id_fkey(full_name)")
      .eq("listing_id", conversation.listing.id)
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${conversation.otherUser.id}),and(sender_id.eq.${conversation.otherUser.id},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
      
      // Mark as read
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("receiver_id", user.id)
        .eq("sender_id", conversation.otherUser.id)
        .eq("listing_id", conversation.listing.id);

      fetchConversations();
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: selectedConversation.otherUser.id,
      listing_id: selectedConversation.listing.id,
      content: newMessage,
    });

    if (!error) {
      setNewMessage("");
      fetchMessages(selectedConversation);
      fetchConversations();
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {loading ? (
                <p className="text-center p-4 text-muted-foreground">Loading...</p>
              ) : conversations.length > 0 ? (
                conversations.map((conv) => (
                  <button
                    key={conv.key}
                    onClick={() => fetchMessages(conv)}
                    className={`w-full p-4 text-left border-b hover:bg-accent transition-smooth ${
                      selectedConversation?.key === conv.key ? "bg-accent" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {conv.otherUser.full_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold truncate">
                            {conv.otherUser.full_name}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-primary text-white text-xs rounded-full px-2 py-1">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.listing.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center p-4 text-muted-foreground">
                  No messages yet
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            {selectedConversation ? (
              <div>
                <CardTitle>{selectedConversation.otherUser.full_name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.listing.title}
                </p>
              </div>
            ) : (
              <CardTitle>Select a conversation</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {selectedConversation ? (
              <div className="space-y-4">
                <ScrollArea className="h-[450px] pr-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender_id === user.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.sender_id === user.id
                              ? "bg-primary text-white"
                              : "bg-secondary"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender_id === user.id
                                ? "text-white/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {formatDistanceToNow(new Date(msg.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Textarea
                    rows={2}
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button variant="hero" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                Select a conversation to view messages
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
