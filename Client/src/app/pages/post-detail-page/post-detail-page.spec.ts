import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from '../../app.routes';
import { buildComment, buildPost } from '../../testing/blog-test-helpers';
import { PostDetailPage } from './post-detail-page';

describe('PostDetailPage', () => {
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads and renders the requested post', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/posts/7', PostDetailPage);

    http.expectOne('/api/posts/7').flush(
      buildPost({
        id: 7,
        title: 'Integration testing in Angular',
        content: 'Rendered post body',
        updatedAt: '2026-04-21T11:00:00Z',
        comments: [buildComment({ id: 2, postId: 7, authorName: 'Levi', body: 'Nice post' })],
      }),
    );
    await settle(harness);

    expect(textContent(harness)).toContain('Integration testing in Angular');
    expect(textContent(harness)).toContain('Rendered post body');
    expect(textContent(harness)).toContain('Levi');
    expect(textContent(harness)).toContain('Edited');
  });

  it('shows a not found message when the post does not exist', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/posts/404', PostDetailPage);

    http.expectOne('/api/posts/404').flush('Not found', {
      status: 404,
      statusText: 'Not Found',
    });
    await settle(harness);

    expect(textContent(harness)).toContain('The requested post could not be found.');
  });

  it('submits a new comment and updates the rendered comment list', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/posts/7', PostDetailPage);

    http.expectOne('/api/posts/7').flush(buildPost({ id: 7, comments: [] }));
    await settle(harness);

    setFieldValue(harness.routeNativeElement!, 'input[name="authorName"]', 'Taylor');
    setFieldValue(harness.routeNativeElement!, 'textarea[name="body"]', 'Great write-up');
    clickButton(harness.routeNativeElement!, 'Add comment');

    const request = http.expectOne('/api/posts/7/comments');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      authorName: 'Taylor',
      body: 'Great write-up',
    });
    request.flush(
      buildComment({
        id: 9,
        postId: 7,
        authorName: 'Taylor',
        body: 'Great write-up',
      }),
    );
    await settle(harness);

    expect(textContent(harness)).toContain('Taylor');
    expect(textContent(harness)).toContain('Great write-up');
    expect(getElement<HTMLInputElement>(harness.routeNativeElement!, 'input[name="authorName"]').value).toBe('');
    expect(getElement<HTMLTextAreaElement>(harness.routeNativeElement!, 'textarea[name="body"]').value).toBe('');
  });

  it('requires inline confirmation before deleting a comment', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/posts/7', PostDetailPage);

    http.expectOne('/api/posts/7').flush(
      buildPost({
        id: 7,
        comments: [buildComment({ id: 12, postId: 7, authorName: 'Morgan', body: 'Delete me' })],
      }),
    );
    await settle(harness);

    const commentArticle = getArticle(harness.routeNativeElement!, 'Morgan');
    clickButton(commentArticle, 'Delete comment');
    harness.detectChanges();

    expect(http.match('/api/posts/7/comments/12').length).toBe(0);
    expect(commentArticle.textContent).toContain('Click confirm delete to remove this comment.');

    clickButton(commentArticle, 'Confirm delete');

    const request = http.expectOne('/api/posts/7/comments/12');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    await settle(harness);

    expect(textContent(harness)).not.toContain('Delete me');
  });

  it('requires inline confirmation before deleting a post and returns to the list', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/posts/7', PostDetailPage);

    http.expectOne('/api/posts/7').flush(
      buildPost({
        id: 7,
        title: 'Delete this post',
      }),
    );
    await settle(harness);

    clickButton(harness.routeNativeElement!, 'Delete post');
    harness.detectChanges();

    expect(http.match('/api/posts/7').length).toBe(0);
    expect(textContent(harness)).toContain('Click confirm delete to remove this post.');

    clickButton(harness.routeNativeElement!, 'Confirm delete');

    const deleteRequest = http.expectOne('/api/posts/7');
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);
    await harness.fixture.whenStable();

    const listRequest = http.expectOne('/api/posts');
    expect(listRequest.request.method).toBe('GET');
    listRequest.flush([]);
    await settle(harness);

    expect(router.url).toBe('/posts');
    expect(textContent(harness)).toContain('No posts yet.');
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

function getArticle(container: ParentNode, text: string) {
  const article = Array.from(container.querySelectorAll('article')).find((candidate) =>
    candidate.textContent?.includes(text),
  );

  expect(article).toBeTruthy();
  return article as HTMLElement;
}

function getElement<T extends Element>(container: ParentNode, selector: string) {
  const element = container.querySelector(selector);

  expect(element).toBeTruthy();
  return element as T;
}

function setFieldValue(container: ParentNode, selector: string, value: string) {
  const element = getElement<HTMLInputElement | HTMLTextAreaElement>(container, selector);
  element.value = value;
  element.dispatchEvent(new Event('input'));
}

function textContent(harness: RouterTestingHarness) {
  return harness.routeNativeElement?.textContent ?? '';
}
