import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";

const ExperimentDetail = lazy(() => import("@/pages/ExperimentDetail"));
const Preview = lazy(() => import("@/pages/Preview"));
const Simulation = lazy(() => import("@/pages/Simulation"));
const Practice = lazy(() => import("@/pages/Practice"));
const Analysis = lazy(() => import("@/pages/Analysis"));
const QuestionManager = lazy(() => import("@/pages/QuestionManager"));
const About = lazy(() => import("@/pages/About"));

export default function App() {
  return (
    <Router>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">加载中...</p>
          </div>
        </div>
      }>
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
      </Suspense>
    </Router>
  );
}
