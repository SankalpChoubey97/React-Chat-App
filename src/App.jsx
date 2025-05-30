import { Provider } from 'react-redux'
import {store} from './redux/Store'
import { Heading } from './components/Heading/Heading'
// import { Body } from './components/Body/Body'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Left } from './components/Body/Left/Left'
import { Conversations } from './components/Body/Right/Conversations'
import { Contacts } from './components/Body/Right/Contacts'
import { ErrorPage } from './ErrorPage/Error'

function App() {
 //router creation
  const router=createBrowserRouter([
    {path:'/', element:<Heading/>, children:[
      {path:'', element:<Left/>, children:[
        {path:'conversations/:conversationID', element:<Conversations/>},
        {path:'contacts/:contactID', element:<Contacts/>}
      ]}
    ]},
    {path: '*',element:<ErrorPage/>}  
  ]);

  //routerProvider and store added in return statement
  return (
    <>
      <Provider store={store}>
        <RouterProvider router={router}/>
      </Provider>
    </>
  )
}

export default App
