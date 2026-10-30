import Link from "next/link";
import { VineyardScene, seasonOf } from "@/components/illustration/VineyardScene";
import { Picture } from "@/components/ui/Picture";
import type { NewsPost } from "@/lib/schemas";
import { formatLongDate } from "./format";

export function NewsCard({ post }: { post: NewsPost }) {
  return (
    <li className="group relative grid gap-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
      <div className="relative aspect-[4/3] overflow-hidden rounded-(--radius-panel) bg-spras-svetla">
        <Picture
          photo={{ src: post.cover.src, alt: "" }}
          sizes="(min-width: 640px) 176px, 100vw"
          fallback={<VineyardScene season={seasonOf(post.date)} className="absolute inset-0 h-full w-full" />}
        />
      </div>
      <div>
        <p className="text-sm text-pivnica-makka">
          <time dateTime={post.date}>{formatLongDate(post.date)}</time>
        </p>
        <h3 className="mt-1 text-xl">
          <Link
            href={`/aktuality/${post.slug}`}
            className="underline-offset-4 group-hover:underline after:absolute after:inset-0"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 text-pivnica-makka">{post.excerpt}</p>
      </div>
    </li>
  );
}
