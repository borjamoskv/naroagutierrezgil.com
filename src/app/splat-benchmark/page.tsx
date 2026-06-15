import dynamic from 'next/dynamic';

const SplatBenchmarkCanvas = dynamic(() => import('@/components/SplatBenchmarkCanvas'), { ssr: false });

export const metadata = {
  title: 'Splat Benchmark Omega | Naroart',
  description: 'WebGPU C5-REAL Gaussian Splatting Physics Benchmark',
};

export default function SplatBenchmarkPage() {
  return (
    <main className="w-full h-screen bg-black">
      <SplatBenchmarkCanvas />
    </main>
  );
}
