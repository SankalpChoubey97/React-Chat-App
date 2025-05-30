import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  chatAppSelector,
  fetchContacts,
  fetchConversations,
} from "../../../redux/ChatAppReducer";
import styles from "./Left.module.css";
import { Outlet, useNavigate } from "react-router-dom";

// ...all imports stay the same

export function Left() {
  //states required for this component
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [searchConversations, setSearchConversations] = useState([]);
  const [searchContacts, setSearchContacts] = useState([]);
  //redux states
  const { Conversations, Contacts, pendingConversations, pendingContacts,user } = useSelector(chatAppSelector);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch conversations and contacts when the component mounts
  useEffect(() => {
    dispatch(fetchConversations(user.id));
    dispatch(fetchContacts(user.id));
  }, []);


  // Filter contacts to exclude those already in 1-on-1 conversations
  useEffect(() => {
    const filtered = Contacts.filter(contact => 
      // Check if contact.id is NOT present in any 1-on-1 conversation's userIds
      Conversations.every(conversation => 
        conversation.isGroup || !conversation.userIds.includes(contact.id)
      )
    );
    setFilteredContacts(filtered);
  }, [Contacts, Conversations]);


  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    //setting the search term state
    setSearchTerm(value);

    // If the search term is less than 3 characters, clear the search results
    if (value.length >= 3) {
      const lowerCaseValue = value.toLowerCase();

      // Filter conversations and contacts based on the search term
      const filteredConversations = Conversations.filter((conversation) => {
        const nameToSearch = conversation.isGroup
          ? conversation.name
          : conversation.senderDetails?.name;

        return (nameToSearch || "").toLowerCase().includes(lowerCaseValue);
      });

      // Filter contacts based on the search term
      const filteredContacts = Contacts.filter((contact) =>
        (contact.name || "").toLowerCase().includes(lowerCaseValue)
      );

      // Filter out contacts that are already in 1-on-1 conversations
      const uniqueContacts = filteredContacts.filter(contact =>
        Conversations.every(conversation =>
          conversation.isGroup || !conversation.userIds.includes(contact.id)
        )
      );

      setSearchConversations(filteredConversations);
      setSearchContacts(uniqueContacts);
    } else {
      setSearchConversations([]);
      setSearchContacts([]);
    }
  };

  // X button to clear the search input and results
  const clearSearch = () => {
    setSearchTerm("");
    setSearchConversations([]);
    setSearchContacts([]);
  };

  // Handle conversation click by navigating to the conversation page
  const handleConversationClick = (conversationId) => {
    setSelectedClass(conversationId);
    navigate(`conversations/${conversationId}`);
  };

  // Handle contact click by navigating to the contact's page
  const handleContactClick = (contactId) => {
    setSelectedClass(contactId);
    navigate(`contacts/${contactId}`);
  };

  return (
    <>
      <div className={styles.leftSidebar}>
        {/* Search bar */}
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              aria-label="Clear search"
              className={styles.clearButton}
            >
              &#x2715;
            </button>
          )}
        </div>

        {/* Conversations */}
        <div className={styles.section}>
          <h3>Conversations</h3>
          <ul className={styles.list}>
            {(searchTerm.length >= 3 ? searchConversations : Conversations).length > 0 ? (
              (searchTerm.length >= 3 ? searchConversations : Conversations).map((conversation) => (
                <li
                  key={conversation.id}
                  className={`${styles.listItem} ${
                    selectedClass === conversation.id ? styles.selected : ""
                  }`}
                  onClick={() => handleConversationClick(conversation.id)}
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${
                      conversation.isGroup
                        ? conversation.name
                        : conversation.senderDetails?.name || "User"
                    }&background=random`}
                    alt="avatar"
                    className={styles.avatar}
                  />
                  <div>
                    <div className={styles.conversationName}>
                      {conversation.isGroup
                        ? conversation.name
                        : conversation.senderDetails?.name || "Unknown User"}
                    </div>
                    {conversation.lastMessage?.text && (
                      <div className={styles.messagePreview}>
                        {conversation.lastMessage.text.slice(0, 50)}
                      </div>
                    )}
                    {conversation.timestamp && (
                      <div className={styles.timestamp}>
                        {new Date(conversation.timestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                </li>
              ))
            ) : (
              searchTerm.length >= 3 && (
                <div className={styles.noResults}>No conversations found</div>
              )
            )}
            {pendingConversations && (
              <div className={styles.loading}>Loading...</div>
            )}
          </ul>
        </div>

        {/* Contacts */}
        <div className={styles.section}>
          <h3>Contacts</h3>
          <ul className={styles.list}>
            {(searchTerm.length >= 3 ? searchContacts : filteredContacts).length > 0 ? (
              (searchTerm.length >= 3 ? searchContacts : filteredContacts).map((contact) => (
                <li
                  key={contact.id}
                  className={`${styles.listItem} ${
                    selectedClass === contact.id ? styles.selected : ""
                  }`}
                  onClick={() => handleContactClick(contact.id)}
                >
                  <span className={styles.contactName}>
                    {contact.name || "Unknown User"}
                  </span>
                </li>
              ))
            ) : (
              searchTerm.length >= 3 && (
                <div className={styles.noResults}>No contacts found</div>
              )
            )}
            {pendingContacts && (
              <div className={styles.loading}>Loading...</div>
            )}
          </ul>
        </div>
      </div>
      <Outlet />
    </>
  );
}

