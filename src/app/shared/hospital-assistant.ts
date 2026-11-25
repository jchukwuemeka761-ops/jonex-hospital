import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {
  ASSISTANT_SUGGESTED_QUESTIONS,
  AssistantMessage,
} from '../core/hospital-assistant.logic';
import {HOSPITAL_PROFILE} from '../core/hospital-data';

@Component({
  selector: 'app-hospital-assistant',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule, RouterLink],
  template: `
    <aside
      class="fixed bottom-4 right-3 sm:bottom-5 sm:right-5 z-40 max-w-[calc(100vw-1.5rem)]"
      aria-label="Jonex Hospital AI Assistant"
    >
      @if (isOpen()) {
        <section
          class="w-[min(calc(100vw-1.5rem),25rem)] max-h-[min(78vh,36rem)] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden"
          role="dialog"
          aria-label="Ask Jonex Hospital Assistant"
        >
          <!-- Header -->
          <header class="bg-[#0F2942] text-white px-4 py-3.5 flex items-center justify-between gap-3 shrink-0">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-teal-600/30 border border-teal-400/30 flex items-center justify-center shrink-0">
                <mat-icon class="!text-[18px] !w-[18px] !h-[18px] text-teal-200">support_agent</mat-icon>
              </div>
              <div class="min-w-0">
                <h2 class="font-display text-sm font-bold leading-tight truncate">
                  Jonex Hospital Assistant
                </h2>
                <p class="text-[11px] text-teal-200 truncate">
                  Services, hours, fees &amp; appointments
                </p>
              </div>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              @if (messages().length > 0) {
                <button
                  type="button"
                  (click)="resetChat()"
                  aria-label="Clear conversation"
                  title="Clear conversation"
                  class="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 inline-flex items-center justify-center transition-colors"
                >
                  <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">refresh</mat-icon>
                </button>
              }
              <button
                type="button"
                (click)="toggleOpen()"
                aria-label="Close hospital assistant"
                class="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 inline-flex items-center justify-center transition-colors"
              >
                <mat-icon class="!text-[17px] !w-[17px] !h-[17px]">close</mat-icon>
              </button>
            </div>
          </header>

          <!-- Scrollable Conversation Body -->
          <div
            #scrollContainer
            class="flex-1 overflow-y-auto px-4 py-3.5 space-y-3 bg-slate-50"
          >
            <!-- Grounded Welcome Card -->
            <div class="rounded-xl bg-white border border-slate-200 p-3.5 text-xs text-slate-700 leading-relaxed space-y-2">
              <p class="font-semibold text-[#0F2942]">
                Ask me anything about Jonex Hospital (Ogbor Hill, Aba):
              </p>
              <p>
                I can answer questions about clinical services, fee estimates, doctor schedules, 24/7 opening hours, Igbo/English care, or how to book and manage an appointment.
              </p>
            </div>

            <!-- Suggested Quick Questions (shown before first user question) -->
            @if (messages().length === 0) {
              <div class="space-y-1.5" aria-label="Suggested hospital questions">
                <p class="text-[11px] font-semibold text-slate-500 px-0.5">
                  Common Questions
                </p>
                <div class="flex flex-col gap-1.5">
                  @for (prompt of suggestedQuestions; track prompt) {
                    <button
                      type="button"
                      [disabled]="isLoading()"
                      (click)="askSuggested(prompt)"
                      class="text-left text-xs font-medium text-[#0F2942] bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-600 rounded-lg px-3 py-2 transition-colors flex items-center justify-between gap-2"
                    >
                      <span>{{ prompt }}</span>
                      <mat-icon class="!text-[15px] !w-[15px] !h-[15px] text-teal-700 shrink-0">arrow_forward</mat-icon>
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Message Thread -->
            @for (msg of messages(); track $index) {
              <div
                class="flex"
                [class]="msg.role === 'user' ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line"
                  [class]="msg.role === 'user'
                    ? 'bg-[#0F2942] text-white'
                    : 'bg-white text-slate-800 border border-slate-200'"
                >
                  {{ msg.text }}
                </div>
              </div>
            }

            @if (isLoading()) {
              <div class="flex justify-start">
                <div class="rounded-xl px-3.5 py-2.5 text-xs text-slate-600 bg-white border border-slate-200 inline-flex items-center gap-2">
                  <mat-icon class="!text-[15px] !w-[15px] !h-[15px] animate-spin text-teal-700">progress_activity</mat-icon>
                  <span>Checking hospital schedule &amp; details…</span>
                </div>
              </div>
            }

            @if (errorMessage()) {
              <div
                role="alert"
                class="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 space-y-2"
              >
                <p>{{ errorMessage() }}</p>
                @if (lastFailedQuestion()) {
                  <button
                    type="button"
                    (click)="retryLastQuestion()"
                    class="inline-flex items-center gap-1 text-xs font-semibold text-[#0F2942] underline underline-offset-2"
                  >
                    <mat-icon class="!text-[14px] !w-[14px] !h-[14px]">refresh</mat-icon>
                    <span>Try again</span>
                  </button>
                }
              </div>
            }
          </div>

          <!-- Action Links Bar -->
          <div class="px-4 py-2 bg-white border-t border-slate-200 flex items-center justify-between gap-2 text-[11px] shrink-0">
            <a
              routerLink="/appointments"
              (click)="toggleOpen()"
              class="inline-flex items-center gap-1 font-semibold text-teal-800 hover:text-[#0F2942]"
            >
              <mat-icon class="!text-[14px] !w-[14px] !h-[14px]">calendar_month</mat-icon>
              <span>Book Appointment</span>
            </a>
            <a
              [href]="hospital.phoneHref"
              class="inline-flex items-center gap-1 font-mono font-semibold text-slate-600 hover:text-[#0F2942] tabular-nums"
            >
              <mat-icon class="!text-[14px] !w-[14px] !h-[14px]">call</mat-icon>
              <span>{{ hospital.phoneDisplay }}</span>
            </a>
          </div>

          <!-- Input Form (Reactive Forms) -->
          <form
            [formGroup]="chatForm"
            (ngSubmit)="onSubmit()"
            class="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <label for="hospitalAssistantInput" class="sr-only">
              Ask a question about Jonex Hospital services, hours, or appointments
            </label>
            <input
              id="hospitalAssistantInput"
              type="text"
              formControlName="question"
              placeholder="Ask about services, hours, booking…"
              autocomplete="off"
              class="flex-1 min-w-0 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
            />
            <button
              type="submit"
              [disabled]="isLoading() || chatForm.invalid"
              aria-label="Send question"
              class="h-9 px-3.5 rounded-lg bg-[#0F2942] hover:bg-teal-800 disabled:bg-slate-300 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors shrink-0"
            >
              <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">send</mat-icon>
            </button>
          </form>
        </section>
      } @else {
        <button
          type="button"
          (click)="toggleOpen()"
          aria-label="Open Jonex Hospital AI Q&A Assistant"
          class="group rounded-xl bg-[#0F2942] hover:bg-teal-800 text-white px-4 py-2.5 border border-white/25 shadow-lg flex items-center gap-3 transition-colors"
        >
          <span class="w-8 h-8 rounded-lg bg-teal-600/35 border border-teal-300/30 flex items-center justify-center shrink-0">
            <mat-icon class="!text-[19px] !w-[19px] !h-[19px] text-teal-200">support_agent</mat-icon>
          </span>
          <span class="text-left">
            <span class="block font-display text-xs sm:text-sm font-bold leading-tight">
              Ask Jonex Care AI
            </span>
            <span class="block text-[11px] text-teal-200 leading-tight mt-0.5">
              Services, hours &amp; appointments
            </span>
          </span>
          <mat-icon class="!text-[17px] !w-[17px] !h-[17px] text-teal-200 group-hover:translate-x-0.5 transition-transform">
            chat
          </mat-icon>
        </button>
      }
    </aside>
  `,
})
export class HospitalAssistant {
  private readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  readonly hospital = HOSPITAL_PROFILE;
  readonly suggestedQuestions = ASSISTANT_SUGGESTED_QUESTIONS;

  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly lastFailedQuestion = signal<string | null>(null);
  readonly messages = signal<readonly AssistantMessage[]>([]);

