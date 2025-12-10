import { Layout } from "@/components/layout/Layout";
import { HeroBanner } from "@/components/home/HeroBanner";
import { Categories } from "@/components/home/Categories";
import { Bestsellers } from "@/components/home/Bestsellers";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroBanner />
      <Categories />
      <Bestsellers />
      <CTASection />
    </Layout>
  );
};

export default Index;
