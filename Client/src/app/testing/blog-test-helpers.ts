import { Comment, Post } from '../models/blog.models';

export function buildComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: overrides.id ?? 1,
    postId: overrides.postId ?? 1,
    authorName: overrides.authorName ?? 'Comment Author',
    body: overrides.body ?? 'Comment body',
    createdAt: overrides.createdAt ?? '2026-04-21T10:00:00Z',
    updatedAt: overrides.updatedAt ?? overrides.createdAt ?? '2026-04-21T10:00:00Z',
  };
}

export function buildPost(overrides: Partial<Post> = {}): Post {
  return {
    id: overrides.id ?? 1,
    title: overrides.title ?? 'Post title',
    content: overrides.content ?? 'Post content',
    createdAt: overrides.createdAt ?? '2026-04-21T09:00:00Z',
    updatedAt: overrides.updatedAt ?? overrides.createdAt ?? '2026-04-21T09:00:00Z',
    comments: overrides.comments ?? [],
  };
}
