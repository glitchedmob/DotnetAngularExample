export interface Comment {
  id: number;
  postId: number;
  authorName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
}

export interface CreateCommentRequest {
  authorName: string;
  body: string;
}
