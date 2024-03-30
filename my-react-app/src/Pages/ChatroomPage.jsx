import React, { useState, useEffect, useRef } from 'react';
import '../Styles/ChatroomPage.css'; // Make sure the path to your CSS file is correct

function ChatroomPage() {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const newSocket = new WebSocket('ws://localhost:8080');

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
        if (!socket || messageText.trim() === '') return;

        const username = localStorage.getItem('Username'); // Retrieve the username from localStorage
        const newMessage = {
            content: messageText,
            sender: username, // Include the sender's username in the message
        };

        socket.send(JSON.stringify(newMessage));
        setMessageText('');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    return (
        <div className="chatroom-page">
            <div className="chat-area">
                <div className="chat-messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.sender === localStorage.getItem('Username') ? 'sent' : 'received'}`}>
                            <span className="message-sender">{message.sender}</span>: <span className="message-content">{message.content}</span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="message-input">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && messageText.trim()) {
                                sendMessage();
                            }
                        }}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
}

export default ChatroomPage;
