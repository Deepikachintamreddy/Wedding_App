import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useWeddingStore } from '@/lib/store';
import { usePathname } from 'expo-router';
import { getAiResponse } from '@/lib/aiService';
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const CHIPS = [
  { label: '💰 Budget Split', text: 'How should I split my wedding budget?' },
  { label: '✍️ Write Vows', text: 'Write a romantic wedding vow draft.' },
  { label: '⏱️ Day-Of Timeline', text: 'What does a typical day-of timeline look like?' },
  { label: '🏛️ Malibu Venues', text: 'What should I ask when booking a venue?' },
];

export default function ChatScreen() {
  const pathname = usePathname();
  const isFocused = pathname.includes('/chat');
  const params = useLocalSearchParams<{ defaultChatId?: string }>();
  const store = useWeddingStore();
  const { user, deductAiCredit, addTask, directMessages, sendDirectMessage, vendors } = store;



  const [activeTab, setActiveTab] = useState<'ai' | 'direct'>('ai');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // AI Chat State
  const [aiMessages, setAiMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### 🧭 Welcome to the VND Wedding Concierge!\nI am your personal AI assistant coordinated by **OVAimagination Events**.\nAsk me questions about budget strategy, vows, music, or timeline outlines!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [aiInputText, setAiInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const aiFlatListRef = useRef<FlatList<Message>>(null);

  // Direct Chat State
  const [directInputText, setDirectInputText] = useState('');
  const directFlatListRef = useRef<FlatList>(null);

  const creditsCount = user?.aiCredits ?? 15;

  // Dynamically resolve Vendor ID if logged in as vendor
  const currentVendorObj = vendors.find(v => v.name.toLowerCase() === user?.name?.toLowerCase());
  const currentVendorId = currentVendorObj?.id || 'v1'; // fallback to v1 (Olivia Vance)

  // Determine conversation partners
  const getChatPartnerName = (chatId: string) => {
    if (user?.role === 'couple') {
      const vendorId = chatId.split('_')[1];
      const vendor = vendors.find(v => v.id === vendorId);
      return vendor ? vendor.name : 'Wedding Vendor';
    } else {
      return 'Sarah & David';
    }
  };

  const getChatPartnerCategory = (chatId: string) => {
    if (user?.role === 'couple') {
      const vendorId = chatId.split('_')[1];
      const vendor = vendors.find(v => v.id === vendorId);
      return vendor ? vendor.category : 'Vendor';
    } else {
      return 'Couple';
    }
  };

  // On mount or param change, automatically navigate to default chat thread
  useEffect(() => {
    if (params.defaultChatId) {
      setActiveTab('direct');
      setSelectedChatId(params.defaultChatId);
    }
  }, [params.defaultChatId]);

  // AI Send Message
  const handleSendAiMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setAiInputText('');
    setIsAiTyping(true);

    const response = await getAiResponse(text, creditsCount);
    setIsAiTyping(false);

    const aiMsg: Message = {
      id: `msg_${Date.now() + 1}`,
      sender: 'ai',
      text: response.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAiMessages((prev) => [...prev, aiMsg]);

    if (response.creditsUsed && user && user.role !== 'admin' && !user.eventPassActive) {
      await deductAiCredit();
    }
  };

  // Direct Messaging Send
  const handleSendDirectMessage = async () => {
    if (!directInputText.trim() || !selectedChatId || !user) return;

    const senderId = user.role === 'couple' ? 'couple' : currentVendorId;
    const senderName = user.role === 'couple' ? 'Sarah & David' : user.name;

    await sendDirectMessage(selectedChatId, senderId, senderName, directInputText);
    setDirectInputText('');
  };

  const handleSaveToChecklist = (text: string) => {
    addTask({
      title: 'Review AI coordination guidelines',
      category: 'Planner',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: text.substring(0, 300),
      period: 'Upcoming',
      assignedTo: 'Both',
    });
    Alert.alert('Saved', 'Guidelines successfully saved to your Checklist!');
  };

  // Filter messages for active chat
  const activeChatMessages = directMessages.filter(m => m.chatId === selectedChatId);

  // Group direct messages by chatId to display active thread previews
  const getConversationsList = () => {
    if (user?.role === 'couple') {
      // Return booked vendors
      const bookedVendors = vendors.filter(v => v.status === 'Booked');
      return bookedVendors.map(vendor => {
        const chatId = `couple_${vendor.id}`;
        const threadMsgs = directMessages.filter(m => m.chatId === chatId);
        const lastMsg = threadMsgs[threadMsgs.length - 1];
        return {
          chatId,
          name: vendor.name,
          category: vendor.category,
          lastMessage: lastMsg ? lastMsg.text : 'Click to start conversation...',
          timestamp: lastMsg ? lastMsg.timestamp : ''
        };
      });
    } else {
      // Return couple conversation
      const chatId = `couple_${currentVendorId}`;
      const threadMsgs = directMessages.filter(m => m.chatId === chatId);
      const lastMsg = threadMsgs[threadMsgs.length - 1];
      return [
        {
          chatId,
          name: 'Sarah & David',
          category: 'Client',
          lastMessage: lastMsg ? lastMsg.text : 'Click to start conversation...',
          timestamp: lastMsg ? lastMsg.timestamp : ''
        }
      ];
    }
  };



  return (
    <View style={{ flex: 1, backgroundColor: 'transparent', display: isFocused ? 'flex' : 'none' }}>
      <BackgroundSlideshow />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
      >
      {/* Dual Tab bar selection */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'ai' && styles.activeTabItem]}
          onPress={() => {
            setActiveTab('ai');
            setSelectedChatId(null);
          }}
        >
          <FontAwesome name="android" size={16} color={activeTab === 'ai' ? '#c9a96e' : '#a0937d'} />
          <Text style={[styles.tabText, activeTab === 'ai' && styles.activeTabText]}>AI Assistant</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'direct' && styles.activeTabItem]}
          onPress={() => setActiveTab('direct')}
        >
          <FontAwesome name="comments" size={16} color={activeTab === 'direct' ? '#c9a96e' : '#a0937d'} />
          <Text style={[styles.tabText, activeTab === 'direct' && styles.activeTabText]}>Direct Chats</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'ai' ? (
        // AI ASSISTANT VIEW
        <>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <FontAwesome name="android" size={18} color="#c9a96e" />
              <Text style={styles.headerTitle}>AI Assistant</Text>
            </View>
            <Text style={styles.creditsText}>
              {user?.eventPassActive ? 'Event Pass: Unlimited' : `${creditsCount} credits remaining`}
            </Text>
          </View>

          <FlatList
            ref={aiFlatListRef}
            data={aiMessages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => aiFlatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <View style={[styles.messageRow, item.sender === 'user' ? styles.rowUser : styles.rowAi]}>
                <View style={[styles.bubble, item.sender === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                  <Text style={[styles.bubbleText, item.sender === 'user' && { color: '#0d0d1a' }]}>
                    {item.text.replace(/[#*_]/g, '')}
                  </Text>
                  
                  <View style={styles.bubbleFooter}>
                    <Text style={[styles.timestamp, item.sender === 'user' && { color: 'rgba(13,13,26,0.6)' }]}>
                      {item.timestamp}
                    </Text>
                    {item.sender === 'ai' && item.id !== 'welcome' && (
                      <TouchableOpacity onPress={() => handleSaveToChecklist(item.text)}>
                        <Text style={styles.saveBtn}>💾 Save to Checklist</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
            ListFooterComponent={
              isAiTyping ? (
                <View style={styles.typingBox}>
                  <ActivityIndicator size="small" color="#c9a96e" />
                  <Text style={styles.typingText}>Concierge is writing...</Text>
                </View>
              ) : null
            }
          />

          {aiMessages.length === 1 && (
            <View style={styles.chipsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                {CHIPS.map((chip) => (
                  <TouchableOpacity
                    key={chip.label}
                    style={styles.chip}
                    onPress={() => handleSendAiMessage(chip.text)}
                  >
                    <Text style={styles.chipText}>{chip.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.inputBar}>
            <TextInput 
              style={styles.input}
              placeholder={creditsCount <= 0 && !user?.eventPassActive ? "Out of credits..." : "Ask your concierge details..."}
              placeholderTextColor="#5a5470"
              value={aiInputText}
              onChangeText={setAiInputText}
              editable={!(creditsCount <= 0 && !user?.eventPassActive)}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !aiInputText.trim() && { opacity: 0.6 }]}
              disabled={!aiInputText.trim() || (creditsCount <= 0 && !user?.eventPassActive)}
              onPress={() => handleSendAiMessage(aiInputText)}
            >
              <FontAwesome name="send" size={16} color="#0d0d1a" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        // DIRECT CLIENT-VENDOR MESSAGING VIEW
        <>
          {!selectedChatId ? (
            // Conversation Contacts List Preview
            <FlatList
              data={getConversationsList()}
              keyExtractor={(item) => item.chatId}
              contentContainerStyle={styles.contactsList}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.contactCard}
                  onPress={() => setSelectedChatId(item.chatId)}
                >
                  <View style={styles.contactHeader}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <View style={styles.contactBadge}>
                      <Text style={styles.contactBadgeText}>{item.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.contactLastMsg} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                  {item.timestamp ? (
                    <Text style={styles.contactTime}>{item.timestamp}</Text>
                  ) : null}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No active booked contacts found.</Text>
                </View>
              }
            />
          ) : (
            // Active Conversation Thread
            <>
              <View style={styles.header}>
                <TouchableOpacity 
                  style={styles.backBtn}
                  onPress={() => setSelectedChatId(null)}
                >
                  <FontAwesome name="angle-left" size={24} color="#c9a96e" />
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <View style={styles.threadMeta}>
                  <Text style={styles.headerTitle}>{getChatPartnerName(selectedChatId)}</Text>
                  <Text style={styles.threadSubtitle}>{getChatPartnerCategory(selectedChatId)}</Text>
                </View>
                <View style={{ width: 40 }} />
              </View>

              <FlatList
                ref={directFlatListRef}
                data={activeChatMessages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => directFlatListRef.current?.scrollToEnd({ animated: true })}
                renderItem={({ item }) => {
                  const isSelf = user ? (user.role === 'couple' ? item.senderId === 'couple' : item.senderId === currentVendorId) : false;
                  return (
                    <View style={[styles.messageRow, isSelf ? styles.rowUser : styles.rowAi]}>
                      <View style={[styles.bubble, isSelf ? styles.bubbleUser : styles.bubbleAi]}>
                        <Text style={[styles.bubbleText, isSelf && { color: '#0d0d1a' }]}>
                          {item.text}
                        </Text>
                        <Text style={[styles.timestamp, isSelf && { color: 'rgba(13,13,26,0.6)' }]}>
                          {item.timestamp}
                        </Text>
                      </View>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No messages yet. Send a note to say hello!</Text>
                  </View>
                }
              />

              <View style={styles.inputBar}>
                <TextInput 
                  style={styles.input}
                  placeholder="Type your message..."
                  placeholderTextColor="#5a5470"
                  value={directInputText}
                  onChangeText={setDirectInputText}
                />
                <TouchableOpacity 
                  style={[styles.sendBtn, !directInputText.trim() && { opacity: 0.6 }]}
                  disabled={!directInputText.trim()}
                  onPress={handleSendDirectMessage}
                >
                  <FontAwesome name="send" size={16} color="#0d0d1a" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(22, 22, 42, 0.45)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 110, 0.15)',
    paddingTop: Platform.OS === 'web' ? 0 : 50,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: '#c9a96e',
  },
  tabText: {
    color: '#a0937d',
    fontWeight: '600',
    fontSize: 13,
  },
  activeTabText: {
    color: '#c9a96e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(26, 26, 46, 0.45)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 110, 0.15)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '700',
    color: '#f5f0e8',
  },
  threadMeta: {
    alignItems: 'center',
  },
  threadSubtitle: {
    fontSize: 11,
    color: '#c9a96e',
    fontWeight: '500',
    marginTop: 2,
  },
  creditsText: {
    fontSize: 11,
    color: '#c9a96e',
    fontWeight: '600',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAi: {
    justifyContent: 'flex-start',
  },
  bubble: {
    padding: 14,
    borderRadius: 16,
    maxWidth: '85%',
  },
  bubbleUser: {
    backgroundColor: '#c9a96e',
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    backgroundColor: 'rgba(201, 169, 110, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    color: '#f5f0e8',
    lineHeight: 20,
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201, 169, 110, 0.1)',
    paddingTop: 6,
    gap: 16,
  },
  timestamp: {
    fontSize: 10,
    color: '#6b6157',
    marginTop: 4,
  },
  saveBtn: {
    fontSize: 11,
    color: '#c9a96e',
    fontWeight: '700',
  },
  typingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  typingText: {
    color: '#a0937d',
    fontSize: 12,
  },
  chipsContainer: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201, 169, 110, 0.1)',
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(26, 26, 46, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
  },
  chipText: {
    color: '#a0937d',
    fontSize: 12,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201, 169, 110, 0.15)',
    backgroundColor: 'rgba(26, 26, 46, 0.65)',
  },
  input: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    color: '#f5f0e8',
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: '#c9a96e',
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactsList: {
    padding: 16,
    gap: 12,
  },
  contactCard: {
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactName: {
    color: '#f5f0e8',
    fontSize: 15,
    fontWeight: '700',
  },
  contactBadge: {
    backgroundColor: 'rgba(201, 169, 110, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  contactBadgeText: {
    color: '#c9a96e',
    fontSize: 10,
    fontWeight: '700',
  },
  contactLastMsg: {
    color: '#a0937d',
    fontSize: 13,
    marginTop: 4,
  },
  contactTime: {
    fontSize: 10,
    color: '#6b6157',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 60,
  },
  backText: {
    color: '#c9a96e',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#a0937d',
    fontSize: 14,
    textAlign: 'center',
  },
});
