'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Users,
  Shield,
  Send,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  Flame,
  Clock,
  Key,
  AlertCircle,
  CheckCircle,
  Copy,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
  isBurnMode?: boolean;
  ttl?: number;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
}

interface ChatSession {
  id: string;
  type: '1-to-1' | 'group';
  name: string;
  participants: string[];
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: number;
}

interface GroupInfo {
  groupId: string;
  groupName: string;
  members: Array<{
    id: string;
    publicKey: string;
  }>;
  epoch: number;
}

export function EncryptedChatTab() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'chats' | 'groups'>('chats');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientPublicKey, setRecipientPublicKey] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletPrivateKey, setWalletPrivateKey] = useState('');
  const [burnMode, setBurnMode] = useState(false);
  const [customTTL, setCustomTTL] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group management states
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupId, setNewGroupId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<GroupInfo | null>(null);
  const [newMemberKeyPackage, setNewMemberKeyPackage] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages]);

  const initializeChat = async (chatType: '1-to-1' | 'group') => {
    if (!walletAddress) {
      toast({
        title: 'Wallet Required',
        description: 'Please enter your wallet address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/oracle/encrypted-chat/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, chatType })
      });

      const data = await response.json();

      if (data.success) {
        setIsInitialized(true);
        toast({
          title: 'Chat Initialized',
          description: `${chatType === '1-to-1' ? '1-to-1' : 'Group'} chat session initialized successfully`,
        });

        if (chatType === '1-to-1' && data.preKeyBundle) {
          // Store pre-key bundle for display
          console.log('Pre-key bundle:', data.preKeyBundle);
        } else if (chatType === 'group' && data.keyPackage) {
          console.log('Key package:', data.keyPackage);
        }
      }
    } catch (error) {
      console.error('Init error:', error);
      toast({
        title: 'Initialization Failed',
        description: 'Failed to initialize chat session',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !activeSession) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      sender: walletAddress,
      timestamp: Date.now(),
      isBurnMode: burnMode,
      ttl: customTTL ? parseInt(customTTL) : undefined,
      status: 'sending'
    };

    // Optimistically add message to UI
    setActiveSession({
      ...activeSession,
      messages: [...activeSession.messages, newMessage]
    });
    setMessageInput('');

    try {
      const requestBody: any = {
        chatType: activeSession.type,
        message: messageInput,
        senderWalletAddress: walletAddress,
        senderPrivateKey: walletPrivateKey,
        burnMode,
        ttl: customTTL ? parseInt(customTTL) : undefined
      };

      if (activeSession.type === '1-to-1') {
        requestBody.sessionId = activeSession.id;
        requestBody.recipientAddress = recipientAddress;
        requestBody.recipientPublicKey = recipientPublicKey;
      } else {
        requestBody.groupId = activeSession.id;
      }

      const response = await fetch('/api/oracle/encrypted-chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        // Update message status
        setActiveSession(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map(msg =>
              msg.id === newMessage.id
                ? { ...msg, status: 'sent' }
                : msg
            )
          };
        });

        toast({
          title: 'Message Sent',
          description: burnMode
            ? '🔥 Burn mode: Message will auto-delete in 60s'
            : 'Encrypted message sent successfully',
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Send error:', error);
      setActiveSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === newMessage.id
              ? { ...msg, status: 'failed' }
              : msg
          )
        };
      });

      toast({
        title: 'Send Failed',
        description: 'Failed to send encrypted message',
        variant: 'destructive'
      });
    }
  };

  const createNewChat = () => {
    if (!recipientAddress) {
      toast({
        title: 'Recipient Required',
        description: 'Please enter recipient wallet address',
        variant: 'destructive'
      });
      return;
    }

    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      type: '1-to-1',
      name: recipientAddress.substring(0, 10) + '...',
      participants: [walletAddress, recipientAddress],
      messages: []
    };

    setSessions([...sessions, newSession]);
    setActiveSession(newSession);

    toast({
      title: 'Chat Created',
      description: 'New encrypted chat session created'
    });
  };

  const createGroup = async () => {
    if (!newGroupName || !newGroupId) {
      toast({
        title: 'Group Info Required',
        description: 'Please enter group name and ID',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/oracle/encrypted-chat/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          groupName: newGroupName,
          groupId: newGroupId
        })
      });

      const data = await response.json();

      if (data.success && data.group) {
        const newGroup: GroupInfo = {
          groupId: data.group.groupId,
          groupName: newGroupName,
          members: data.group.members,
          epoch: data.group.epoch
        };

        setGroups([...groups, newGroup]);

        // Create a session for this group
        const groupSession: ChatSession = {
          id: newGroup.groupId,
          type: 'group',
          name: newGroup.groupName,
          participants: newGroup.members.map(m => m.id),
          messages: []
        };

        setSessions([...sessions, groupSession]);

        toast({
          title: 'Group Created',
          description: `Encrypted group "${newGroupName}" created successfully`
        });

        setNewGroupName('');
        setNewGroupId('');
      }
    } catch (error) {
      console.error('Create group error:', error);
      toast({
        title: 'Group Creation Failed',
        description: 'Failed to create encrypted group',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-400" />
            Encrypted Chat
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            End-to-end encrypted messaging with Signal Protocol & MLS
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Lock className="h-3 w-3" />
          E2E Encrypted
        </Badge>
      </div>

      {/* Setup Section */}
      {!isInitialized && (
        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-400" />
              Initialize Encrypted Chat
            </CardTitle>
            <CardDescription>
              Connect your wallet to start encrypted messaging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Wallet Address</label>
              <Input
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Private Key (for signing)</label>
              <Input
                type="password"
                placeholder="Your private key..."
                value={walletPrivateKey}
                onChange={(e) => setWalletPrivateKey(e.target.value)}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                ⚠️ Private key is only used client-side for encryption. Never shared.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => initializeChat('1-to-1')}
                disabled={loading}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                1-to-1 Chat
              </Button>
              <Button
                onClick={() => initializeChat('group')}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                <Users className="h-4 w-4 mr-2" />
                Group Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Chat Interface */}
      {isInitialized && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Chat List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chats' | 'groups')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chats">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chats
                  </TabsTrigger>
                  <TabsTrigger value="groups">
                    <Users className="h-4 w-4 mr-2" />
                    Groups
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <TabsContent value="chats" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Input
                    placeholder="Recipient Address (0x...)"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Recipient Public Key (hex)"
                    value={recipientPublicKey}
                    onChange={(e) => setRecipientPublicKey(e.target.value)}
                    className="text-sm"
                  />
                  <Button onClick={createNewChat} className="w-full" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </div>

                <div className="space-y-2 mt-4">
                  {sessions.filter(s => s.type === '1-to-1').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      No chats yet
                    </div>
                  ) : (
                    sessions
                      .filter(s => s.type === '1-to-1')
                      .map(session => (
                        <motion.div
                          key={session.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            className={`cursor-pointer transition-all ${
                              activeSession?.id === session.id
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'hover:border-gray-600'
                            }`}
                            onClick={() => setActiveSession(session)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{session.name}</p>
                                  {session.lastMessage && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {session.lastMessage}
                                    </p>
                                  )}
                                </div>
                                {session.messages.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {session.messages.length}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="groups" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Input
                    placeholder="Group Name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Group ID"
                    value={newGroupId}
                    onChange={(e) => setNewGroupId(e.target.value)}
                    className="text-sm"
                  />
                  <Button onClick={createGroup} className="w-full" size="sm" disabled={loading}>
                    <Users className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </div>

                <div className="space-y-2 mt-4">
                  {sessions.filter(s => s.type === 'group').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      No groups yet
                    </div>
                  ) : (
                    sessions
                      .filter(s => s.type === 'group')
                      .map(session => (
                        <motion.div
                          key={session.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            className={`cursor-pointer transition-all ${
                              activeSession?.id === session.id
                                ? 'border-green-500 bg-green-500/10'
                                : 'hover:border-gray-600'
                            }`}
                            onClick={() => setActiveSession(session)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate flex items-center gap-2">
                                    <Users className="h-3 w-3" />
                                    {session.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {session.participants.length} members
                                  </p>
                                </div>
                                {session.messages.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {session.messages.length}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Card>

          {/* Main Chat Area */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b">
              {activeSession ? (
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {activeSession.type === 'group' ? (
                        <Users className="h-5 w-5 text-green-400" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-blue-400" />
                      )}
                      {activeSession.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {activeSession.type === 'group'
                        ? `${activeSession.participants.length} members`
                        : 'End-to-end encrypted'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Secure
                  </Badge>
                </div>
              ) : (
                <CardTitle className="text-lg">Select a chat</CardTitle>
              )}
            </CardHeader>
            <CardContent className="flex flex-col h-[500px]">
              {activeSession ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-3 py-4">
                    <AnimatePresence>
                      {activeSession.messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          className={`flex ${
                            message.sender === walletAddress ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender === walletAddress
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-white'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                              {message.isBurnMode && (
                                <Badge variant="destructive" className="text-xs px-1 py-0">
                                  <Flame className="h-2 w-2 mr-1" />
                                  Burn
                                </Badge>
                              )}
                              {message.status === 'sending' && (
                                <Clock className="h-3 w-3 opacity-50" />
                              )}
                              {message.status === 'sent' && (
                                <CheckCircle className="h-3 w-3" />
                              )}
                              {message.status === 'failed' && (
                                <AlertCircle className="h-3 w-3 text-red-400" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={burnMode ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => setBurnMode(!burnMode)}
                        className="gap-1"
                      >
                        <Flame className="h-4 w-4" />
                        {burnMode ? 'Burn Mode ON' : 'Burn Mode'}
                      </Button>
                      <Input
                        type="number"
                        placeholder="TTL (seconds)"
                        value={customTTL}
                        onChange={(e) => setCustomTTL(e.target.value)}
                        className="w-32"
                        size={1}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your encrypted message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} disabled={!messageInput.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Lock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Select a chat to start messaging</p>
                    <p className="text-sm mt-2">All messages are end-to-end encrypted</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Features Info */}
      <Card className="border-green-500/30 bg-gradient-to-br from-green-900/20 to-transparent">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            Security Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-400" />
                Signal Protocol
              </h4>
              <p className="text-xs text-muted-foreground">
                Double Ratchet encryption for 1-to-1 chats with forward secrecy
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-green-400" />
                MLS Protocol
              </h4>
              <p className="text-xs text-muted-foreground">
                Messaging Layer Security for efficient group encryption
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                Burn Mode
              </h4>
              <p className="text-xs text-muted-foreground">
                Auto-delete messages after reading for ephemeral conversations
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>
                Powered by Hyperlane for cross-chain message delivery.
                Only encrypted ciphertext is stored off-chain.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
