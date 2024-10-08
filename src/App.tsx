import { Route, Navigate, Routes } from "react-router-dom";
import './App.css';

import Login from "./components/login";
import Callback from "./components/callback";
import axios from "axios";
import { useLocalStorage } from "./hooks/useLocalstorage";
import { useEffect } from "react";
import Dashboard from "./components/dashboard";

function App() {
    const [accessToken] = useLocalStorage("access_token", "");
    const [isLoggedIn, setIsLoggedIn] = useLocalStorage("isLoggedIn", false);
    const [profile, setProfile] = useLocalStorage("profile", {});
    
    const registerAccount = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_API}/auth/register?access_token=${accessToken}`
            );
            if (response.data?.domain) {
                setIsLoggedIn(true);
                setProfile(response.data);
            }
        } catch (error) {
        }
    };
    useEffect(() => {
        if (accessToken) {
            // registerAccount();
            setIsLoggedIn(true);
        }
    }, [accessToken]);
    return (
        <div className="bg-white App text-slate-500 dark:text-slate-400 dark:bg-slate-900 min-h-[100vh]">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate replace to="/login" />} />
                <Route path="/callback" element={<Callback />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
            {/* <ToastContainer /> */}
        </div>
    );
}

export default App;
