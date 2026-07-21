import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import ExperimentDetail from "@/pages/ExperimentDetail";
import Preview from "@/pages/Preview";
import Simulation from "@/pages/Simulation";
import Practice from "@/pages/Practice";
import Analysis from "@/pages/Analysis";
import QuestionManager from "@/pages/QuestionManager";
import About from "@/pages/About";
import React from "react";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/experiment/:id" element={<ExperimentDetail />} />
          <Route path="/experiment/:id/preview" element={<Preview />} />
          <Route path="/experiment/:id/simulation" element={<Simulation />} />
          <Route path="/experiment/:id/practice" element={<Practice />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/manager" element={<QuestionManager />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </Router>
  );
}
