import { getTenantBrandName, resolveProductDefaultImageSrc } from "@/utils/config/tenant-branding.util";
import { getCurrentYear } from "@/utils/format";

export const getCmsDefaults = (brandNameOverride?: string) => {
  const brandName = brandNameOverride?.trim() || getTenantBrandName();
  const currentYear = getCurrentYear();

  return {
    footer: {
      newsletterHeading: "Đăng ký nhận tin",
      newsletterSubHeading: `Nhận ưu đãi và tin mới nhất từ ${brandName}`,
      newsletterEmailPlaceholder: "Nhập email của bạn",
      newsletterButtonText: "Đăng ký",
      newsletterPrivacyUrl: "/chinh-sach-bao-mat",
      newsletterTermsText: "Bằng việc đăng ký, bạn đồng ý với điều khoản sử dụng.",
      copyrightText: `© ${currentYear} ${brandName}. All rights reserved.`,
      socialLinks: [
        {
          platform: "Facebook",
          displayName: `Facebook ${brandName}`,
          url: "https://facebook.com/seva",
          orderIndex: 0,
        },
        {
          platform: "Instagram",
          displayName: `Instagram ${brandName}`,
          url: "https://instagram.com/seva",
          orderIndex: 1,
        },
        {
          platform: "TikTok",
          displayName: "TikTok",
          url: "https://tiktok.com/@seva",
          orderIndex: 2,
        },
        {
          platform: "YouTube",
          displayName: "YouTube",
          url: "https://youtube.com/@seva",
          orderIndex: 3,
        },
      ],
      menuColumns: [
        {
          title: "Chăm sóc khách hàng",
          orderIndex: 0,
          items: [
            { label: "FAQs & Liên hệ", url: "/", orderIndex: 0 },
            { label: "Tra cứu đơn hàng", url: "/tra-cuu-don-hang", orderIndex: 1 },
            { label: "Hướng dẫn đo size", url: "/", orderIndex: 2 },
            { label: "Hướng dẫn bảo dưỡng trang sức", url: "/", orderIndex: 3 },
            { label: "Hướng dẫn đăng ký/đăng nhập", url: "/", orderIndex: 4 },
            { label: "Hướng dẫn mua hàng & thanh toán", url: "/", orderIndex: 5 },
            { label: "Hướng dẫn đổi hàng/hoàn tiền", url: "/", orderIndex: 6 },
            { label: "Cá nhân hóa & quà tặng", url: "/", orderIndex: 7 },
          ],
        },
        {
          title: "Chính sách hỗ trợ",
          orderIndex: 1,
          items: [
            { label: "Thanh toán", url: "/", orderIndex: 0 },
            { label: "Trả góp", url: "/", orderIndex: 1 },
            { label: "Giao nhận", url: "/", orderIndex: 2 },
            { label: "Đổi hàng/hoàn tiền", url: "/", orderIndex: 3 },
            { label: "Bảo hành", url: "/", orderIndex: 4 },
            { label: "Bảo mật", url: "/", orderIndex: 5 },
            { label: "Nâng cấp sản phẩm", url: "/", orderIndex: 6 },
            { label: "Cộng tác viên", url: "/", orderIndex: 7 },
          ],
        },
        {
          title: "Đặc quyền thành viên",
          orderIndex: 2,
          items: [
            { label: "Đăng ký", url: "/dang-ky", orderIndex: 0 },
            { label: `Gia nhập ${brandName} Keyholder`, url: "/", orderIndex: 1 },
          ],
        },
        {
          title: "Về chúng tôi",
          orderIndex: 3,
          items: [
            { label: `Về ${brandName}`, url: "/", orderIndex: 0 },
            { label: "Tin tức và xu hướng", url: "/", orderIndex: 1 },
            { label: "Sự kiện và hợp tác", url: "/", orderIndex: 2 },
            { label: "Cơ hội nghề nghiệp", url: "/", orderIndex: 3 },
            { label: "Hệ thống cửa hàng", url: "/", orderIndex: 4 },
          ],
        },
      ],
      bySegment: {
        b2: {
          menuColumns: [
            {
              title: "Chăm sóc khách hàng",
              orderIndex: 0,
              items: [
                { label: "FAQs & Liên hệ", url: "/", orderIndex: 0 },
                { label: "Tra cứu đơn hàng", url: "/tra-cuu-don-hang", orderIndex: 1 },
                { label: "Hướng dẫn đo size", url: "/", orderIndex: 2 },
                { label: "Hướng dẫn bảo dưỡng trang sức", url: "/", orderIndex: 3 },
                { label: "Hướng dẫn đăng ký/đăng nhập", url: "/", orderIndex: 4 },
                { label: "Hướng dẫn mua hàng & thanh toán", url: "/", orderIndex: 5 },
                { label: "Hướng dẫn đổi hàng/hoàn tiền", url: "/", orderIndex: 6 },
                { label: "Cá nhân hóa & quà tặng", url: "/", orderIndex: 7 },
              ],
            },
            {
              title: "Chính sách hỗ trợ",
              orderIndex: 1,
              items: [
                { label: "Thanh toán", url: "/", orderIndex: 0 },
                { label: "Trả góp", url: "/", orderIndex: 1 },
                { label: "Giao nhận", url: "/", orderIndex: 2 },
                { label: "Đổi hàng/hoàn tiền", url: "/", orderIndex: 3 },
                { label: "Bảo hành", url: "/", orderIndex: 4 },
                { label: "Bảo mật", url: "/", orderIndex: 5 },
                { label: "Nâng cấp sản phẩm", url: "/", orderIndex: 6 },
                { label: "Cộng tác viên", url: "/", orderIndex: 7 },
              ],
            },
            {
              title: "Đặc quyền thành viên",
              orderIndex: 2,
              items: [
                { label: "Đăng ký", url: "/dang-ky", orderIndex: 0 },
                { label: "Gia nhập MEMORIENT Keyholder", url: "/", orderIndex: 1 },
              ],
            },
            {
              title: "Về chúng tôi",
              orderIndex: 3,
              items: [
                { label: "Về MEMORIENT", url: "/", orderIndex: 0 },
                { label: "Tin tức và xu hướng", url: "/", orderIndex: 1 },
                { label: "Sự kiện và hợp tác", url: "/", orderIndex: 2 },
                { label: "Cơ hội nghề nghiệp", url: "/", orderIndex: 3 },
                { label: "Hệ thống cửa hàng", url: "/", orderIndex: 4 },
              ],
            },
          ],
        },
      },
    },
    logo: {
      logoUrl: "/image/logo/logo.svg",
      logoTargetUrl: "/",
      bySegment: {
        b1: {
          logoUrl: "/image/logo/logo.svg",
        },
        b2: {
          logoUrl: "/image/logo/logo-b2.svg",
        },
      },
    },
    homePage: {
      page: {
        id: "",
        name: "trang chủ",
        slug: "trang-chu",
        locale: "vi-VN",
        seo: {
          title: brandName,
          description: `Khám phá sản phẩm mới nhất tại ${brandName}`,
          keywords: null,
          canonicalUrl: null,
          imageUrl: null,
        },
      },
      layout: {
        id: "",
        name: "default_home_layout",
        targetDevice: "ALL",
        versionId: "",
        versionName: "default_home_layout_v1",
      },
      blocks: [
        {
          id: "home-default-0",
          blockTypeCode: "BANNER",
          sortOrder: 0,
          config: { placementCode: "SLIDER_TOP_B1" },
          targetSegment: null,
        },
        {
          id: "home-default-1",
          blockTypeCode: "PRODUCT_CAROUSEL",
          sortOrder: 1,
          config: {
            header: {
              title: `${brandName} x Anh Trai Say Hi SPECIAL EDITION “TINH HÀ SAY HI”`,
              subtitle: "Nơi 24 cá tính cùng giao thoa trong một tinh hà.",
            },
            display: { limit: 10 },
            dataSource: {
              categoryId: "hoa-tai",
              filterType: "COLLECTION",
              collectionId: "019e3f68-fb0e-72b9-a8e1-064225148793",
            },
          },
          targetSegment: null,
        },
        {
          id: "home-default-2",
          blockTypeCode: "BANNER",
          sortOrder: 2,
          config: { placementCode: "HOME_DOUBLE_BANNER" },
          targetSegment: null,
        },
        {
          id: "home-default-3",
          blockTypeCode: "PRODUCT_CAROUSEL",
          sortOrder: 3,
          config: {
            header: {
              title: "BỘ SƯU TẬP MỚI ĐỊNH DANH PHONG THÁI RIÊNG",
              subtitle: "",
            },
            display: { limit: 10 },
            dataSource: {
              categoryId: "day-chuyen",
              filterType: "CATEGORY",
            },
          },
          targetSegment: null,
        },
        {
          id: "home-default-4",
          blockTypeCode: "BANNER",
          sortOrder: 4,
          config: { placementCode: "HOME_SLIDER" },
          targetSegment: null,
        },
        {
          id: "home-default-5",
          blockTypeCode: "PRODUCT_CAROUSEL",
          sortOrder: 5,
          config: {
            header: {
              title: "BỘ SƯU TẬP THU ĐÔNG 2026 NOXARA - THE MYSTIC GARDEN",
              subtitle: "Vương quyền trong bóng tối - Kiêu hãnh giữa vũ trụ",
            },
            display: { limit: 10 },
            dataSource: {
              categoryId: "charm",
              filterType: "NEW_ARRIVALS",
            },
          },
          targetSegment: null,
        },
        {
          id: "home-default-6",
          blockTypeCode: "INFO_CARDS",
          sortOrder: 6,
          config: {
            items: [
              {
                title: brandName,
                imageUrl: resolveProductDefaultImageSrc(),
                actionUrl: "/",
                mediaType: "IMAGE",
                actionText: "Xem chi tiết",
                description: brandName,
              },
              {
                title: brandName,
                imageUrl: resolveProductDefaultImageSrc(),
                actionUrl: "/",
                mediaType: "IMAGE",
                actionText: "Xem chi tiết",
                description: brandName,
              },
              {
                title: brandName,
                imageUrl: resolveProductDefaultImageSrc(),
                actionUrl: "/",
                mediaType: "IMAGE",
                actionText: "Xem chi tiết",
                description: brandName,
              },
            ],
            header: { title: " TIN TỨC & XU HƯỚNG" },
            display: { columns: 3 },
          },
          targetSegment: null,
        },
        {
          id: "home-default-7",
          blockTypeCode: "IMAGE_GALLERY",
          sortOrder: 7,
          config: {
            items: [
              {
                label: "@posthuman.lab",
                imageUrl: resolveProductDefaultImageSrc(),
                actionUrl: "/",
                actionType: "LINK_URL",
                mixMatchSkus: [],
              },
              {
                label: "@posthuman.lab",
                imageUrl: resolveProductDefaultImageSrc(),
                actionUrl: "/",
                actionType: "LINK_URL",
                mixMatchSkus: [],
              },
              {
                label: "@posthuman.lab",
                imageUrl: resolveProductDefaultImageSrc(),
                actionUrl: "/",
                actionType: "LINK_URL",
                mixMatchSkus: [],
              },
            ],
            header: {
              title: brandName,
              subtitle: brandName,
            },
            display: { layoutStyle: "CAROUSEL" },
          },
          targetSegment: null,
        },
        {
          id: "home-default-8",
          blockTypeCode: "NEWSLETTER_SIGNUP",
          sortOrder: 8,
          config: {
            heading: `ĐĂNG KÝ NHẬN TIN VỀ BỘ SƯU TẬP, SỰ KIỆN VÀ TIN TỨC ĐỘC QUYỀN TỪ ${brandName.toUpperCase()}`,
            consentText: "Bằng cách nhấp chọn, bạn đồng ý với Chính sách Bảo mật thông tin ở trang này.",
          },
          targetSegment: null,
        },
      ],
    },
  };
};
