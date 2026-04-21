import { Routes } from '@angular/router';

import { PostDetailPage } from './pages/post-detail-page/post-detail-page';
import { PostEditorPage } from './pages/post-editor-page/post-editor-page';
import { PostsListPage } from './pages/posts-list-page/posts-list-page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'posts',
  },
  {
    path: 'posts',
    children: [
      {
        path: '',
        component: PostsListPage,
      },
      {
        path: 'new',
        component: PostEditorPage,
      },
      {
        path: ':id/edit',
        component: PostEditorPage,
      },
      {
        path: ':id',
        component: PostDetailPage,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'posts',
  },
];
