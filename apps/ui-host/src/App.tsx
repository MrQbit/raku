import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

const Catalog = lazy(() => import("ui_catalog/App"));
const Server = lazy(() => import("ui_server/App"));
const Packs = lazy(() => import("ui_packs/App"));
// const Agents = lazy(() => import("ui_agents/App")); // Not implemented yet
const Policy = lazy(() => import("ui_policy/App"));
const Obs = lazy(() => import("ui_obs/App"));
// const A2A = lazy(() => import("ui_a2a/App")); // Hidden for now
const Docs = lazy(() => import("ui_docs/App"));

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ display: "flex", gap: 12, padding: 12 }}>
        <Link to="/">Catalog</Link>
        <Link to="/server">Server</Link>
        <Link to="/packs">Packs</Link>
        {/* <Link to="/agents">Agents</Link> Not implemented yet */}
        <Link to="/policy">Policy</Link>
        <Link to="/obs">Observability</Link>
        {/* <Link to="/a2a">A2A</Link> Hidden for now */}
        <Link to="/docs">Docs</Link>
      </nav>
      <Suspense fallback={<div>Loading…</div>}>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/server/*" element={<Server />} />
          <Route path="/packs/*" element={<Packs />} />
          {/* <Route path="/agents/*" element={<Agents />} /> Not implemented yet */}
          <Route path="/policy/*" element={<Policy />} />
          <Route path="/obs/*" element={<Obs />} />
          {/* <Route path="/a2a/*" element={<A2A />} /> Hidden for now */}
          <Route path="/docs/*" element={<Docs />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
