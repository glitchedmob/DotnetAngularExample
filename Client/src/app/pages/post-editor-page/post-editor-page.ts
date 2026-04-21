import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Post, UpdatePostRequest } from '../../models/blog.models';
import { BlogApi } from '../../services/blog-api';
import { PostForm, PostFormValue } from '../../components/post-form/post-form';

@Component({
  selector: 'app-post-editor-page',
  imports: [PostForm, RouterLink],
  templateUrl: './post-editor-page.html',
  styleUrl: './post-editor-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostEditorPage implements OnInit {
  private readonly blogApi = inject(BlogApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly postId = signal<number | null>(readPostId(this.route));
  readonly isEditMode = computed(() => this.postId() !== null);
  readonly isLoading = signal(this.isEditMode());
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly initialValue = signal<PostFormValue | null>(null);
  readonly pageTitle = computed(() => (this.isEditMode() ? 'Edit post' : 'New post'));
  readonly submitLabel = computed(() => (this.isEditMode() ? 'Save changes' : 'Create post'));

  async ngOnInit() {
    if (!this.isEditMode()) {
      this.isLoading.set(false);
      return;
    }

    await this.loadPost();
  }

  async savePost(value: PostFormValue) {
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      const savedPost = this.isEditMode()
        ? await firstValueFrom(
            this.blogApi.updatePost(this.postId()!, toUpdatePostRequest(value)),
          )
        : await firstValueFrom(this.blogApi.createPost(value));

      await this.router.navigate(['/posts', savedPost.id]);
    } catch (error) {
      this.errorMessage.set(resolveEditorErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private async loadPost() {
    const postId = this.postId();

    if (postId === null) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const post = await firstValueFrom(this.blogApi.getPost(postId));
      this.initialValue.set(toPostFormValue(post));
    } catch (error) {
      this.errorMessage.set(resolveEditorErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }
}

function readPostId(route: ActivatedRoute) {
  const value = route.snapshot.paramMap.get('id');

  if (value === null) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) ? parsedValue : null;
}

function toPostFormValue(post: Post): PostFormValue {
  return {
    title: post.title,
    content: post.content,
  };
}

function toUpdatePostRequest(value: PostFormValue): UpdatePostRequest {
  return {
    title: value.title,
    content: value.content,
  };
}

function resolveEditorErrorMessage(error: unknown) {
  if (error instanceof HttpErrorResponse && error.status === 404) {
    return 'The requested post could not be found.';
  }

  return 'Unable to save this post right now.';
}
