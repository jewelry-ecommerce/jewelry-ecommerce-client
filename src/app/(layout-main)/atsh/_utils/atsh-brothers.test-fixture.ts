import type { AtshBrotherRecord, AtshBrothersData } from "@/app/(layout-main)/atsh/_utils/atsh-brothers.interface";

const showcaseImage =
  "https://cdn-media-test.sevagoretail.jewelry/v1/img/test-external-trading/019eda8d-085b-7389-9c20-f832435d09de/v-219af834/original.png";

const showcaseImageAlt =
  "https://cdn-media-test.sevagoretail.jewelry/v1/img/test-external-trading/019eda9e-4dbb-723e-90c2-467f7008f379/v-666d1ad8/original.png";

function createBrotherFixture(
  overrides: Partial<AtshBrotherRecord> & Pick<AtshBrotherRecord, "id" | "slug" | "displayName">,
): AtshBrotherRecord {
  const slug = overrides.slug;

  return {
    roles: [],
    starName: null,
    // spiralKey + collectionSlug default to slug — same as production fallback behaviour.
    spiralKey: slug,
    collectionSlug: slug,
    images: {
      spiralCard: { filename: `${slug}.png`, path: `/image/atsh/spiral/cards/${slug}.png`, alt: overrides.displayName },
      heroBanner: {
        mobile: "/image/atsh/spiral/cards/placeholder.png",
        tablet: "/image/atsh/spiral/cards/placeholder.png",
        desktop: "/image/atsh/spiral/cards/placeholder.png",
      },
      gallery: [],
      galleryImageCount: 2,
    },
    content: {
      pageTitle: `TRANG SỨC ${overrides.displayName.toUpperCase()}`,
      introDescription: "Mô tả intro.",
      fullLookTitle: `FULL-LOOK ${overrides.displayName.toUpperCase()}`,
      fullLookDescription: "Mô tả full-look.",
      galleryTitle: "Hình ảnh anh trai",
      galleryDescription: "Mô tả gallery.",
    },
    routes: {
      singerPage: `/atsh/singer/${slug}`,
      collectionPage: `/san-pham?collection=${slug}`,
      spiralSection: "/bst-collab-tinhhasayhi#24-anh-trai",
    },
    ...overrides,
  };
}

/** Fixture nhỏ cho unit test — không đọc file mẫu `atsh-brothers.json`. */
export const mockAtshBrothersData: AtshBrothersData = {
  type: "atsh-brothers",
  meta: {
    sharedContent: {
      discoverSectionTitle: "KHÁM PHÁ THÊM",
      spiralProductsCta: {
        label: "Xem tất cả sản phẩm",
        href: "/san-pham",
      },
      exploreCta: {
        label: "Khám phá ngay",
        href: "#24-anh-trai",
      },
      discoverCards: [
        { title: "VỀ HEARTLOCK", description: "Mô tả 1", image: "https://cdn.example.com/1.png", href: "/" },
        { title: "COLLAB", description: "Mô tả 2", image: "https://cdn.example.com/2.png", href: "/san-pham" },
        { title: "KHÁM PHÁ", description: "Mô tả 3", image: "https://cdn.example.com/3.png", href: "/bst-collab-tinhhasayhi#24-anh-trai" },
      ],
    },
  },
  brothers: [
    createBrotherFixture({
      id: 1,
      slug: "quang-hung-masterd",
      displayName: "Quang Hùng MasterD",
      singerName: "QUANG HÙNG MASTERD",
      products: [
        {
          productSlug: "mat-day-chuyen-bac-ky-niem-tinh-yeu",
          image: showcaseImage,
          imagePosition: "left",
          shortDescription: "Vẻ đẹp của thiên nhiên được lưu giữ trong từng cánh hoa.",
        },
        {
          productSlug: "mat-day-chuyen-bac-ky-niem-tinh-yeu",
          image: showcaseImageAlt,
          imagePosition: "right",
          shortDescription: "Vẻ đẹp của thiên nhiên được lưu giữ trong từng cánh hoa.",
        },
      ],
      fullLookProductSlug: "mat-day-chuyen-bac-ky-niem-tinh-yeu",
    }),
    createBrotherFixture({
      id: 2,
      slug: "wren-evans",
      displayName: "Wren Evans",
      products: [
        {
          productSlug: "mat-day-chuyen-bac-ky-niem-tinh-yeu",
          image: showcaseImage,
          imagePosition: "left",
          shortDescription: "Vẻ đẹp của thiên nhiên được lưu giữ trong từng cánh hoa.",
        },
        {
          productSlug: "mat-day-chuyen-bac-ky-niem-tinh-yeu",
          image: showcaseImageAlt,
          imagePosition: "right",
          shortDescription: "Vẻ đẹp của thiên nhiên được lưu giữ trong từng cánh hoa.",
        },
      ],
      fullLookProductSlug: "mat-day-chuyen-bac-ky-niem-tinh-yeu",
    }),
  ],
};
