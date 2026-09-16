import { CART_FLOW_ANIMATE_EVENT, type CartFlowAnimateEventDetail } from "./cart-flow.events";

type CartFlowOptions = {
  cartSelector?: string;
  buttonSelector?: string;
  itemSelector?: string;
  imageSelector?: string;
  animationDuration?: number;
  easing?: string;
  shakeEffect?: boolean;
  soundEffect?: string | HTMLAudioElement | null;
  onComplete?: (item: HTMLElement) => void;
  onCartShake?: (cart: HTMLElement) => void;
};

class CartFlow {
  private static isGlobalListenerRegistered = false;
  private static activeInstances = 0;

  private DEFAULTS: Required<CartFlowOptions> = {
    cartSelector: ".shopping-cart",
    buttonSelector: ".add-to-cart",
    itemSelector: ".item",
    imageSelector: "img",
    animationDuration: 1100,
    easing: "cubic-bezier(0.33, 0.1, 0.25, 1)",
    shakeEffect: true,
    soundEffect: null,
    onComplete: () => {},
    onCartShake: () => {},
  };

  private settings: Required<CartFlowOptions>;
  private cartElement: HTMLElement;
  private animationQueue: Array<() => void> = [];
  private isAnimating = false;
  private activeCloneAnimations = new Set<Animation>();

  private updateCartElement() {
    const cart = document.querySelector(this.settings.cartSelector) as HTMLElement | null;
    if (cart) {
      this.cartElement = cart;
    }
  }

  constructor(options: CartFlowOptions = {}) {
    this.settings = { ...this.DEFAULTS, ...options };

    const cart = document.querySelector(this.settings.cartSelector) as HTMLElement | null;

    if (!cart) {
      throw new Error(`Cart element not found: ${this.settings.cartSelector}`);
    }

    this.cartElement = cart;
    CartFlow.activeInstances += 1;
    this.initEventListeners();
  }

  private bodyClickHandler = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const button = target.closest(this.settings.buttonSelector) as HTMLElement | null;

