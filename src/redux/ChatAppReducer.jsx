import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  runTransaction,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  documentId
} from "firebase/firestore";


export const fetchConversations = createAsyncThunk(
  "chatApp/fetchConversations",
  async (userId, thunkAPI) => {
    try {
      const conversationsRef = collection(db, "conversations");

      const q = query(
        conversationsRef,
        where("userIds", "array-contains", userId)
      );

      const querySnapshot = await getDocs(q);

      const conversations = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const conversation = {
            id: docSnap.id,
            ...data,
          };

          if (!conversation.isGroup && Array.isArray(conversation.userIds)) {
            const otherUserId = conversation.userIds.find(id => id !== userId);

            if (otherUserId) {
              try {
                const usersRef = collection(db, "users");

                const q = query(usersRef, where(documentId(), "==", otherUserId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                  const userDoc = querySnapshot.docs[0]; // Only one match expected
                  conversation.senderDetails = {
                    id: userDoc.id,
                    ...userDoc.data(),
                  };
                }
              } catch (err) {
                console.error(`Error fetching user with id=${otherUserId}:`, err);
              }
            }
          }

          // Convert top-level timestamp string to Date object for sorting
          if (conversation.timestamp) {
            conversation.timestampDate = new Date(conversation.timestamp);
          } else {
            conversation.timestampDate = new Date(0); // fallback for missing timestamp
          }

          return conversation;
        })
      );

      // Sort by top-level timestampDate descending
      conversations.sort((a, b) => b.timestampDate - a.timestampDate);

      // console.log("Conversations (sorted by top-level timestamp):", conversations);
      return conversations;
    } catch (error) {
      console.error("❌ Error fetching conversations:", error);
      return thunkAPI.rejectWithValue("Failed to fetch conversations");
    }
  }
);

export const fetchContacts = createAsyncThunk(
  "chatApp/fetchContacts",
  async (userId, thunkAPI) => {
    try {
      const contactsRef = collection(db, "users");
      const q = query(contactsRef, where("id", "!=", userId));
      const querySnapshot = await getDocs(q);

      const contacts = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Sort contacts by name ascending (A-Z)
      contacts.sort((a, b) => {
        const nameA = a.name?.toLowerCase() || "";
        const nameB = b.name?.toLowerCase() || "";
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });

      return contacts;
    } catch (error) {
      console.error("❌ Error fetching contacts:", error);
      return thunkAPI.rejectWithValue("Failed to fetch contacts");
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chatApp/fetchMessages",
  async (conversationId, thunkAPI) => {
    try {
      const messagesRef = collection(db, "messages");

      // Step 1: Fetch messages for given conversationId
      const q = query(messagesRef, where("conversationId", "==", conversationId));
      const querySnapshot = await getDocs(q);

      let messages = [];

      // Step 2: Map over messages and join with users
      for (const docSnap of querySnapshot.docs) {
        const messageData = {
          id: docSnap.id,
          ...docSnap.data(),
        };

        // Step 3: Fetch user using senderId
        const userRef = doc(db, "users", messageData.senderId);
        const userSnap = await getDoc(userRef);

        // Step 4: Attach user info if exists
        if (userSnap.exists()) {
          messageData.sender = userSnap.data(); // attach user data under "sender"
        } else {
          messageData.sender = null; // or default fallback
        }

        messages.push(messageData);
      }

      // Step 5: Sort messages by timestamp string
      messages.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
        const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
        return dateA - dateB;
      });

      return messages;
    } catch (error) {
      console.error("❌ Error fetching messages with user data:", error);
      return thunkAPI.rejectWithValue("Failed to fetch messages");
    }
  }
);


export const fetchConversationTitle = createAsyncThunk(
  "chatApp/fetchConversationTitle",
  async (conversationId, thunkAPI) => {
    try {
      // Step 1: Query conversation where id == conversationId
      const q = query(
        collection(db, "conversations"),
        where(documentId(), "==", conversationId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return thunkAPI.rejectWithValue("Conversation not found");
      }

      const conversationSnap = querySnapshot.docs[0];
      const conversationData = conversationSnap.data();

      // Step 2: If it's a group conversation, return the group name
      if (conversationData.isGroup) {
        return conversationData.name || "Unnamed Group";
      }

      // Step 3: For one-on-one chat, find the other user's ID (excluding 'u6')
      const otherUserId = conversationData.userIds.find((id) => id !== "u6");
      if (!otherUserId) {
        return thunkAPI.rejectWithValue("Other user not found");
      }

      // Step 4: Get the user document
      const userRef = doc(db, "users", otherUserId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return thunkAPI.rejectWithValue("User not found");
      }

      const userData = userSnap.data();
      return userData.name || "Unnamed User";
    } catch (error) {
      console.error("❌ Error fetching conversation title:", error);
      return thunkAPI.rejectWithValue("Failed to fetch conversation title");
    }
  }
);

export const fetchSender = createAsyncThunk(
  "chatApp/fetchSender",async (id, thunkAPI) => {
    try {
      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return thunkAPI.rejectWithValue("Sender not found");
      }

      const senderData = userSnap.data();
      // console.log("Sender data:", senderData);
      return senderData;
    }
    catch (error) {
      console.error("❌ Error fetching sender:", error); 
      return thunkAPI.rejectWithValue("Failed to fetch sender");
    }
  }
);

