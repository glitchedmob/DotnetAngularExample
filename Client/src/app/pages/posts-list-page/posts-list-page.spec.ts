import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from '../../app.routes';
import { buildComment, buildPost } from '../../testing/blog-test-helpers';
import { PostsListPage } from './posts-list-page';

describe('PostsListPage', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('renders posts returned by the api', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/posts', PostsListPage);

    const request = http.expectOne('/api/posts');
    expect(request.request.method).toBe('GET');
    request.flush([
      buildPost({
        id: 1,
        title: 'Older post',
        updatedAt: '2026-04-20T09:00:00Z',
      }),
      buildPost({
        id: 2,
        title: 'Newer post',
        updatedAt: '2026-04-21T12:00:00Z',
        comments: [buildComment({ id: 7, postId: 2 })],
      }),
    ]);

    await settle(harness);

    const headings = Array.from(harness.routeNativeElement!.querySelectorAll('h2')).map(
      (heading) => heading.textContent?.trim(),
    );

    expect(headings).toEqual(['Newer post', 'Older post']);
    expect(textContent(harness)).toContain('1 comments');
  });

  it('shows the empty state when there are no posts', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/posts', PostsListPage);

    http.expectOne('/api/posts').flush([]);
    await settle(harness);

    expect(textContent(harness)).toContain('No posts yet.');
  });

  it('lets the user retry after a failed load', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/posts', PostsListPage);

    http.expectOne('/api/posts').flush('Server error', {
      status: 500,
      statusText: 'Server Error',
    });
    await settle(harness);

    expect(textContent(harness)).toContain('Unable to load posts right now.');

    clickButton(harness.routeNativeElement!, 'Try again');

    const retryRequest = http.expectOne('/api/posts');
    expect(retryRequest.request.method).toBe('GET');
    retryRequest.flush([buildPost({ id: 5, title: 'Recovered post' })]);
    await settle(harness);

    expect(textContent(harness)).toContain('Recovered post');
  });
});

async function settle(harness: RouterTestingHarness) {
  await harness.fixture.whenStable();
  harness.detectChanges();
}

function clickButton(container: ParentNode, label: string) {
  const button = Array.from(container.querySelectorAll('button')).find(
    (candidate) => candidate.textContent?.trim() === label,
  );

  expect(button).toBeTruthy();
  (button as HTMLButtonElement).click();
}

function textContent(harness: RouterTestingHarness) {
  return harness.routeNativeElement?.textContent ?? '';
}