    if (button) {
      this._animateFromSource(button);
    }
  };

  private cartFlowAnimateHandler = (event: Event) => {
    const sourceElement = (event as CustomEvent<CartFlowAnimateEventDetail>).detail?.sourceElement;
    if (!sourceElement) {
      return;
    }

    this._animateFromSource(sourceElement);
  };

  private initEventListeners() {
    if (CartFlow.isGlobalListenerRegistered) return;

    CartFlow.isGlobalListenerRegistered = true;
    document.body.addEventListener("click", this.bodyClickHandler);
    document.body.addEventListener(CART_FLOW_ANIMATE_EVENT, this.cartFlowAnimateHandler);
  }

  public destroy() {
    CartFlow.activeInstances = Math.max(0, CartFlow.activeInstances - 1);
    if (CartFlow.activeInstances === 0 && CartFlow.isGlobalListenerRegistered) {
      document.body.removeEventListener("click", this.bodyClickHandler);
      document.body.removeEventListener(CART_FLOW_ANIMATE_EVENT, this.cartFlowAnimateHandler);
      CartFlow.isGlobalListenerRegistered = false;
    }

    this.activeCloneAnimations.forEach((animation) => animation.cancel());
    this.activeCloneAnimations.clear();
    this.animationQueue = [];
    this.isAnimating = false;
  }

  private _animateFromSource(button: HTMLElement) {
    this.updateCartElement();

    const item = button.closest(this.settings.itemSelector) as HTMLElement | null;

    if (!item) return;

    let image = item.querySelector(this.settings.imageSelector) as HTMLImageElement | null;
    if (!image && button.matches(this.settings.imageSelector)) {
      image = button as unknown as HTMLImageElement;
    }
    if (!image) {
      image = button.querySelector(this.settings.imageSelector) as HTMLImageElement | null;
    }
    if (!image) {
      image = item.querySelector("img") as HTMLImageElement | null;
    }

    if (!image) return;

    this.animationQueue.push(() => this._animateImageToCart(image, item));

    if (!this.isAnimating) this._processQueue();
  }

  private _processQueue() {
    if (this.animationQueue.length > 0) {
      const next = this.animationQueue.shift();
      next && next();
    }
  }

  private _prefersReducedMotion() {
    return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  private _animateImageToCart(image: HTMLImageElement, item: HTMLElement) {
    this.isAnimating = true;
    this.updateCartElement();

    if (this._prefersReducedMotion()) {
      this._finalizeAnimation(item);
      return;
    }

    const imageRect = image.getBoundingClientRect();
    const cartRect = this.cartElement.getBoundingClientRect();

    if (imageRect.width < 2 || imageRect.height < 2 || cartRect.width < 2 || cartRect.height < 2) {
      this._finalizeAnimation(item);
      return;
    }

    const startX = imageRect.left + imageRect.width / 2;
    const startY = imageRect.top + imageRect.height / 2;
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    const startSize = Math.min(Math.max(imageRect.width, imageRect.height), 160);
    const endSize = 28;
    const endScale = endSize / startSize;

    const clone = document.createElement("img");
    clone.src = image.currentSrc || image.src;
    clone.alt = "";
    clone.decoding = "async";
    clone.draggable = false;

    Object.assign(clone.style, {
      position: "fixed",
      left: `${startX}px`,
      top: `${startY}px`,
      width: `${startSize}px`,
      height: `${startSize}px`,
      margin: "0",
      padding: "0",
      border: "0",
      borderRadius: "12px",
      objectFit: "cover",
      transform: "translate(-50%, -50%) scale(1)",
      transformOrigin: "center center",
      opacity: "1",
      zIndex: "10000",
      pointerEvents: "none",
      boxShadow: "0 10px 28px rgba(0, 0, 0, 0.18)",
      willChange: "transform, opacity",
      backfaceVisibility: "hidden",
    });

    document.body.appendChild(clone);

    const midX = deltaX * 0.45;
    const midY = deltaY * 0.35 - Math.min(96, Math.abs(deltaY) * 0.22 + 24);
    const midScale = Math.max(endScale * 1.8, 0.55);

    const animation = clone.animate(
      [
        {
          transform: "translate(-50%, -50%) scale(1)",
          opacity: 1,
          offset: 0,
        },
        {
          transform: `translate(calc(-50% + ${midX * 0.35}px), calc(-50% + ${midY * 0.5}px)) scale(0.92)`,
          opacity: 1,
          offset: 0.2,
        },
        {
          transform: `translate(calc(-50% + ${midX}px), calc(-50% + ${midY}px)) scale(${midScale})`,
          opacity: 1,
          offset: 0.55,
        },
        {
          transform: `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(${endScale})`,
          opacity: 0.15,
          offset: 1,
        },
      ],
      {
        duration: this.settings.animationDuration,
        easing: this.settings.easing,
        fill: "forwards",
      },
    );

    this.activeCloneAnimations.add(animation);

    const cleanup = () => {
      this.activeCloneAnimations.delete(animation);
      clone.remove();
      this._finalizeAnimation(item);
    };

    animation.onfinish = cleanup;
    animation.oncancel = () => {
      this.activeCloneAnimations.delete(animation);
      clone.remove();
      this.isAnimating = false;
      this._processQueue();
    };
  }

  private _finalizeAnimation(item: HTMLElement) {
    this.settings.onComplete?.(item);

    if (this.settings.shakeEffect) {
      this._shakeCart();
    }

    this.isAnimating = false;
    this._processQueue();
  }

  private _shakeCart() {
    this.updateCartElement();

    if (!this.cartElement) {
      this.settings.onCartShake?.(this.cartElement);
      return;
    }

    if (this._prefersReducedMotion()) {
      this.settings.onCartShake?.(this.cartElement);
      return;
    }

    const animation = this.cartElement.animate(
      [
        { transform: "translate3d(0, 0, 0) scale(1)" },
        { transform: "translate3d(0, 0, 0) scale(1.18)" },
        { transform: "translate3d(0, 0, 0) scale(0.94)" },
        { transform: "translate3d(0, 0, 0) scale(1)" },
      ],
      {
        duration: 320,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    );

    animation.onfinish = () => this.settings.onCartShake?.(this.cartElement);
    animation.oncancel = () => this.settings.onCartShake?.(this.cartElement);
  }
}

export default CartFlow;
