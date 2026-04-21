import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Comment, Post } from '../../models/blog.models';
import { BlogApi } from '../../services/blog-api';

@Component({
  selector: 'app-post-detail-page',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './post-detail-page.html',
  styleUrl: './post-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailPage implements OnInit {
  private readonly blogApi = inject(BlogApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = new FormBuilder();

  readonly postId = Number(this.route.snapshot.paramMap.get('id'));
  readonly isLoading = signal(true);
  readonly isSubmittingComment = signal(false);
  readonly isDeletingPost = signal(false);
  readonly isConfirmingPostDelete = signal(false);
  readonly deletingCommentId = signal<number | null>(null);
  readonly pendingCommentDeleteId = signal<number | null>(null);
  readonly errorMessage = signal('');
  readonly commentErrorMessage = signal('');
  readonly post = signal<Post | null>(null);
  readonly comments = computed(() =>
    [...(this.post()?.comments ?? [])].sort(
      (left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt),
    ),
  );
  readonly wasEdited = computed(() => {
    const post = this.post();

    if (!post) {
      return false;
    }

    return post.createdAt !== post.updatedAt;
  });

  readonly commentForm = this.formBuilder.nonNullable.group({
    authorName: ['', [Validators.required, Validators.maxLength(100)]],
    body: ['', [Validators.required]],
  });

  async ngOnInit() {
    await this.loadPost();
  }

  async loadPost() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const post = await firstValueFrom(this.blogApi.getPost(this.postId));
      this.post.set(post);
    } catch (error) {
      this.errorMessage.set(resolvePostErrorMessage(error));
      this.post.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  async submitComment() {
    this.commentForm.markAllAsTouched();

    if (this.commentForm.invalid || this.isSubmittingComment() || !this.post()) {
      return;
    }

    this.isSubmittingComment.set(true);
    this.commentErrorMessage.set('');

    try {
      const comment = await firstValueFrom(
        this.blogApi.createComment(this.postId, this.commentForm.getRawValue()),
      );

      this.post.update((post) => {
        if (!post) {
          return post;
        }

        return {
          ...post,
          comments: [...post.comments, comment],
        };
      });

      this.commentForm.reset({
        authorName: '',
        body: '',
      });
    } catch (error) {
      this.commentErrorMessage.set(resolveCommentErrorMessage(error));
    } finally {
      this.isSubmittingComment.set(false);
    }
  }

  startCommentDelete(commentId: number) {
    if (this.deletingCommentId()) {
      return;
    }

    this.commentErrorMessage.set('');
    this.pendingCommentDeleteId.set(commentId);
  }

  cancelCommentDelete() {
    if (this.deletingCommentId()) {
      return;
    }

    this.pendingCommentDeleteId.set(null);
  }

  async deleteComment(comment: Comment) {
    if (this.deletingCommentId() || this.pendingCommentDeleteId() !== comment.id) {
      return;
    }

    this.deletingCommentId.set(comment.id);
    this.commentErrorMessage.set('');

    try {
      await firstValueFrom(this.blogApi.deleteComment(this.postId, comment.id));
      this.post.update((post) => {
        if (!post) {
          return post;
        }

        return {
          ...post,
          comments: post.comments.filter((existingComment) => existingComment.id !== comment.id),
        };
      });
      this.pendingCommentDeleteId.set(null);
    } catch (error) {
      this.commentErrorMessage.set(resolveCommentErrorMessage(error));
    } finally {
      this.deletingCommentId.set(null);
    }
  }

  startPostDelete() {
    if (this.isDeletingPost()) {
      return;
    }

    this.errorMessage.set('');
    this.isConfirmingPostDelete.set(true);
  }

  cancelPostDelete() {
    if (this.isDeletingPost()) {
      return;
    }

    this.isConfirmingPostDelete.set(false);
  }

  async deletePost() {
    const post = this.post();

    if (!post || this.isDeletingPost() || !this.isConfirmingPostDelete()) {
      return;
    }

    this.isDeletingPost.set(true);
    this.errorMessage.set('');

    try {
      await firstValueFrom(this.blogApi.deletePost(this.postId));
      await this.router.navigate(['/posts']);
    } catch (error) {
      this.errorMessage.set(resolvePostErrorMessage(error));
    } finally {
      this.isConfirmingPostDelete.set(false);
      this.isDeletingPost.set(false);
    }
  }
}

function resolvePostErrorMessage(error: unknown) {
  if (error instanceof HttpErrorResponse && error.status === 404) {
    return 'The requested post could not be found.';
  }

  return 'Unable to load or update this post right now.';
}

function resolveCommentErrorMessage(error: unknown) {
  if (error instanceof HttpErrorResponse && error.status === 404) {
    return 'The requested post or comment could not be found.';
  }

  return 'Unable to save that comment right now.';
}
