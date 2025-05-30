import { configureStore } from "@reduxjs/toolkit";
import { chatAppReducer } from "./ChatAppReducer";

export const store=configureStore({
    reducer:{
        chatAppReducer
    }
})