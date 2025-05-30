import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  chatAppSelector,
  fetchConversations,
  fetchConversationTitle,
  fetchMessages,
  sendMessage,
} from "../../../redux/ChatAppReducer";
import styles from "./Conversations.module.css";

export function Conversations() {
  // Extract conversationID from URL parameters
  const { conversationID } = useParams();

  // Redux states
  const { Messages, user, ConversationTitle, pendingTitle,pendingMessages } = useSelector(chatAppSelector);
  const dispatch = useDispatch();

  // Local state for message input
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);

  // Fetch conversation title and messages when the component mounts or conversationID changes
  useEffect(() => {
    dispatch(fetchConversationTitle(conversationID)).then(() => {
        dispatch(fetchMessages(conversationID));
      }
    );
  }, [conversationID]);

  // Scroll to bottom when messages are fetched
  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [Messages]);

  // Handle sending a message
  const handleSend = () => {
    console.log("Hanle send");
    // Check if messageText is empty or contains only whitespace
    if (!messageText.trim()){
      return;
    } 

    const newMessage={
      conversationId: conversationID,
      senderId: user.id,
      text: messageText.trim(),
      timestamp: new Date().toISOString(),
    }

    console.log("New message:", newMessage);

    // Dispatch sendMessage action and then fetch messages and conversations
    dispatch(sendMessage(newMessage)).then(()=>
      dispatch(fetchMessages(conversationID)).then(()=>{
        dispatch(fetchConversations(user.id));
      })
    );

    setMessageText("");
  };

  return (
    <div className={styles.conversationContainer}>
      
      {/* Title Bar */}
      <div className={styles.titleBar}>
        <img
          src={`https://ui-avatars.com/api/?name=${ConversationTitle || "User"}&background=random`}
          alt="avatar"
          className={styles.titleImage}
        />
        {/* Show 'Loading...' if title is still being fetched */}
        <span className={styles.titleName}>
          {pendingTitle ? "Loading..." : ConversationTitle}
        </span>
      </div>

      {/* Messages Section */}
      <div className={styles.messagesSection}>
        {pendingMessages ? (
          // Show loading placeholder when messages are being fetched
          <div className={styles.loadingMessages}>Loading messages...</div>
        ) : (
          // Render messages
          <>
            {Messages.map((message) => {
              const isOwnMessage = user.id === message.senderId;
              const senderName = message.sender?.name || "User";

              return (
                <div
                  key={message.id}
                  className={`${styles.messageItem} ${
                    isOwnMessage ? styles.ownMessage : styles.otherMessage
                  }`}
                >
                  {!isOwnMessage && (
                    <img
                      src={`https://ui-avatars.com/api/?name=${senderName}&background=random`}
                      alt="avatar"
                      className={styles.messageImage}
                    />
                  )}
                  <div
                    className={`${styles.messageContent} ${
                      isOwnMessage ? styles.ownMessageContent : ""
                    }`}
                  >
                    <div className={styles.messageSender}>{senderName}</div>
                    <div className={styles.messageText}>{message.text}</div>
                    <div className={styles.messageTimestamp}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Send Box */}
      <div className={styles.sendBox}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message"
          className={styles.messageInput}
          onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }
          }
        />
        <button className={styles.sendButton} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );


}
