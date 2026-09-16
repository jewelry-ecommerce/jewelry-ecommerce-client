interface CartFlowOptions {
  /**
   * CSS selector for the cart element.
   * @default ".shopping-cart"
   */
  cartSelector?: string;

  /**
   * CSS selector for the "Add to Cart" button.
   * @default ".add-to-cart"
   */
  buttonSelector?: string;

  /**
   * CSS selector for the item container.
   * @default ".item"
   */
  itemSelector?: string;

  /**
   * CSS selector for the image inside an item.
   * @default "img"
   */
  imageSelector?: string;

  /**
   * Duration of the animation in milliseconds.
   * @default 1100
   */
  animationDuration?: number;

  /**
   * Animation easing function.
   * @default "cubic-bezier(0.33, 0.1, 0.25, 1)"
   */
  easing?: string;

  /**
   * Whether to apply a shake effect to the cart after animation.
   * @default true
   */
  shakeEffect?: boolean;

  /**
   * URL of the sound effect to play, or an HTMLAudioElement.
   * @default null
   */
  soundEffect?: string | HTMLAudioElement | null;

  /**
   * Callback function called after an item finishes animating into the cart.
   * @param item - The item element that was animated.
   */
  onComplete?: (item: HTMLElement) => void;

  /**
   * Callback function called after the cart finishes shaking.
   * @param cart - The cart element that was shaken.
   */
  onCartShake?: (cart: HTMLElement) => void;
}

declare class CartFlow {
  /**
   * Create a new CartFlow instance.
   * @param options - Configuration options to customize CartFlow behavior.
   */
  constructor(options?: CartFlowOptions);
}

export default CartFlow;
export as namespace CartFlow;
