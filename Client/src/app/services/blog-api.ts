import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Comment,
  CreateCommentRequest,
  CreatePostRequest,
  Post,
  UpdatePostRequest,
} from '../models/blog.models';

@Injectable({
  providedIn: 'root',
})
export class BlogApi {
  private readonly http = inject(HttpClient);
  private readonly postsUrl = '/api/posts';

  getPosts() {
    return this.http.get<Post[]>(this.postsUrl);
  }

  getPost(id: number) {
    return this.http.get<Post>(`${this.postsUrl}/${id}`);
  }

  createPost(payload: CreatePostRequest) {
    return this.http.post<Post>(this.postsUrl, payload);
  }

  updatePost(id: number, payload: UpdatePostRequest) {
    return this.http.put<Post>(`${this.postsUrl}/${id}`, payload);
  }

  deletePost(id: number) {
    return this.http.delete<void>(`${this.postsUrl}/${id}`);
  }

  createComment(postId: number, payload: CreateCommentRequest) {
    return this.http.post<Comment>(`${this.postsUrl}/${postId}/comments`, payload);
  }

  deleteComment(postId: number, commentId: number) {
    return this.http.delete<void>(`${this.postsUrl}/${postId}/comments/${commentId}`);
  }
}
