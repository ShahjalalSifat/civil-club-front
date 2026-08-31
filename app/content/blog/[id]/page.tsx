'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getBlogById, BlogPost } from '@/lib/db';
import { ChevronLeft, Calendar, Clock, User, Tag, Share2, Check, ArrowLeft, BookOpen } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      if (typeof id === 'string') {
        try {
          const data = await getBlogById(id);
          setPost(data);
        } catch (err) {
          console.error('Error fetching blog post from database:', err);
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 pt-36 pb-24 text-center">
        <div className="inline-block animate-spin w-10 h-10 border-4 border-info-light border-t-transparent rounded-full mb-4" />
        <p className="text-base font-semibold">Retrieving article from backend database...</p>
        <p className="text-xs text-primary-light/60 dark:text-primary/60 mt-1">Please hold on a moment</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-6 pt-36 pb-24 text-center">
        <div className="glass-card max-w-md mx-auto p-8 rounded-3xl">
          <BookOpen className="w-12 h-12 text-info-light mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-3">Article Not Found</h2>
          <p className="text-primary-light/60 dark:text-primary/60 mb-6 text-sm">
            The requested article may have been unpublished or the slug has changed in the backend database.
          </p>
          <button onClick={() => router.push('/content/blog')} className="btn-secondary text-sm inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Blog Stories
          </button>
        </div>
      </div>
    );
  }

  const dStr = post.createdAt || post.publishedAt
    ? new Date(post.createdAt || post.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) 
    : 'Recent Publication';

  const postImage = post.coverImageUrl || post.imageUrl || `https://picsum.photos/seed/${post.id}/1200/675`;
  const postContent = post.bodyRichText || post.contentMarkdown || post.description || post.content || '';
  const isHtml = /<[a-z][\s\S]*>/i.test(postContent);

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-4xl pt-32 pb-24">
      {/* Top navigation & share */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <button 
          onClick={() => router.push('/content/blog')} 
          className="inline-flex items-center gap-2 text-primary-light/70 hover:text-info-light dark:text-primary/70 dark:hover:text-info-light transition-colors font-semibold text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to All Stories
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass text-xs font-semibold hover:border-info-light/50 transition-all shadow-sm"
          title="Copy link to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-bold">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Article</span>
            </>
          )}
        </button>
      </div>

      {/* Badges and metadata */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-info-light mb-4">
        {post.category && (
          <span className="px-3 py-1 rounded-full bg-info-light text-white font-bold text-xs shadow-md shadow-info-light/20">
            {post.category}
          </span>
        )}

        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>{dStr}</span>
        </span>

        {post.author && (
          <span className="flex items-center gap-1.5 text-primary-light/70 dark:text-primary/70">
            <User className="w-4 h-4" />
            <span>{post.author}</span>
          </span>
        )}

        {post.readTimeMinutes && (
          <span className="flex items-center gap-1.5 text-primary-light/60 dark:text-primary/60">
            <Clock className="w-4 h-4" />
            <span>{post.readTimeMinutes} min read</span>
          </span>
        )}
      </div>

      {/* Article Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 leading-[1.2] text-primary-light dark:text-primary">
        {post.title}
      </h1>

      {/* Author Section */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-black/5 dark:border-white/10">
        {post.authorImageUrl ? (
          <img 
            src={post.authorImageUrl} 
            alt={post.authorName || post.author || 'Author'} 
            className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-sm"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center font-bold text-sm shrink-0">
            {(post.authorName || post.author || "CE").slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {post.authorName || post.author || "CE Club HSTU"}
          </p>
          {post.authorRole && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{post.authorRole}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag, tIdx) => (
            <span 
              key={tIdx} 
              className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-info-light font-medium flex items-center gap-1"
            >
              <Tag className="w-3 h-3" /> {tag}
            </span>
          ))}
        </div>
      )}

      {/* 16:9 Cover Image */}
      <div className="relative w-full aspect-video rounded-[28px] overflow-hidden mb-12 shadow-2xl bg-slate-900 border border-white/20">
        <Image
          src={postImage}
          alt={post.title}
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
          priority
          unoptimized={typeof postImage === 'string' && postImage.startsWith('http')}
        />
      </div>

      {/* Content Renderer (HTML from Tiptap / CMS or Markdown) */}
      {isHtml ? (
        <div 
          className="markdown-body prose prose-lg dark:prose-invert max-w-none prose-a:text-info-light leading-relaxed break-words"
          dangerouslySetInnerHTML={{ __html: postContent }}
        />
      ) : (
        <div className="markdown-body prose prose-lg dark:prose-invert max-w-none prose-a:text-info-light leading-relaxed break-words">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-light dark:text-primary mt-8 mb-4 tracking-tight">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl sm:text-2xl font-bold text-primary-light dark:text-primary mt-7 mb-3 tracking-tight border-b border-white/10 pb-2">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg sm:text-xl font-bold text-primary-light dark:text-primary mt-6 mb-2 tracking-tight">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="my-4 leading-relaxed text-slate-700 dark:text-slate-300">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 my-4 space-y-2 text-slate-700 dark:text-slate-300 marker:text-info-light">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 my-4 space-y-2 text-slate-700 dark:text-slate-300 marker:text-info-light font-medium">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed pl-1">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-info-light pl-4 py-1 my-5 italic text-slate-600 dark:text-slate-400 bg-blue-500/5 rounded-r-xl">{children}</blockquote>
              ),
              hr: () => (
                <hr className="my-8 border-t border-white/15 dark:border-white/10" />
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-8 rounded-2xl border border-white/20 dark:border-white/10 glass shadow-lg">
                  <table className="w-full text-left text-sm sm:text-base border-collapse my-0">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-blue-600/15 dark:bg-blue-900/30 border-b border-white/20 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary-light dark:text-primary">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="px-5 py-3.5 font-bold border-b border-white/20 text-slate-800 dark:text-slate-100">{children}</th>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-white/10">{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-white/[0.04] transition-colors">{children}</tr>
              ),
              td: ({ children }) => (
                <td className="px-5 py-3.5 border-b border-white/10 text-slate-700 dark:text-slate-300 font-normal">{children}</td>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="px-1.5 py-0.5 rounded-lg bg-blue-500/10 text-info-light font-mono text-sm border border-blue-400/20">
                    {children}
                  </code>
                ) : (
                  <pre className="p-4 my-4 rounded-2xl bg-slate-900/90 text-slate-100 overflow-x-auto border border-white/10 font-mono text-sm">
                    <code>{children}</code>
                  </pre>
                );
              },
            }}
          >
            {postContent}
          </Markdown>
        </div>
      )}

      {/* Bottom Back Button */}
      <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between">
        <button 
          onClick={() => router.push('/content/blog')} 
          className="btn-secondary text-sm inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Articles
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl glass text-xs font-semibold hover:border-info-light/50 transition-all"
        >
          <Share2 className="w-4 h-4 text-info-light" />
          <span>{copied ? 'Copied' : 'Share Story'}</span>
        </button>
      </div>
    </div>
  );
}
