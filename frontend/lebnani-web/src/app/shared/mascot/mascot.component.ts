import { Component, Input } from '@angular/core';

type MascotMood =
  | 'neutral'
  | 'happy'
  | 'excited'
  | 'thinking'
  | 'wrong'
  | 'sleepy'
  | 'proud';

type MascotSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-mascot',
  standalone: true,
  template: `
    <div class="mascot-wrap" [class.with-message]="message">
      <div class="arzi" [attr.data-mood]="mood" [attr.data-size]="size" aria-label="Arzi, mascotte de Lebnani">
        <div class="arzi-star"></div>

        <div class="arzi-tree">
          <div class="arzi-layer arzi-layer-1"></div>
          <div class="arzi-layer arzi-layer-2"></div>
          <div class="arzi-layer arzi-layer-3"></div>
          <div class="arzi-face">
            <span class="eye eye-left"></span>
            <span class="eye eye-right"></span>
            <span class="mouth"></span>
          </div>
          <div class="arzi-scarf"></div>
        </div>

        <div class="arzi-trunk"></div>
        <div class="arzi-feet">
          <span></span>
          <span></span>
        </div>
      </div>

      @if (message) {
        <div class="mascot-message">
          {{ message }}
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .mascot-wrap {
      display: inline-flex;
      align-items: center;
      gap: 14px;
    }

    .mascot-wrap.with-message {
      align-items: flex-start;
    }

    .arzi {
      position: relative;
      width: 112px;
      height: 132px;
      flex: 0 0 auto;
      filter: drop-shadow(0 14px 18px rgba(31, 41, 51, 0.14));
    }

    .arzi[data-size="sm"] {
      width: 74px;
      height: 88px;
    }

    .arzi[data-size="lg"] {
      width: 148px;
      height: 174px;
    }

    .arzi-star {
      position: absolute;
      top: 0;
      right: 12%;
      width: 18%;
      aspect-ratio: 1;
      background: var(--gold, #f4b942);
      clip-path: polygon(
        50% 0%,
        61% 35%,
        98% 35%,
        68% 57%,
        79% 91%,
        50% 70%,
        21% 91%,
        32% 57%,
        2% 35%,
        39% 35%
      );
      transform: rotate(14deg);
    }

    .arzi-tree {
      position: absolute;
      left: 8%;
      right: 8%;
      top: 9%;
      height: 76%;
    }

    .arzi-layer {
      position: absolute;
      left: 50%;
      border-radius: 48% 48% 42% 42%;
      background: linear-gradient(135deg, var(--cedar-green, #1f5f43), #2f8b61);
      transform: translateX(-50%);
    }

    .arzi-layer::after {
      content: "";
      position: absolute;
      inset: 16% 22% auto auto;
      width: 18%;
      aspect-ratio: 1;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.22);
    }

    .arzi-layer-1 {
      top: 0;
      width: 54%;
      height: 34%;
      clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
    }

    .arzi-layer-2 {
      top: 22%;
      width: 78%;
      height: 38%;
      clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
    }

    .arzi-layer-3 {
      top: 47%;
      width: 100%;
      height: 42%;
      clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
    }

    .arzi-face {
      position: absolute;
      left: 50%;
      top: 48%;
      width: 48%;
      height: 30%;
      transform: translateX(-50%);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.94);
      box-shadow: inset 0 -3px 0 rgba(31, 41, 51, 0.06);
    }

    .eye {
      position: absolute;
      top: 34%;
      width: 13%;
      aspect-ratio: 1;
      border-radius: 50%;
      background: var(--text-main, #1f2933);
    }

    .eye-left {
      left: 28%;
    }

    .eye-right {
      right: 28%;
    }

    .mouth {
      position: absolute;
      left: 50%;
      bottom: 24%;
      width: 28%;
      height: 18%;
      border: 3px solid var(--text-main, #1f2933);
      border-top: 0;
      border-radius: 0 0 999px 999px;
      transform: translateX(-50%);
    }

    .arzi-scarf {
      position: absolute;
      left: 50%;
      bottom: 12%;
      width: 48%;
      height: 8%;
      border-radius: 999px;
      background: var(--lb-red, #d62828);
      transform: translateX(-50%) rotate(-4deg);
    }

    .arzi-trunk {
      position: absolute;
      left: 50%;
      bottom: 8%;
      width: 16%;
      height: 20%;
      border-radius: 8px;
      background: #8a5a35;
      transform: translateX(-50%);
    }

    .arzi-feet {
      position: absolute;
      left: 50%;
      bottom: 0;
      display: flex;
      gap: 10%;
      width: 42%;
      transform: translateX(-50%);
    }

    .arzi-feet span {
      width: 45%;
      height: 10px;
      border-radius: 999px;
      background: var(--cedar-green-dark, #143d2b);
    }

    .mascot-message {
      position: relative;
      max-width: 280px;
      padding: 14px 16px;
      border: 2px solid var(--border-soft, #e8ded0);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.94);
      box-shadow: var(--shadow-soft, 0 14px 35px rgba(31, 41, 51, 0.08));
      color: var(--text-main, #1f2933);
      font-weight: 800;
      line-height: 1.35;
    }

    .mascot-message::before {
      content: "";
      position: absolute;
      left: -10px;
      top: 28px;
      width: 18px;
      height: 18px;
      border-left: 2px solid var(--border-soft, #e8ded0);
      border-bottom: 2px solid var(--border-soft, #e8ded0);
      background: rgba(255, 255, 255, 0.94);
      transform: rotate(45deg);
    }

    .arzi[data-mood="excited"] {
      animation: bounce 1.1s ease-in-out infinite;
    }

    .arzi[data-mood="happy"] .mouth,
    .arzi[data-mood="proud"] .mouth {
      height: 20%;
    }

    .arzi[data-mood="thinking"] .mouth {
      width: 18%;
      height: 10%;
      border-top: 3px solid var(--text-main, #1f2933);
      border-radius: 999px;
    }

    .arzi[data-mood="wrong"] .arzi-scarf {
      background: var(--lb-red-dark, #a61f1f);
    }

    .arzi[data-mood="wrong"] .mouth {
      bottom: 18%;
      border-top: 3px solid var(--text-main, #1f2933);
      border-bottom: 0;
      border-radius: 999px 999px 0 0;
    }

    .arzi[data-mood="sleepy"] .eye {
      height: 3px;
      margin-top: 4px;
      border-radius: 999px;
    }

    .arzi[data-mood="proud"] .arzi-star {
      transform: rotate(14deg) scale(1.18);
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }

      50% {
        transform: translateY(-8px);
      }
    }

    @media (max-width: 640px) {
      .mascot-wrap {
        flex-direction: column;
        align-items: flex-start;
      }

      .mascot-message::before {
        left: 28px;
        top: -10px;
        border: 0;
        border-left: 2px solid var(--border-soft, #e8ded0);
        border-top: 2px solid var(--border-soft, #e8ded0);
      }
    }
  `]
})
export class MascotComponent {
  @Input() mood: MascotMood = 'happy';
  @Input() size: MascotSize = 'md';
  @Input() message = '';
}