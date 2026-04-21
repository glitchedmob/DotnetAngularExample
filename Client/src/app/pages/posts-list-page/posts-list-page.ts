import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Post } from '../../models/blog.models';
import { BlogApi } from '../../services/blog-api';

@Component({
  selector: 'app-posts-list-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './posts-list-page.html',
  styleUrl: './posts-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsListPage implements OnInit {
  private readonly blogApi = inject(BlogApi);

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly posts = signal<Post[]>([]);
  readonly sortedPosts = computed(() =>
    [...this.posts()].sort(
      (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
    ),
  );

  async ngOnInit() {
    await this.loadPosts();
  }

  async loadPosts() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const posts = await firstValueFrom(this.blogApi.getPosts());
      this.posts.set(posts);
    } catch {
      this.errorMessage.set('Unable to load posts right now.');
    } finally {
      this.isLoading.set(false);
    }
  }

  previewContent(content: string) {
    return content.length <= 180 ? content : `${content.slice(0, 177).trimEnd()}...`;
  }
}
