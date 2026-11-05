import "./globals.css";

export const metadata = {
  title: "Nullback — Managed RAG Infrastructure. One API.",
  description:
    "A progressive managed RAG infrastructure platform for modern AI applications. Bring your own embedding credentials — Nullback handles document ingestion, intelligent chunking, hybrid search, and vector retrieval.",
  keywords: [
    "RAG",
    "Retrieval-Augmented Generation",
    "Vector Search",
    "Hybrid Search",
    "RRF",
    "Embeddings",
    "MongoDB Atlas",
    "Syne Font",
    "Tech Editorial",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