  readonly chatForm = new FormGroup({
    question: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(1200)],
    }),
  });

  toggleOpen(): void {
    this.isOpen.update((open) => !open);
    if (this.isOpen()) {
      this.scrollToBottom();
    }
  }

  resetChat(): void {
    this.messages.set([]);
    this.errorMessage.set(null);
    this.lastFailedQuestion.set(null);
    this.chatForm.reset();
  }

  askSuggested(prompt: string): void {
    if (this.isLoading()) {
      return;
    }
    void this.sendQuestion(prompt);
  }

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }
    const raw = this.chatForm.controls.question.value.trim();
    if (!raw) {
      return;
    }
    this.chatForm.reset();
    void this.sendQuestion(raw);
  }

  retryLastQuestion(): void {
    const last = this.lastFailedQuestion();
    if (!last || this.isLoading()) {
      return;
    }
    void this.sendQuestion(last, true);
  }

  private async sendQuestion(question: string, isRetry = false): Promise<void> {
    this.errorMessage.set(null);
    this.lastFailedQuestion.set(null);

    const priorHistory = this.messages();
    if (!isRetry) {
      this.messages.set([...priorHistory, {role: 'user', text: question}]);
    }
    this.isLoading.set(true);
    this.scrollToBottom();

    try {
      const response = await fetch('/api/hospital-assistant', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          message: question,
          history: isRetry ? priorHistory.slice(0, -1) : priorHistory,
        }),
      });

      const payload = (await response.json()) as {reply?: string; error?: string};

      if (!response.ok || !payload.reply) {
        this.errorMessage.set(
          payload.error ||
            'Unable to retrieve an answer right now. Please try again or call +234 807 801 6691.',
        );
        this.lastFailedQuestion.set(question);
        return;
      }

      this.messages.update((current) => [
        ...current,
        {role: 'assistant', text: payload.reply!},
      ]);
      this.scrollToBottom();
    } catch {
      this.errorMessage.set(
        'Network interruption while reaching the Jonex Hospital Assistant. Please try again or call +234 807 801 6691.',
      );
      this.lastFailedQuestion.set(question);
    } finally {
      this.isLoading.set(false);
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scrollContainer()?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 30);
  }
}
