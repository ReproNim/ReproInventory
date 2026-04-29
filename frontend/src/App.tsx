"use client"

import { HashRouter, Routes, Route } from "react-router-dom"
import TrainingMaterialsBrowser from "./training-materials-browser"
import ItemPage from "./pages/ItemPage"

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TrainingMaterialsBrowser />} />
        <Route path="/item/:id" element={<ItemPage />} />
      </Routes>
    </HashRouter>
  )
}
