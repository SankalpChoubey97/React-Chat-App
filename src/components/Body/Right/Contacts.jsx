import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { chatAppSelector, createNewConversation, fetchConversations, fetchSender } from "../../../redux/ChatAppReducer";
import { useEffect, useState } from "react";
import styles from "./Conversations.module.css";

export function Contacts() {
  const {contactID}=useParams();
  const {user,sender,pendingSender}=useSelector(chatAppSelector);
  const [messageText, setMessageText] = useState("");
  const dispatch=useDispatch();
  const navigate=useNavigate();

  // Fetch sender details when the component mounts or contactID changes
  useEffect(() => {
    dispatch(fetchSender(contactID));
  }, [contactID]);


  const handleSend = () => {
    if (!messageText.trim()) return;
    // Dispatch sendMessage here (not implemented in this file)
    const newConversation={
      isGroup:false,
      lastMessage: {
        senderID: user.id,
        text: messageText,
      },
      name: null,
      timestamp: new Date().toISOString(),
      userIds: [user.id, contactID],
    }

    dispatch(createNewConversation(newConversation))
    .unwrap()
    .then((conversationID) => {
      console.log("New conversation created with ID:", conversationID);

      // Step 1: Fetch updated conversations
      dispatch(fetchConversations(user.id)).then(() => {
        // Optionally, you can also fetch messages for the new conversation
        console.log("Conversations updated");
      })

      // Step 2: Navigate to the new conversation
      navigate(`/conversations/${conversationID}`);
    })
    .catch((error) => {
      console.error("Failed to create conversation:", error);
    });


    setMessageText("");
  };
  return (
    <div className={styles.conversationContainer}>
      
      {/* Title Bar */}
      <div className={styles.titleBar}>
        <img
          src={`https://ui-avatars.com/api/?name=${sender?.name || "User"}&background=random`}
          alt="avatar"
          className={styles.titleImage}
        />
        {/* Show 'Loading...' if sender is still being fetched */}
        <span className={styles.titleName}>
          {pendingSender ? "Loading..." : sender?.name}
        </span>
      </div>

      {/* Messages Section */}
      <div className={styles.messagesSection}>
        <div className={styles.loadingMessages}>Start conversation here</div>
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