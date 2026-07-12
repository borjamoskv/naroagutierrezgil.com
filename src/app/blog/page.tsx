import { getBlogPosts } from '@/lib/blogData';
import BlogClient from './BlogClient';

export const revalidate = 3600; // ISR

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogClient initialPosts={posts} />;
}
