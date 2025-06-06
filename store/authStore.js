//GLOBAL STATE USING ZUSTAND
import {create} from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {API_URL} from "../constants/api"; // Import the API URL from the constants file
// //import the api url from the constants file


export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    //becz as soon as we start the application we wanna check for authentication
    isCheckingAuth: true,
  
    register: async (username, email, password) => {
      set({ isLoading: true });
      try {
        const response = await fetch(`${API_URL}/auth/register`, {
         //const response = await fetch("https://react-native-wasteapp.onrender.com/api/auth/register", { 
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        });
  
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Something went wrong!");
        }
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("token", data.token);
        //isLoading is set to false after the data is fetched
        set({ user: data.user, token: data.token, isLoading: false });
        return{success:true}

  
      } catch (error) {
        set({ isLoading: false });
        return{success:false,message:error.message};
      }
    },
    login:async(email,password)=>{  
      set({ isLoading: true });
      try {
        //const response = await fetch("https://react-native-wasteapp.onrender.com/api/auth/login", { 
         const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });
  
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Something went wrong!");
        }
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("token", data.token);
        set({ user: data.user, token: data.token, isLoading: false });
        return{success:true}
      } catch (error) {
        set({ isLoading: false });
        return{success:false,message:error.message};
      }   

    },
    checkAuth:async()=>{
      try {
        const token = await AsyncStorage.getItem("token");
        const userJson = await AsyncStorage.getItem("user");
        const user = userJson ? JSON.parse(userJson) : null;
        set({ user, token });
      } catch (error) {
        console.log("Auth check failed",error);
      }
      finally{
        set({ isCheckingAuth: false });
       }
    },
    logout:async()=>{
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      set({ user: null, token: null });
    },
  }));
  