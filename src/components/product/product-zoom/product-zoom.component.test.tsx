import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ProductZoomComponent from "./product-zoom.component";
import { MobileGalleryMediaItem } from "@/app/(layout-main)/san-pham/_components/product-detail/_components/product-detail-content.component";

vi.mock("@/components/cdn-image", () => ({
  CdnImage: ({ alt, src }: { alt: string; src: string }) => React.createElement("img", { alt, src }),
}));
import { getProductZoomViewportStyle } from "./use-product-zoom-viewport.hook";

class TestVisualViewport extends EventTarget {
  width = 400;
  height = 700;
  scale = 1;
  offsetLeft = 0;
  offsetTop = 0;
}

const images = ["/first-product.jpg", "/second-product.jpg"];
let viewport: TestVisualViewport;

function dispatchTouch(element: HTMLElement, type: string, points: Array<{ clientX: number; clientY: number }>): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", { value: points });
  Object.defineProperty(event, "changedTouches", { value: points });
  fireEvent(element, event);
  return event;
}

function pinchImage(element: HTMLElement): void {
  dispatchTouch(element, "touchstart", [{ clientX: 100, clientY: 100 }, { clientX: 200, clientY: 100 }]);
  dispatchTouch(element, "touchmove", [{ clientX: 50, clientY: 100 }, { clientX: 250, clientY: 100 }]);
  dispatchTouch(element, "touchend", []);
}

function renderZoom(isOpen = true, onClose = vi.fn()) {
  return render(<ProductZoomComponent images={images} initialIndex={0} isOpen={isOpen} onClose={onClose} />);
}

function getZoomElements() {
  const image = screen.getByAltText("Product image");
  const container = image.parentElement;
  const overlay = container?.parentElement;
  if (!container || !overlay) throw new Error("Zoom image is not mounted in its overlay");
  return { image, container, overlay };
}

