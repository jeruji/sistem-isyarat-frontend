import React from "react";
import { Routes, Route } from "react-router-dom";
import Admin from "./Admin";
import Login from "./Login";

const Home = React.lazy(() => import("./Home"));
const Loading = () => <p>Loading...</p>;

const Main = () => {
  return (
    <div>
      <React.Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </React.Suspense>
    </div>
  );
};

export default Main;
