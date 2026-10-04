import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  Modal, 
  Dimensions, 
  SafeAreaView 
} from 'react-native';
import { useWeddingStore } from '@/lib/store';
import { getAiResponse } from '@/lib/aiService';
import { FontAwesome } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function FloatingChatBot() {
  const store = useWeddingStore();
  const { user, loading, deductAiCredit } = store;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  const creditsCount = user?.aiCredits ?? 15;

  // Initialize welcome message when user changes or chat opens
  useEffect(() => {
    const userName = user ? user.name : 'there';
    const welcomeText = user 
      ? `### 🌸 Welcome back, **${userName}**!\nI'm your **VND Wedding Concierge**. How is your wedding planning going today? \n\nAsk me anything about:\n• 💰 **Budget** calculations\n• 📋 **Checklist** timelines\n• 👥 **Guest** list RSVPs\n• ✍️ Writing **vows or speeches**!`
      : `### 🧭 Welcome to the **VND Wedding Concierge**!\nI'm your digital wedding planning assistant. \n\n*💡 Tip: Sign In or Register to link your budget, custom checklist, and get personalized recommendations!*\n\nHow can I help you plan your special day today?`;

    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  }, [user, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await getAiResponse(textToSend, creditsCount);
      setIsTyping(false);

      const aiMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, aiMsg]);

      // Deduct credit if successful and user is authenticated and not on Event Pass/Admin
      if (user && response.creditsUsed && user.role !== 'admin' && !user.eventPassActive) {
        await deductAiCredit();
      }
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          sender: 'ai',
          text: `### ⚠️ Connection Error\nSorry, I couldn't reach the planning server. Please check your connection and try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  };

  // Helper to format/clean markdown symbols for native Text displays
  const cleanMarkdown = (text: string) => {
    if (!text) return '';
    return text
      .replace(/[#*_]/g, '') // remove header marks, bold, italic
      .trim();
  };

  if (loading) return null;

  return (
    <>
      {/* Floating Bubble Button */}
      {!isOpen && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => setIsOpen(true)}
          activeOpacity={0.8}
        >
          <FontAwesome name="android" size={26} color="#0d0d1a" />
        </TouchableOpacity>
      )}

      {/* Expanded Chat Overlay Modal */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          {/* Tap-out dark transparent backdrop */}
          <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={() => setIsOpen(false)}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            {/* Main Chat Panel */}
            <View style={styles.chatContainer}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.botAvatar}>
                    <FontAwesome name="android" size={16} color="#c9a96e" />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>VND AI Concierge</Text>
                    <Text style={styles.headerSubtitle}>Online • 24/7 Planning Assistant</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeButton}>
                  <FontAwesome name="close" size={18} color="#a0937d" />
                </TouchableOpacity>
              </View>

              {/* Messages stream */}
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                renderItem={({ item }) => (
                  <View style={[styles.messageRow, item.sender === 'user' ? styles.rowUser : styles.rowAi]}>
                    <View style={[styles.bubble, item.sender === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                      <Text style={[styles.bubbleText, item.sender === 'user' && { color: '#0d0d1a' }]}>
                        {cleanMarkdown(item.text)}
                      </Text>
                      <Text style={[styles.timestamp, item.sender === 'user' && { color: 'rgba(13,13,26,0.6)' }]}>
                        {item.timestamp}
                      </Text>
                    </View>
                  </View>
                )}
                ListFooterComponent={
                  isTyping ? (
                    <View style={styles.typingBox}>
                      <ActivityIndicator size="small" color="#c9a96e" />
                      <Text style={styles.typingText}>Concierge is thinking...</Text>
                    </View>
                  ) : null
                }
              />

              {/* Credits Bar */}
              {user && (
                <View style={styles.creditsBar}>
                  <Text style={styles.creditsText}>
                    {user.eventPassActive ? '🎟️ Event Pass: Unlimited Chats' : `⚡ ${creditsCount} Credits Remaining`}
                  </Text>
                </View>
              )}

              {/* Input Box */}
              <View style={styles.inputBar}>
                <TextInput
                  style={styles.input}
                  placeholder={creditsCount <= 0 && !user?.eventPassActive ? "Out of credits..." : "Ask your planning assistant..."}
                  placeholderTextColor="#5a5470"
                  value={inputText}
                  onChangeText={setInputText}
                  editable={!(creditsCount <= 0 && !user?.eventPassActive) && !isTyping}
                />
                <TouchableOpacity 
                  style={[styles.sendBtn, !inputText.trim() && { opacity: 0.6 }]}
                  disabled={!inputText.trim() || (creditsCount <= 0 && !user?.eventPassActive) || isTyping}
                  onPress={() => handleSendMessage(inputText)}
                >
                  <FontAwesome name="send" size={14} color="#0d0d1a" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 95 : 85,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#c9a96e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 99999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
  },
  chatContainer: {
    backgroundColor: 'rgba(13, 13, 26, 0.98)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.3)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(201, 169, 110, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 110, 0.15)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(201, 169, 110, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#c9a96e',
  },
  headerSubtitle: {
    fontSize: 10,
    color: 'rgba(245, 240, 232, 0.6)',
    marginTop: 1,
  },
  closeButton: {
    padding: 6,
  },
  messagesList: {
    padding: 14,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAi: {
    justifyContent: 'flex-start',
  },
  bubble: {
    padding: 12,
    borderRadius: 14,
    maxWidth: '85%',
  },
  bubbleUser: {
    backgroundColor: '#c9a96e',
    borderBottomRightRadius: 2,
  },
  bubbleAi: {
    backgroundColor: 'rgba(201, 169, 110, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
    borderBottomLeftRadius: 2,
  },
  bubbleText: {
    fontSize: 13,
    color: '#f5f0e8',
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 9,
    color: '#6b6157',
    marginTop: 4,
    textAlign: 'right',
  },
  typingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 6,
    marginTop: 4,
  },
  typingText: {
    color: '#a0937d',
    fontSize: 11,
  },
  creditsBar: {
    paddingVertical: 5,
    backgroundColor: 'rgba(201, 169, 110, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(201, 169, 110, 0.08)',
    alignItems: 'center',
  },
  creditsText: {
    fontSize: 10,
    color: '#c9a96e',
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201, 169, 110, 0.15)',
    backgroundColor: 'rgba(13, 13, 26, 0.98)',
  },
  input: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    color: '#f5f0e8',
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: '#c9a96e',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
