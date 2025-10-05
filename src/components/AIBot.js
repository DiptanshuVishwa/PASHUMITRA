import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiMic, FiMicOff, FiSend } from 'react-icons/fi';

const BotContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const BotButton = styled(motion.button)`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-coral), #FF6A35);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 127, 80, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    box-shadow: 0 6px 20px rgba(255, 127, 80, 0.4);
  }
`;

const ChatWindow = styled(motion.div)`
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 350px;
  max-width: 90vw;
  height: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  background: var(--primary-coral);
  color: white;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  h3 {
    margin: 0;
    font-size: 16px;
  }
  
  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 18px;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Message = styled.div`
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  
  &.bot {
    background: var(--light-gray);
    color: var(--dark-gray);
    align-self: flex-start;
  }
  
  &.user {
    background: var(--primary-coral);
    color: white;
    align-self: flex-end;
  }
`;

const ChatInput = styled.div`
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  
  &:focus {
    border-color: var(--primary-coral);
  }
`;

const InputButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--primary-coral);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #FF6A35;
  }
  
  &.recording {
    background: var(--danger-red);
    animation: pulse 1s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const AIBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hello! I\'m your PashuMitra AI assistant. How can I help you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const sendMessage = () => {
    if (inputText.trim()) {
      setMessages(prev => [...prev, { type: 'user', content: inputText }]);
      setInputText('');
      
      // Simulate bot response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: 'Thanks for your message. I\'m still learning! This AI bot will be powered by Deepgram Nova for voice interactions.' 
        }]);
      }, 1000);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement Deepgram Nova integration
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <BotContainer>
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <ChatHeader>
              <h3>PashuMitra AI Assistant</h3>
              <button onClick={() => setIsOpen(false)}>
                <FiX />
              </button>
            </ChatHeader>
            
            <ChatMessages>
              {messages.map((message, index) => (
                <Message key={index} className={message.type}>
                  {message.content}
                </Message>
              ))}
            </ChatMessages>
            
            <ChatInput>
              <Input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or use voice..."
              />
              <InputButton
                onClick={toggleRecording}
                className={isRecording ? 'recording' : ''}
                title={isRecording ? 'Stop recording' : 'Start voice recording'}
              >
                {isRecording ? <FiMicOff /> : <FiMic />}
              </InputButton>
              <InputButton onClick={sendMessage} title="Send message">
                <FiSend />
              </InputButton>
            </ChatInput>
          </ChatWindow>
        )}
      </AnimatePresence>
      
      <BotButton
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <FiX /> : <FiMessageCircle />}
      </BotButton>
    </BotContainer>
  );
};

export default AIBot;