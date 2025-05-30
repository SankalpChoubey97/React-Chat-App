Feature of the application

1) Rendering all conversations and contacts. It is making db call for this purpose[last message is also displayed in conversations]
2) Search bar, filtering out conversations and contacts based on search bar
3) Clicking on conversation navigates to /conversation/conversationID, rendering Conversations component
   Messages are rendered using database call to messages collection where conversationID is searched. ConversationID is retrieved using useParams from react-router-dom
4) Similar to conversation, clicking on contacts navigates to /contacts/contactID, 
   User is retrieved using contactID and username is displayed. Start conversation message will be displayed
5) Update conversation document takes place on sending new message, also message collection will be appended with the new message. 
6) New conversation and message is created and appended to conversation and message collection when new message is sent to a contact where no previous message is present. 

This application uses functional components, makes use of react hooks to call async functions for rendering purpose. 
States are stored using redux toolkit. Stated are updated using extra reducers, which receive data from async thunk functions. 
Thunk functions are making database calls. Since I did not have a working API for this app.
