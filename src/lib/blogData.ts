export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  content: string;
  image: string;
}

const decodeHtml = (html: string) => {
  return html
    .replace(/&#8211;/g, '-')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');
};

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch('https://public-api.wordpress.com/rest/v1.1/sites/naroagutierrez.wordpress.com/posts?number=20', {
      next: { revalidate: 3600 } // ISR: Revalidar cada hora
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.status}`);
    }
    
    const data: any = await res.json();
    
    if (!data || !data.posts) {
      return [];
    }

    return data.posts.map((post: any) => {
      // Extract first category or default
      const categoriesList = Object.keys(post.categories || {});
      const category = categoriesList.length > 0 ? categoriesList[0] : 'Diario';
      
      // Extract tags
      const tags = Object.keys(post.tags || {}).slice(0, 4); // Max 4 tags
      
      // Fallback image if no featured_image
      let image = post.featured_image;
      if (!image) {
         // try to extract from attachments or use a generic one
         const attachments = Object.values(post.attachments || {});
         if (attachments.length > 0) {
            image = (attachments[0] as any).URL;
         } else {
            image = 'https://naroagutierrez.wordpress.com/wp-content/uploads/2026/05/whatsapp-image-2026-05-27-at-15.00.32.jpeg';
         }
      }

      // Clean excerpt
      let rawExcerpt = (post.excerpt || '').replace(/<[^>]+>/g, '').trim();
      rawExcerpt = decodeHtml(rawExcerpt);

      return {
        slug: post.slug,
        title: decodeHtml(post.title),
        date: new Date(post.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        category,
        tags,
        excerpt: rawExcerpt ? (rawExcerpt.substring(0, 160) + '...') : 'Reflexiones desde el taller...',
        content: post.content, // HTML content directly from WP
        image
      };
    });
  } catch (error) {
    console.error('Error fetching WP posts:', error);
    return [];
  }
}