const sendMessageToFirestore = async (message, transaction) => {
  const messageRef = doc(collection(db, "messages")); // auto-generated ID
  transaction.set(messageRef, message); // timestamp already inside `message`
};

// ✅ Updates the conversation and sends the message in a transaction
export const sendMessage = createAsyncThunk(
  "chatApp/sendMessage",
  async (message, thunkAPI) => {
    try {
      const conversationsRef = collection(db, "conversations");

      // 🔍 Find the conversation with id === message.conversationId
      const q = query(conversationsRef, where(documentId(), "==", message.conversationId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error("Conversation not found");
      }

      const conversationDoc = snapshot.docs[0];
      const conversationRef = doc(db, "conversations", conversationDoc.id);

      // 🔁 Run transaction
      await runTransaction(db, async (transaction) => {
        // ✅ Add the message
        await sendMessageToFirestore(message, transaction);

        // ✅ Update the conversation
        transaction.update(conversationRef, {
          lastMessage: {
            senderId: message.senderId,
            text: message.text,
          },
          timestamp: message.timestamp,
        });
      });

      console.log("✅ Message sent and conversation updated:", message);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      return thunkAPI.rejectWithValue("Failed to send message");
    }
  }
);

export const createNewConversation = createAsyncThunk(
  "chatApp/createNewConversation",
  async (newConversation, thunkAPI) => {
    try {
      // Add conversation as-is (no modifications)
      const conversationRef = await addDoc(
        collection(db, "conversations"),
        newConversation
      );

      const conversationId = conversationRef.id;

      // Construct new message
      const newMessage = {
        conversationId: conversationId,
        senderId: newConversation.lastMessage.senderID,
        text: newConversation.lastMessage.text,
        timestamp: newConversation.timestamp, // keep string format
      };

      // Save message in a transaction
      await runTransaction(db, async (transaction) => {
        await sendMessageToFirestore(newMessage, transaction);
      });

      // Only return the conversationId
      return conversationId;
    } catch (error) {
      console.error("❌ Error creating new conversation:", error);
      return thunkAPI.rejectWithValue("Failed to create new conversation");
    }
  }
);




const chatAppSlice=createSlice({
    name:"Chat App",
    initialState:{
        user:{ id: "u6", name: "Fiona Chen", profilePic: "fiona.jpg" },
        sender:null,
        Conversations:[],
        Contacts:[],
        Messages:[],
        ConversationTitle:"",
        pendingConversations:false,
        pendingContacts:false,
        pendingTitle:false,
        pendingMessages:false,
        pendingSender:false,
        newConversationID:null, 
    },
    reducers:{},
    extraReducers: (builder) => {
      builder
        // === FETCH CONVERSATIONS ===
        .addCase(fetchConversations.pending, (state) => {
          state.pendingConversations = true;
        })
        .addCase(fetchConversations.fulfilled, (state, action) => {
          state.Conversations = action.payload;
          state.pendingConversations = false;
          // console.log("Conversations fetched successfully:", action.payload);
        })


        // === FETCH CONTACTS ===
        .addCase(fetchContacts.pending, (state) => {
          state.pendingContacts = true;
        })
        .addCase(fetchContacts.fulfilled, (state, action) => {
          state.Contacts = action.payload;
          state.pendingContacts = false;
          // console.log("Contacts fetched successfully:", action.payload);
        })


        // === FETCH MESSAGES ===
        .addCase(fetchMessages.pending, (state) => {
          state.pendingMessages = true;
          // console.log("Fetching messages...");
        })
        .addCase(fetchMessages.fulfilled, (state, action) => {
          state.Messages = action.payload;
          state.pendingMessages = false;
          // console.log("Messages fetched successfully:", action.payload);
        })


        // === FETCH CONVERSATION TITLE ===
        .addCase(fetchConversationTitle.pending, (state) => {
          state.pendingTitle = true;
        })
        .addCase(fetchConversationTitle.fulfilled, (state, action) => {
          state.ConversationTitle = action.payload;
          state.pendingTitle = false;
          // console.log("Conversation title fetched successfully:", action.payload);
        })
        .addCase(fetchSender.pending, (state,action) => {
          state.pendingSender = true;
        })
        .addCase(fetchSender.fulfilled, (state, action) => {
          state.sender = action.payload;
          state.pendingSender = false;
        })
        .addCase(createNewConversation.fulfilled, (state, action) => {  
          state.newConversationID = action.payload; // Store the new conversation ID
          console.log("New conversation created with ID:", action.payload);
        })

    }

});

export const chatAppReducer=chatAppSlice.reducer;
export const chatAppSelector=(state)=>state.chatAppReducer;