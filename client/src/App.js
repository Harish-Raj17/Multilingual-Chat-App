import React, { useState } from "react";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import ChatBox from "./components/ChatBox";

const App = () => {
  const [user, setUser] = useState(null);
  const [registered, setRegistered] = useState(false);

  if (!registered) return <RegisterForm onRegistered={() => setRegistered(true)} />;
  if (!user) return <LoginForm onLogin={setUser} />;
  return <ChatBox user={user} />;
};

export default App;
