import { getBlogPosts } from '@/lib/blogData';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import Footer from '@/components/Footer';
import ReadingProgress from '@/components/ReadingProgress';

export const revalidate = 3600; // ISR revalidation matching listing page

export async function generateStaticParams() {

  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getBlogPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return { title: 'Post no encontrado' };
  }

  // C5-REAL: Omnichannel Open Graph Enforcement
  const canonicalUrl = `https://naroagutierrezgil.com/blog/${slug}`;

  return {
    title: `${post.title} | Naroa Gutiérrez Gil`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonicalUrl,
      siteName: 'Naroa Gutiérrez Gil - Artista Plástica',
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
      publishedTime: post.date,
      authors: ['Naroa Gutiérrez Gil'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
    alternates: {
      canonical: canonicalUrl,
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await getBlogPosts();
  const postIndex = posts.findIndex((p) => p.slug === slug);
  const post = posts[postIndex];

  if (!post) {
    notFound();
  }

  const prevPost = postIndex > 0 ? posts[postIndex - 1] : null;
  const nextPost = postIndex < posts.length - 1 ? posts[postIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden relative">
      <ReadingProgress />
      
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

      <main className="relative z-10 max-w-3xl mx-auto px-6 sm:px-12 pt-40 pb-32">
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

          <div className="relative aspect-[16/10] w-full mb-16 overflow-hidden rounded-sm group">
            <div className="absolute inset-0 bg-[#2B3BE5] mix-blend-overlay opacity-20 group-hover:opacity-0 transition-opacity duration-1000 z-10 pointer-events-none" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={post.image} 
              alt={post.title}
              className="object-cover w-full h-full grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-1000"
            />
          </div>

          <div className="prose prose-invert prose-lg max-w-none font-light leading-relaxed text-white/70">
            <p className="text-xl md:text-2xl text-white/90 font-serif leading-relaxed mb-12 pl-6 border-l-2 border-[#2B3BE5]">
              {post.excerpt}
            </p>
            <div 
              className="space-y-8 text-lg font-sans text-white/60 wp-content-renderer"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* C5-REAL: Omnichannel Action Panel */}
        <div className="mt-24 pt-12 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex gap-4">
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=https://naroagutierrezgil.com/blog/${slug}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/50 hover:text-[#2B3BE5] transition-colors border border-white/10 hover:border-[#2B3BE5] px-6 py-3 rounded-full"
            >
              Compartir en Facebook
            </a>
          </div>

          <div className="flex gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {prevPost && (
              <Link 
                href={`/blog/${prevPost.slug}`}
                className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors group/nav flex items-center gap-2"
              >
                <span className="group-hover/nav:-translate-x-1 transition-transform">←</span> Anterior
              </Link>
            )}
            {prevPost && nextPost && <span className="text-white/20">|</span>}
            {nextPost && (
              <Link 
                href={`/blog/${nextPost.slug}`}
                className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors group/nav flex items-center gap-2"
              >
                Siguiente <span className="group-hover/nav:translate-x-1 transition-transform">→</span>
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
