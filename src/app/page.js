import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import CodeTerminal from "@/components/home/CodeTerminal";
import EditorialStats from "@/components/home/EditorialStats";
import FeatureGrid from "@/components/home/FeatureGrid";
import ArchitecturePipeline from "@/components/home/ArchitecturePipeline";
import EditorialCta from "@/components/home/EditorialCta";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Hero />
        <CodeTerminal />
        <EditorialStats />
        <FeatureGrid />
        <ArchitecturePipeline />
        <EditorialCta />
      </main>
      <Footer />
    </div>
  );
}
