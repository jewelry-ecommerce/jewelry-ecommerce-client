export const CART_FLOW_ANIMATE_EVENT = "cart-flow:animate";

export type CartFlowAnimateEventDetail = {
  sourceElement: HTMLElement;
};

export const dispatchCartFlowAnimate = (sourceElement: HTMLElement): void => {
  sourceElement.dispatchEvent(
    new CustomEvent<CartFlowAnimateEventDetail>(CART_FLOW_ANIMATE_EVENT, {
      detail: { sourceElement },
      bubbles: true,
    }),
  );
};
