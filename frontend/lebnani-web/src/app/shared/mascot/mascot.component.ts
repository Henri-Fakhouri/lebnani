import { Component, Input } from '@angular/core';

export type MascotMood =
  | 'neutral'
  | 'happy'
  | 'celebrate'
  | 'thinking'
  | 'sad'
  | 'encouraging'
  | 'proud'
  | 'sleepy'
  | 'wrong'
  | 'excited';

type MascotSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-mascot',
  standalone: true,
  template: `
    <div class="mascot-wrap" [class.with-message]="message">
      <div
        class="arzi"
        [attr.data-mood]="resolvedMood"
        [attr.data-size]="size"
        aria-label="Arzi, mascotte de Lebnani"
      >
        <div class="arzi-star"></div>
        <div class="arzi-shadow"></div>

        <div class="arzi-tree">
          <div class="arzi-tier arzi-tier-1"></div>
          <div class="arzi-tier arzi-tier-2"></div>
          <div class="arzi-tier arzi-tier-3"></div>
          <div class="arzi-tier arzi-tier-4"></div>

          <div class="arzi-face-shell">
            <span class="arzi-blush arzi-blush-left"></span>
            <span class="arzi-blush arzi-blush-right"></span>
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
      --tree-main: var(--cedar-green, #1f5f43);
      --tree-dark: var(--cedar-green-dark, #143d2b);
      --tree-light: #2f8b61;
      position: relative;
      width: 118px;
      height: 136px;
      flex: 0 0 auto;
      transform-origin: center bottom;
      filter: drop-shadow(0 14px 18px rgba(31, 41, 51, 0.12));
    }

    .arzi[data-size="sm"] {
      width: 76px;
      height: 88px;
    }

    .arzi[data-size="lg"] {
      width: 154px;
      height: 178px;
    }

    .arzi-shadow {
      position: absolute;
      left: 50%;
      bottom: 10px;
      width: 46%;
      height: 10px;
      border-radius: 999px;
      background: rgba(31, 41, 51, 0.12);
      transform: translateX(-50%);
      filter: blur(1px);
    }

    .arzi-star {
      position: absolute;
      top: 4px;
      right: 12%;
      width: 14%;
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
      opacity: 0.95;
    }

    .arzi-tree {
      position: absolute;
      left: 7%;
      right: 7%;
      top: 6%;
      height: 76%;
    }

    .arzi-tier {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(180deg, var(--tree-light), var(--tree-main));
      box-shadow: inset 0 -4px 0 rgba(20, 61, 43, 0.22);
    }

    .arzi-tier::after {
      content: "";
      position: absolute;
      inset: 0;
      opacity: 0.22;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.24), transparent 55%);
      clip-path: inherit;
      pointer-events: none;
    }

    .arzi-tier-1 {
      top: 2%;
      width: 30%;
      height: 20%;
      clip-path: polygon(
        50% 0%,
        60% 14%,
        70% 32%,
        84% 56%,
        100% 80%,
        74% 80%,
        64% 100%,
        36% 100%,
        26% 80%,
        0% 80%,
        16% 56%,
        30% 32%,
        40% 14%
      );
    }

    .arzi-tier-2 {
      top: 16%;
      width: 54%;
      height: 22%;
      clip-path: polygon(
        50% 0%,
        61% 10%,
        72% 24%,
        86% 42%,
        100% 58%,
        82% 60%,
        72% 76%,
        92% 84%,
        100% 96%,
        74% 90%,
        60% 100%,
        40% 100%,
        26% 90%,
        0% 96%,
        8% 84%,
        28% 76%,
        18% 60%,
        0% 58%,
        14% 42%,
        28% 24%,
        39% 10%
      );
    }

    .arzi-tier-3 {
      top: 31%;
      width: 74%;
      height: 24%;
      clip-path: polygon(
        50% 0%,
        60% 8%,
        72% 20%,
        86% 34%,
        100% 50%,
        84% 52%,
        74% 66%,
        94% 74%,
        100% 90%,
        76% 84%,
        62% 100%,
        38% 100%,
        24% 84%,
        0% 90%,
        6% 74%,
        26% 66%,
        16% 52%,
        0% 50%,
        14% 34%,
        28% 20%,
        40% 8%
      );
    }

    .arzi-tier-4 {
      top: 49%;
      width: 100%;
      height: 28%;
      clip-path: polygon(
        50% 0%,
        59% 8%,
        72% 18%,
        86% 30%,
        100% 46%,
        86% 48%,
        78% 60%,
        96% 68%,
        100% 84%,
        82% 80%,
        72% 100%,
        28% 100%,
        18% 80%,
        0% 84%,
        4% 68%,
        22% 60%,
        14% 48%,
        0% 46%,
        14% 30%,
        28% 18%,
        41% 8%
      );
    }

    .arzi-face-shell {
      position: absolute;
      left: 50%;
      top: 42%;
      width: 33%;
      height: 25%;
      transform: translateX(-50%);
      border-radius: 48% 48% 44% 44%;
      background: #fff8ef;
      box-shadow:
        inset 0 -3px 0 rgba(31, 41, 51, 0.07),
        0 1px 0 rgba(255, 255, 255, 0.5);
      z-index: 2;
    }

    .eye {
      position: absolute;
      top: 34%;
      width: 10%;
      height: 10%;
      border-radius: 50%;
      background: var(--text-main, #1f2933);
    }

    .eye-left {
      left: 28%;
    }

    .eye-right {
      right: 28%;
    }

    .arzi-blush {
      position: absolute;
      top: 52%;
      width: 14%;
      height: 10%;
      border-radius: 999px;
      background: rgba(214, 40, 40, 0.3);
    }

    .arzi-blush-left {
      left: 12%;
    }

    .arzi-blush-right {
      right: 12%;
    }

    .mouth {
      position: absolute;
      left: 50%;
      bottom: 22%;
      width: 24%;
      height: 14%;
      border: 2px solid var(--text-main, #1f2933);
      border-top: 0;
      border-radius: 0 0 999px 999px;
      transform: translateX(-50%);
    }

    .arzi-scarf {
      position: absolute;
      left: 50%;
      bottom: 3%;
      width: 28%;
      height: 8%;
      border-radius: 999px;
      background: linear-gradient(180deg, #ef4747, var(--lb-red, #d62828));
      transform: translateX(-50%);
      box-shadow: 0 2px 0 rgba(166, 31, 31, 0.22);
      z-index: 3;
    }

    .arzi-scarf::after {
      content: "";
      position: absolute;
      right: 10%;
      top: 46%;
      width: 22%;
      height: 85%;
      border-radius: 0 0 8px 8px;
      background: var(--lb-red, #d62828);
      transform: rotate(10deg) translateY(10%);
      transform-origin: top center;
    }

    .arzi-trunk {
      position: absolute;
      left: 50%;
      bottom: 11%;
      width: 16%;
      height: 20%;
      border-radius: 0 0 8px 8px;
      background: linear-gradient(180deg, #8c5b36, #6f4427);
      transform: translateX(-50%);
      box-shadow: inset -3px 0 0 rgba(0, 0, 0, 0.08);
    }

    .arzi-feet {
      position: absolute;
      left: 50%;
      bottom: 2%;
      display: flex;
      justify-content: space-between;
      width: 26%;
      transform: translateX(-50%);
    }

    .arzi-feet span {
      width: 36%;
      height: 8px;
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

    .arzi[data-mood="celebrate"],
    .arzi[data-mood="excited"] {
      animation: bounce 1.1s ease-in-out infinite;
    }

    .arzi[data-mood="happy"] .mouth,
    .arzi[data-mood="proud"] .mouth,
    .arzi[data-mood="encouraging"] .mouth,
    .arzi[data-mood="celebrate"] .mouth,
    .arzi[data-mood="excited"] .mouth {
      width: 28%;
      height: 18%;
      bottom: 20%;
    }

    .arzi[data-mood="thinking"] .mouth {
      width: 16%;
      height: 0;
      bottom: 24%;
      border: 0;
      border-top: 2px solid var(--text-main, #1f2933);
      border-radius: 999px;
    }

    .arzi[data-mood="thinking"] .eye-left {
      transform: translateY(1px) rotate(8deg);
    }

    .arzi[data-mood="thinking"] .eye-right {
      transform: translateY(-1px);
    }

    .arzi[data-mood="sad"] .arzi-scarf,
    .arzi[data-mood="wrong"] .arzi-scarf {
      background: linear-gradient(180deg, #cf3d3d, var(--lb-red-dark, #a61f1f));
    }

    .arzi[data-mood="sad"] .mouth,
    .arzi[data-mood="wrong"] .mouth {
      bottom: 18%;
      width: 24%;
      height: 12%;
      border-top: 2px solid var(--text-main, #1f2933);
      border-bottom: 0;
      border-radius: 999px 999px 0 0;
    }

    .arzi[data-mood="sad"] .eye-left,
    .arzi[data-mood="wrong"] .eye-left {
      transform: rotate(12deg);
    }

    .arzi[data-mood="sad"] .eye-right,
    .arzi[data-mood="wrong"] .eye-right {
      transform: rotate(-12deg);
    }

    .arzi[data-mood="sleepy"] .eye {
      top: 38%;
      height: 2px;
      border-radius: 999px;
    }

    .arzi[data-mood="sleepy"] .mouth {
      width: 16%;
      height: 0;
      bottom: 24%;
      border: 0;
      border-top: 2px solid var(--text-main, #1f2933);
      border-radius: 999px;
    }

    .arzi[data-mood="proud"] .arzi-star,
    .arzi[data-mood="celebrate"] .arzi-star,
    .arzi[data-mood="excited"] .arzi-star {
      transform: rotate(14deg) scale(1.18);
    }

    .arzi[data-mood="proud"] .arzi-face-shell {
      box-shadow:
        inset 0 -3px 0 rgba(31, 41, 51, 0.07),
        0 0 0 2px rgba(244, 185, 66, 0.22);
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

  get resolvedMood(): MascotMood {
    return this.mood;
  }
}