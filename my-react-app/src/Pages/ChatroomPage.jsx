import React, { useState, useEffect, useRef } from 'react';
import '../Styles/ChatroomPage.css'; // Make sure the path to your CSS file is correct
import GifModal from './GifModal'; // Import the GifModal component, adjust the path as necessary
import comptypeGif from '../Gifs/comptype.gif';
import pikachuGif from '../Gifs/pikachu.gif';
import runGif from '../Gifs/run.gif';
import simpsonsGif from '../Gifs/simpsons.gif';
import southparkGif from '../Gifs/southpark.gif';

function ChatroomPage() {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState({ text: '', gif: '' });
    const messagesEndRef = useRef(null);
    const [isGifModalOpen, setIsGifModalOpen] = useState(false); // State to control the GIF modal visibility


    useEffect(() => {
        const newSocket = new WebSocket('ws://34.130.10.90/ws');

        newSocket.onopen = () => {
            console.log("WebSocket connection established");
        };

        newSocket.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        };

        newSocket.onerror = (event) => {
            console.error("WebSocket error observed:", event);
        };

        newSocket.onclose = (event) => {
            console.log("WebSocket connection closed:", event);
        };

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const sendMessage = () => {
        if (!socket || (!currentMessage.text.trim() && !currentMessage.gif)) return;

        const username = localStorage.getItem('Username');
        const newMessage = {
            content: currentMessage,
            sender: username,
        };

        socket.send(JSON.stringify(newMessage));
        setCurrentMessage({ text: '', gif: '' }); // Reset the current message
    };

    const handlePlusClick = () => {
        setIsGifModalOpen(!isGifModalOpen); // Toggle the GIF modal visibility
    };


    const scrollToBottom = () => {
        const chatMessagesContainer = messagesEndRef.current?.parentNode;
        if (chatMessagesContainer) {
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
    };
    
    

    useEffect(scrollToBottom, [messages]);

    const gifs = [
        comptypeGif,
        pikachuGif,
        runGif,
        simpsonsGif,
        southparkGif
    ];

    const handleGifSelect = (gif) => {
        setCurrentMessage(prev => ({ ...prev, gif })); // Set the selected GIF URL
        setIsGifModalOpen(false); // Close the modal
    };

    return (
        <div className="chatroom-page">
            <div className="chat-area">
                <div className="chat-messages">
                    {[...messages].reverse().map((message, index) => {
                        const { text, gif } = message.content; // Destructure text and gif from the message content
    
                        return (
                            <div key={index} className={`message ${message.sender === localStorage.getItem('Username') ? 'sent' : 'received'}`}>
                                {gif && <div className="message-gif"><img src={gif} alt="GIF" style={{ maxWidth: '100px', maxHeight: '100px' }} /></div>}
                                <div className="message-text-block">
                                    <span className="message-sender">{message.sender+":"}</span>
                                    <span className="message-content">{text}</span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                {currentMessage.gif && (
                    <div className="gif-preview" onClick={() => setCurrentMessage(prev => ({ ...prev, gif: '' }))}>
                        <img src={currentMessage.gif} alt="Selected GIF" style={{ maxWidth: '100px', maxHeight: '100px', cursor: 'pointer' }} />
                    </div>
                )}
                <div className="message-input">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={currentMessage.text}
                        onChange={(e) => setCurrentMessage(prev => ({ ...prev, text: e.target.value }))}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && (currentMessage.text.trim() || currentMessage.gif)) {
                                sendMessage();
                            }
                        }}
                    />
                    <button className="plus-button" onClick={handlePlusClick}>+</button>
                    <button className="send-button" onClick={sendMessage}>Send</button>
                </div>
            </div>
            <GifModal
                isOpen={isGifModalOpen}
                gifs={gifs}
                onSelect={handleGifSelect}
                onClose={() => setIsGifModalOpen(false)}
            />
        </div>
    );
    


}

export default ChatroomPage;
