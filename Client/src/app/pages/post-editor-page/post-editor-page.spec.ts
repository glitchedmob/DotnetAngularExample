import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from '../../app.routes';
import { buildPost } from '../../testing/blog-test-helpers';
import { PostEditorPage } from './post-editor-page';

describe('PostEditorPage', () => {
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

  it('creates a post from the new post route and navigates to the detail page', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/posts/new', PostEditorPage);
    await settle(harness);

    setFieldValue(harness.routeNativeElement!, 'input[name="title"]', 'New Angular Post');
    setFieldValue(harness.routeNativeElement!, 'textarea[name="content"]', 'Created through the editor');
    clickButton(harness.routeNativeElement!, 'Create post');

    const createRequest = http.expectOne('/api/posts');
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual({
      title: 'New Angular Post',
      content: 'Created through the editor',
    });

    createRequest.flush(
      buildPost({
        id: 15,
        title: 'New Angular Post',
        content: 'Created through the editor',
      }),
    );
    await settle(harness);

    http.expectOne('/api/posts/15').flush(
      buildPost({
        id: 15,
        title: 'New Angular Post',
        content: 'Created through the editor',
      }),
    );
    await settle(harness);

    expect(router.url).toBe('/posts/15');
    expect(textContent(harness)).toContain('New Angular Post');
  });

  it('loads an existing post for editing and saves changes', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/posts/4/edit', PostEditorPage);

    http.expectOne('/api/posts/4').flush(
      buildPost({
        id: 4,
        title: 'Original title',
        content: 'Original body',
      }),
    );
    await settle(harness);

    expect(getElement<HTMLInputElement>(harness.routeNativeElement!, 'input[name="title"]').value).toBe(
      'Original title',
    );

    setFieldValue(harness.routeNativeElement!, 'input[name="title"]', 'Updated title');
    setFieldValue(harness.routeNativeElement!, 'textarea[name="content"]', 'Updated body');
    clickButton(harness.routeNativeElement!, 'Save changes');

    const updateRequest = http.expectOne('/api/posts/4');
    expect(updateRequest.request.method).toBe('PUT');
    expect(updateRequest.request.body).toEqual({
      title: 'Updated title',
      content: 'Updated body',
    });
    updateRequest.flush(
      buildPost({
        id: 4,
        title: 'Updated title',
        content: 'Updated body',
      }),
    );
    await settle(harness);

    http.expectOne('/api/posts/4').flush(
      buildPost({
        id: 4,
        title: 'Updated title',
        content: 'Updated body',
      }),
    );
    await settle(harness);

    expect(router.url).toBe('/posts/4');
    expect(textContent(harness)).toContain('Updated title');
  });

  it('shows a not found message when an edit target does not exist', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/posts/404/edit', PostEditorPage);

    http.expectOne('/api/posts/404').flush('Not found', {
      status: 404,
      statusText: 'Not Found',
    });
    await settle(harness);

    expect(textContent(harness)).toContain('The requested post could not be found.');
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
