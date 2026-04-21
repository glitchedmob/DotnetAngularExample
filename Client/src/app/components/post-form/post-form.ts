import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreatePostRequest } from '../../models/blog.models';

export type PostFormValue = CreatePostRequest;

@Component({
  selector: 'app-post-form',
  imports: [ReactiveFormsModule],
  templateUrl: './post-form.html',
  styleUrl: './post-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostForm {
  readonly initialValue = input<PostFormValue | null>(null);
  readonly submitLabel = input('Save post');
  readonly busy = input(false);
  readonly submitted = output<PostFormValue>();

  private readonly formBuilder = new FormBuilder();

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    content: ['', [Validators.required]],
  });

  constructor() {
    effect(() => {
      const value = this.initialValue();

      this.form.reset({
        title: value?.title ?? '',
        content: value?.content ?? '',
      });
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.busy()) {
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }
}
