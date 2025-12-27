import Link from "next/link";
import { type Post } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  // Generate unique transition names based on the post's path
  const imageTransitionName = `blog-image-${post._meta.path}`;
  const titleTransitionName = `blog-title-${post._meta.path}`;
  const descriptionTransitionName = `blog-description-${post._meta.path}`;
  const dateTransitionName = `blog-date-${post._meta.path}`;

  return (
    <article className="group relative flex flex-col space-y-3">
      {post.image && (
        <Link href={`/blog/${post._meta.path}`}>
          <img
            src={post.image}
            alt={post.title}
            className="bg-muted mb-2 aspect-video rounded-md border object-cover transition-colors"
            loading="lazy"
            style={{ viewTransitionName: imageTransitionName }}
          />
        </Link>
      )}
      <h2
        className="text-xl font-semibold tracking-tight"
        style={{ viewTransitionName: titleTransitionName }}
      >
        <Link href={`/blog/${post._meta.path}`}>{post.title}</Link>
      </h2>
      {post.description && (
        <p
          className="text-muted-foreground"
          style={{ viewTransitionName: descriptionTransitionName }}
        >
          {post.description}
        </p>
      )}
      <time
        dateTime={post.date}
        className="text-muted-foreground text-sm"
        style={{ viewTransitionName: dateTransitionName }}
      >
        {formatDate(post.date)}
      </time>
    </article>
  );
}