beforeEach(() => {
  viewport = new TestVisualViewport();
  vi.stubGlobal("visualViewport", viewport);
  // happy-dom has no layout engine; give images and their containers realistic base dimensions.
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(700);
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(700);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("fits the visible viewport and closes after opening from an already zoomed page", () => {
  Object.assign(viewport, { width: 200, height: 350, scale: 2, offsetLeft: 100, offsetTop: 90 });
  const onClose = vi.fn();
  const view = renderZoom(false, onClose);
  expect(screen.queryByAltText("Product image")).toBeNull();
  view.rerender(<ProductZoomComponent images={images} initialIndex={0} isOpen onClose={onClose} />);
  const { overlay } = getZoomElements();
  expect(getZoomElements().image.style.transform).toContain("scale(2)");
  expect(overlay.style.width).toBe("400px");
  expect(overlay.style.height).toBe("700px");
  expect(overlay.style.transform).toBe("translate(100px, 90px) scale(0.5)");
  fireEvent.click(screen.getByRole("button", { name: "Close product zoom" }));
  expect(onClose).toHaveBeenCalledOnce();
});

it("follows browser viewport scrolling and resizing while open", () => {
  Object.assign(viewport, { width: 200, height: 350, scale: 2 });
  renderZoom();
  act(() => {
    viewport.offsetTop = 150;
    viewport.offsetLeft = 60;
    viewport.dispatchEvent(new Event("scroll"));
  });
  expect(getZoomElements().overlay.style.transform).toBe("translate(60px, 150px) scale(0.5)");
  act(() => {
    viewport.scale = 1;
    viewport.width = 400;
    viewport.height = 600;
    viewport.offsetLeft = 0;
    viewport.offsetTop = 0;
    viewport.dispatchEvent(new Event("resize"));
  });
  expect(getZoomElements().overlay.style.height).toBe("600px");
  expect(getZoomElements().overlay.style.transform).toBe("translate(0px, 0px) scale(1)");
});

it("attaches pinch listeners on first Portal mount and again after closing", () => {
  const view = renderZoom(false);
  view.rerender(<ProductZoomComponent images={images} initialIndex={0} isOpen onClose={vi.fn()} />);
  const firstMount = getZoomElements();
  pinchImage(firstMount.container);
  expect(firstMount.image.style.transform).toContain("scale(2)");
  view.rerender(<ProductZoomComponent images={images} initialIndex={0} isOpen={false} onClose={vi.fn()} />);
  dispatchTouch(firstMount.container, "touchstart", [{ clientX: 0, clientY: 0 }, { clientX: 100, clientY: 0 }]);
  view.rerender(<ProductZoomComponent images={images} initialIndex={0} isOpen onClose={vi.fn()} />);
  const secondMount = getZoomElements();
  expect(secondMount.image.style.transform).toContain("scale(1)");
  pinchImage(secondMount.container);
  expect(secondMount.image.style.transform).toContain("scale(2)");
});

it("compensates one-finger image panning for browser magnification", () => {
  Object.assign(viewport, { width: 200, height: 350, scale: 2 });
  renderZoom();
  const { image, container } = getZoomElements();
  dispatchTouch(container, "touchstart", [{ clientX: 100, clientY: 100 }]);
  dispatchTouch(container, "touchmove", [{ clientX: 110, clientY: 115 }]);
  expect(image.style.transform).toBe("translate3d(20px, 30px, 0) scale(2)");
});

it("removes viewport listeners and scroll lock when closed", () => {
  const removeListener = vi.spyOn(viewport, "removeEventListener");
  const view = renderZoom();
  expect(document.body.getAttribute("data-scroll-locked")).not.toBeNull();
  view.rerender(<ProductZoomComponent images={images} initialIndex={0} isOpen={false} onClose={vi.fn()} />);
  expect(document.body.getAttribute("data-scroll-locked")).toBeNull();
  expect(removeListener).toHaveBeenCalledWith("resize", expect.any(Function));
  expect(removeListener).toHaveBeenCalledWith("scroll", expect.any(Function));
});

it("retains the CSS fallback when VisualViewport is unavailable", () => {
  vi.stubGlobal("visualViewport", undefined);
  expect(getProductZoomViewportStyle()).toEqual({});
  renderZoom();
  expect(getZoomElements().overlay.style.transform).toBe("");
  expect(screen.getByRole("button", { name: "Close product zoom" })).toBeTruthy();
});

it("preserves image navigation, toolbar zoom and reset", () => {
  renderZoom();
  fireEvent.click(screen.getByLabelText("Next image"));
  expect(getZoomElements().image.getAttribute("src")).toBe(images[1]);
  fireEvent.click(screen.getByLabelText("Previous image"));
  expect(getZoomElements().image.getAttribute("src")).toBe(images[0]);
  fireEvent.click(screen.getByLabelText("Zoom in"));
  expect(getZoomElements().image.style.transform).toContain("scale(1.5)");
  fireEvent.click(screen.getByLabelText("Zoom out"));
  expect(getZoomElements().image.style.transform).toContain("scale(1)");
  pinchImage(getZoomElements().container);
  fireEvent.click(screen.getByLabelText("Reset image zoom"));
  expect(getZoomElements().image.style.transform).toBe("translate3d(0px, 0px, 0) scale(1)");
});

it("resets image zoom when the initial image changes and preserves wheel limits", () => {
  const view = renderZoom();
  fireEvent.wheel(getZoomElements().overlay, { deltaY: -1 });
  expect(getZoomElements().image.style.transform).toContain("scale(1.2)");
  view.rerender(<ProductZoomComponent images={images} initialIndex={1} isOpen onClose={vi.fn()} />);
  expect(getZoomElements().image.getAttribute("src")).toBe(images[1]);
  expect(getZoomElements().image.style.transform).toContain("scale(1)");
  fireEvent.wheel(getZoomElements().overlay, { deltaY: 1 });
  expect(getZoomElements().image.style.transform).toContain("scale(1)");
});

it("preserves double-tap zoom and cleans touch listeners on close", () => {
  const view = renderZoom();
  const { image, container } = getZoomElements();
  const removeListener = vi.spyOn(container, "removeEventListener");
  const point = [{ clientX: 100, clientY: 100 }];
  dispatchTouch(container, "touchstart", point);
  dispatchTouch(container, "touchend", []);
  dispatchTouch(container, "touchstart", point);
  expect(image.style.transform).toContain("scale(1.8)");
  view.rerender(<ProductZoomComponent images={images} initialIndex={0} isOpen={false} onClose={vi.fn()} />);
  expect(removeListener).toHaveBeenCalledWith("touchstart", expect.any(Function));
  expect(removeListener).toHaveBeenCalledWith("touchmove", expect.any(Function));
});

it("inherits browser zoom on each opening without resetting the page zoom", () => {
  viewport.scale = 2.5;
  const view = renderZoom();
  expect(getZoomElements().image.style.transform).toContain("scale(2.5)");
  fireEvent.click(screen.getByLabelText("Reset image zoom"));
  expect(getZoomElements().image.style.transform).toContain("scale(1)");
  expect(viewport.scale).toBe(2.5);
  view.rerender(<ProductZoomComponent images={images} initialIndex={0} isOpen={false} onClose={vi.fn()} />);
  view.rerender(<ProductZoomComponent images={images} initialIndex={0} isOpen onClose={vi.fn()} />);
  expect(getZoomElements().image.style.transform).toContain("scale(2.5)");
});

it("preserves browser zoom above the usual image limit and allows pinch to reduce it", () => {
  viewport.scale = 5;
  renderZoom();
  const { image, container } = getZoomElements();
  expect(image.style.transform).toContain("scale(5)");
  dispatchTouch(container, "touchstart", [{ clientX: 100, clientY: 100 }, { clientX: 200, clientY: 100 }]);
  dispatchTouch(container, "touchmove", [{ clientX: 95, clientY: 100 }, { clientX: 205, clientY: 100 }]);
  expect(image.style.transform).toContain("scale(5)");
  dispatchTouch(container, "touchmove", [{ clientX: 125, clientY: 100 }, { clientX: 175, clientY: 100 }]);
  expect(image.style.transform).toContain("scale(2.5)");
});

it("opens at the zoom level passed from the managed product gallery", () => {
  const view = render(<ProductZoomComponent images={images} initialIndex={0} initialScale={2.5} isOpen onClose={vi.fn()} />);
  expect(getZoomElements().image.style.transform).toContain("scale(2.5)");
  view.rerender(<ProductZoomComponent images={images} initialIndex={0} initialScale={2.5} isOpen={false} onClose={vi.fn()} />);
  view.rerender(<ProductZoomComponent images={images} initialIndex={0} initialScale={1} isOpen onClose={vi.fn()} />);
  expect(getZoomElements().image.style.transform).toContain("scale(1)");
});

function GalleryZoomJourney() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [initialScale, setInitialScale] = React.useState(1);
  return (
    <>
      <MobileGalleryMediaItem item={{ url: images[0] }} alt="Outside product image" className="gallery"
        fallbackImage={images[0]} onOpenZoom={(scale) => { setInitialScale(scale); setIsOpen(true); }} />
      <ProductZoomComponent images={images} initialIndex={0} initialScale={initialScale}
        isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

it("pinches the outside image, transfers its scale and returns to an unzoomed detail image on X close", () => {
  render(<GalleryZoomJourney />);
  const outsideImage = screen.getByAltText("Outside product image");
  const transformContainer = outsideImage.parentElement?.parentElement;
  const touchContainer = transformContainer?.parentElement;
  if (!transformContainer || !touchContainer) throw new Error("Outside gallery is not mounted");
  pinchImage(touchContainer);
  expect(transformContainer.style.transform).toBe("translate(0px, 0px) scale(2)");
  expect(viewport.scale).toBe(1);
  fireEvent.click(outsideImage);
  expect(getZoomElements().image.style.transform).toContain("scale(2)");
  fireEvent.click(screen.getByRole("button", { name: "Close product zoom" }));
  expect(screen.queryByAltText("Product image")).toBeNull();
  expect(transformContainer.style.transform).toBe("translate(0px, 0px) scale(1)");
  expect(viewport.scale).toBe(1);
  fireEvent.click(outsideImage);
  expect(getZoomElements().image.style.transform).toContain("scale(1)");
});

it("keeps pinch and zoomed image panning from starting carousel drag", () => {
  render(<GalleryZoomJourney />);
  const outsideImage = screen.getByAltText("Outside product image");
  const transformContainer = outsideImage.parentElement?.parentElement;
  const touchContainer = transformContainer?.parentElement;
  if (!transformContainer || !touchContainer) throw new Error("Outside gallery is not mounted");
  const carouselTouchStart = vi.fn();
  touchContainer.parentElement?.addEventListener("touchstart", carouselTouchStart);
  pinchImage(touchContainer);
  expect(carouselTouchStart).not.toHaveBeenCalled();
  dispatchTouch(touchContainer, "touchstart", [{ clientX: 100, clientY: 100 }]);
  dispatchTouch(touchContainer, "touchmove", [{ clientX: 110, clientY: 120 }]);
  expect(carouselTouchStart).not.toHaveBeenCalled();
  expect(transformContainer.style.transform).toBe("translate(10px, 20px) scale(2)");
});

it("allows one-finger carousel gestures while the outside image is unzoomed", () => {
  render(<GalleryZoomJourney />);
  const outsideImage = screen.getByAltText("Outside product image");
  const touchContainer = outsideImage.parentElement?.parentElement?.parentElement;
  if (!touchContainer) throw new Error("Outside gallery is not mounted");
  const carouselTouchStart = vi.fn();
  touchContainer.parentElement?.addEventListener("touchstart", carouselTouchStart);
  const singleTouch = dispatchTouch(touchContainer, "touchstart", [{ clientX: 100, clientY: 100 }]);
  expect(carouselTouchStart).toHaveBeenCalledOnce();
  expect(singleTouch.defaultPrevented).toBe(false);
  const pinchStart = dispatchTouch(touchContainer, "touchstart", [{ clientX: 100, clientY: 100 }, { clientX: 200, clientY: 100 }]);
  expect(pinchStart.defaultPrevented).toBe(true);
  expect(carouselTouchStart).toHaveBeenCalledOnce();
});

function setZoomGeometry(image: HTMLElement, container: HTMLElement, imageWidth: number, imageHeight: number,
  containerWidth: number, containerHeight: number): void {
  Object.defineProperties(image, {
    offsetWidth: { configurable: true, value: imageWidth },
    offsetHeight: { configurable: true, value: imageHeight },
  });
  Object.defineProperties(container, {
    clientWidth: { configurable: true, value: containerWidth },
    clientHeight: { configurable: true, value: containerHeight },
  });
  fireEvent.load(image);
}

it.each([
  [10000, 10000, 140, 100],
  [-10000, -10000, -140, -100],
  [110, 120, 10, 20],
])("keeps overlay touch panning inside image edges (%s, %s)", (touchX, touchY, panX, panY) => {
  renderZoom();
  const { image, container } = getZoomElements();
  setZoomGeometry(image, container, 340, 400, 400, 600);
  pinchImage(container);
  dispatchTouch(container, "touchstart", [{ clientX: 100, clientY: 100 }]);
  dispatchTouch(container, "touchmove", [{ clientX: touchX, clientY: touchY }]);
  expect(image.style.transform).toBe(`translate3d(${panX}px, ${panY}px, 0) scale(2)`);
});

it("keeps mouse panning bounded and reclamps pan when toolbar zoom decreases", () => {
  renderZoom();
  const { image, container } = getZoomElements();
  setZoomGeometry(image, container, 340, 400, 400, 600);
  pinchImage(container);
  fireEvent.mouseDown(container, { clientX: 100, clientY: 100 });
  fireEvent.mouseMove(container, { clientX: 10000, clientY: 10000 });
  fireEvent.mouseUp(container, { clientX: 10000, clientY: 10000 });
  expect(image.style.transform).toBe("translate3d(140px, 100px, 0) scale(2)");
  fireEvent.click(screen.getByLabelText("Zoom out"));
  expect(image.style.transform).toBe("translate3d(55px, 0px, 0) scale(1.5)");
});

it("centers an axis when the zoomed image is smaller than its container", () => {
  renderZoom();
  const { image, container } = getZoomElements();
  setZoomGeometry(image, container, 200, 200, 400, 600);
  pinchImage(container);
  dispatchTouch(container, "touchstart", [{ clientX: 100, clientY: 100 }]);
  dispatchTouch(container, "touchmove", [{ clientX: 10000, clientY: -10000 }]);
  expect(image.style.transform).toBe("translate3d(0px, 0px, 0) scale(2)");
});

it("reclamps pan when image dimensions change after load", () => {
  renderZoom();
  const { image, container } = getZoomElements();
  pinchImage(container);
  dispatchTouch(container, "touchstart", [{ clientX: 100, clientY: 100 }]);
  dispatchTouch(container, "touchmove", [{ clientX: 10000, clientY: 10000 }]);
  expect(image.style.transform).toBe("translate3d(200px, 350px, 0) scale(2)");
  setZoomGeometry(image, container, 340, 400, 400, 600);
  expect(image.style.transform).toBe("translate3d(140px, 100px, 0) scale(2)");
});

it("keeps the outside image inside the gallery when dragged far in either direction", () => {
  render(<GalleryZoomJourney />);
  const image = screen.getByAltText("Outside product image");
  const transformContainer = image.parentElement?.parentElement;
  const container = transformContainer?.parentElement;
  if (!transformContainer || !container) throw new Error("Outside gallery is not mounted");
  setZoomGeometry(image, container, 400, 600, 400, 600);
  pinchImage(container);
  dispatchTouch(container, "touchstart", [{ clientX: 100, clientY: 100 }]);
  dispatchTouch(container, "touchmove", [{ clientX: 10000, clientY: 10000 }]);
  expect(transformContainer.style.transform).toBe("translate(200px, 300px) scale(2)");
  dispatchTouch(container, "touchmove", [{ clientX: -10000, clientY: -10000 }]);
  expect(transformContainer.style.transform).toBe("translate(-200px, -300px) scale(2)");
  fireEvent.click(image);
  fireEvent.click(screen.getByRole("button", { name: "Close product zoom" }));
  expect(transformContainer.style.transform).toBe("translate(0px, 0px) scale(1)");
});

it("does not let an explicit gallery scale of 1 override browser zoom", () => {
  viewport.scale = 2.5;
  render(<ProductZoomComponent images={images} initialIndex={0} initialScale={1} isOpen onClose={vi.fn()} />);
  expect(getZoomElements().image.style.transform).toContain("scale(2.5)");
});
