import { BLOG_POSTS } from '@/lib/blogData';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';

// Use Promise type for generateStaticParams to comply with Next.js 15+ 
export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

// Next.js App Router dynamic params are Promises
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden relative">
      {/* Background FX */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] bg-[#2B3BE5] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.05]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 p-6 sm:p-12 mix-blend-difference flex justify-between items-center bg-black/20 backdrop-blur-sm border-b border-white/5">
        <Link 
          href="/blog" 
          className="group flex items-center gap-4 text-white/50 hover:text-white transition-colors duration-500"
        >
          <div className="w-8 h-[1px] bg-white/30 group-hover:bg-[#2B3BE5] group-hover:w-16 transition-all duration-700" />
          <span className="font-sans text-[9px] tracking-[0.4em] uppercase">Volver a la Bitácora</span>
        </Link>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 pt-40 pb-32">
        <article>
          <header className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <span className="font-mono text-[9px] tracking-widest text-[#2B3BE5] bg-[#2B3BE5]/10 px-3 py-1 rounded-sm uppercase">
                {post.category}
              </span>
              <span className="font-mono text-[9px] tracking-widest text-white/40">
                {post.date}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-light leading-[1.1] tracking-tight mb-8">
              {post.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-12 border-b border-white/10 pb-8">
              {post.tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="font-mono text-[8px] tracking-widest uppercase bg-white/[0.03] text-white/50 px-2 py-1 rounded-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </header>

          <div className="relative aspect-[16/9] w-full mb-16 overflow-hidden border border-white/10 rounded-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={post.image} 
              alt={post.title}
              className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </div>

          <div className="prose prose-invert prose-lg max-w-none font-light leading-relaxed text-white/70">
            <p className="text-xl md:text-2xl text-white/90 font-serif leading-relaxed mb-8">
              {post.excerpt}
            </p>
            <div className="space-y-6">
              <p>{post.content}</p>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
