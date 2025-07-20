import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './pages/signup';
import Signin from './pages/signin';
import Customize from './pages/Customize';
import Home from './pages/Home';
import { userdataContext } from './contextAPI/UserContext';
import Customize2 from './pages/Customize2';

const App = () => {
  const { userdata } = useContext(userdataContext);

  return (
    <Routes>
      {/* 🏠 Home: accessible after full customization OR redirect to customize */}
      <Route
        path="/"
        element={
          userdata ? (
            userdata?.assistantImage && userdata?.assistantName ? (
              <Home />
            ) : (
              <Navigate to="/customize" />
            )
          ) : (
            <Navigate to="/signin" />
          )
        }
      />

      {/* 🔐 Signup route: redirect if already logged in */}
      <Route
        path="/signup"
        element={!userdata ? <SignUp /> : <Navigate to="/" />}
      />

      {/* 🔐 Signin route: redirect if already logged in */}
      <Route
        path="/signin"
        element={!userdata ? <Signin /> : <Navigate to="/" />}
      />

      {/* 🎨 Customize: always accessible for logged in users */}
      <Route
        path="/customize"
        element={userdata ? <Customize /> : <Navigate to="/signup" />}
      />

      {/* 🎨 Customize2: accessible for logged in users */}
      <Route
        path="/customize2"
        element={userdata ? <Customize2 /> : <Navigate to="/signup" />}
      />
    </Routes>
  );
};

export default App;
