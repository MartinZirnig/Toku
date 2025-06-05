import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

@Component({
  selector: 'app-formated-text',
  standalone: true,
  imports: [],
  templateUrl: './formated-text.component.html',
  styleUrl: './formated-text.component.scss'
})
export class FormatedTextComponent {
  private _text: string = '';
  htmlContent: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  @Input()
  set text(value: string) {
    this._text = value || '';
    this.updateHtml();
  }

  get text(): string {
    return this._text;
  }

  private async updateHtml() {
    const rawHtml = await marked.parse(this._text);
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }
}
