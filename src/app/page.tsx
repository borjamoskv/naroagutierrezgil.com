import HomeClient from '@/components/HomeClient';
import WordPressFeedServer from '@/components/WordPressFeedServer';
import { getBlogPosts } from '@/lib/blogData';

export const revalidate = 3600; // ISR: 1 hour

export default async function Page() {
  const posts = await getBlogPosts();

  return (
    <HomeClient feedChildren={<WordPressFeedServer posts={posts} />} />
  );
}
