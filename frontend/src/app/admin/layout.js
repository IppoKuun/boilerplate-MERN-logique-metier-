"use client";

import NavBar from "./NavBar";

export default function AdminLayout({ children }) {
  return (
    <>
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
