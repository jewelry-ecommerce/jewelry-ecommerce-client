/**
 * Tạo trang CMS cho mọi URL footer + PUT admin/cms/footer.
 * ENV: JEWELRY_DEMO_CONFIRM=CREATE_THESIS_CATALOG_120 + phone/password
 */
import { api, login, thesisBlock, verifyThesisTarget } from './thesis-catalog.api.mjs';

verifyThesisTarget();
await login();

const FOOTER_PAGES = [
  { slug: 'faqs-lien-he', name: 'FAQs & Liên hệ', title: 'FAQs & Liên hệ', body: '<p>Bạn cần hỗ trợ? Liên hệ hotline hoặc email chăm sóc khách hàng Heartlock. Chúng tôi phản hồi trong giờ làm việc.</p><p><strong>Hotline:</strong> 1900 8888<br/><strong>Email:</strong> support@heartlock.vn</p>' },
  { slug: 'huong-dan-do-size', name: 'Hướng dẫn đo size', title: 'Hướng dẫn đo size', body: '<p>Đo chu vi ngón tay hoặc cổ tay bằng thước dây, đối chiếu bảng size trên trang sản phẩm để chọn vừa khít.</p><p>Nếu phân vân giữa hai size, ưu tiên size lớn hơn để đeo thoải mái mỗi ngày.</p>' },
  { slug: 'huong-dan-bao-duong', name: 'Hướng dẫn bảo dưỡng trang sức', title: 'Bảo dưỡng trang sức bạc', body: '<p>Giữ trang sức khô ráo, tránh hóa chất và nước hoa. Lau nhẹ bằng khăn mềm sau khi đeo để giữ độ sáng.</p><p>Bảo quản riêng từng món trong hộp hoặc túi chống ẩm.</p>' },
  { slug: 'huong-dan-dang-ky-dang-nhap', name: 'Hướng dẫn đăng ký/đăng nhập', title: 'Đăng ký & đăng nhập', body: '<p>Tạo tài khoản bằng số điện thoại, xác thực OTP rồi hoàn tất hồ sơ để theo dõi đơn hàng và ưu đãi thành viên.</p>' },
  { slug: 'huong-dan-mua-hang-thanh-toan', name: 'Hướng dẫn mua hàng & thanh toán', title: 'Mua hàng & thanh toán', body: '<p>Chọn sản phẩm → thêm vào giỏ → thanh toán. Hỗ trợ COD và các cổng thanh toán trực tuyến đang kích hoạt trên hệ thống.</p>' },
  { slug: 'huong-dan-doi-hang-hoan-tien', name: 'Hướng dẫn đổi hàng/hoàn tiền', title: 'Đổi hàng & hoàn tiền', body: '<p>Trong vòng 7 ngày kể từ khi nhận hàng, sản phẩm còn tem/hộp và chưa qua sử dụng có thể được đổi hoặc hoàn theo chính sách.</p>' },
  { slug: 'ca-nhan-hoa-qua-tang', name: 'Cá nhân hóa & quà tặng', title: 'Cá nhân hóa & quà tặng', body: '<p>Gói quà và tùy chọn khắc theo yêu cầu (nếu áp dụng). Liên hệ CSKH để được tư vấn set quà phù hợp.</p>' },
  { slug: 'chinh-sach-thanh-toan', name: 'Chính sách thanh toán', title: 'Chính sách thanh toán', body: '<p>Thanh toán khi nhận hàng (COD) hoặc qua cổng online. Mọi giao dịch được bảo mật theo tiêu chuẩn hệ thống.</p>' },
  { slug: 'chinh-sach-tra-gop', name: 'Chính sách trả góp', title: 'Chính sách trả góp', body: '<p>Hình thức trả góp (nếu có) sẽ hiển thị tại bước thanh toán theo đối tác tài chính hỗ trợ.</p>' },
  { slug: 'chinh-sach-giao-nhan', name: 'Chính sách giao nhận', title: 'Chính sách giao nhận', body: '<p>Giao hàng toàn quốc. Đơn đủ điều kiện freeship theo chương trình đang chạy. Thời gian giao dự kiến 1–5 ngày làm việc tùy khu vực.</p>' },
  { slug: 'chinh-sach-doi-hang-hoan-tien', name: 'Chính sách đổi hàng/hoàn tiền', title: 'Chính sách đổi hàng/hoàn tiền', body: '<p>Đổi/hoàn trong 7 ngày với sản phẩm còn nguyên. Phí vận chuyển đổi hàng theo quy định từng trường hợp.</p>' },
  { slug: 'chinh-sach-bao-hanh', name: 'Chính sách bảo hành', title: 'Chính sách bảo hành', body: '<p>Bảo hành lỗi kỹ thuật theo thời hạn ghi trên phiếu/đơn hàng. Không áp dụng với hao mòn tự nhiên hoặc va đập.</p>' },
  { slug: 'chinh-sach-bao-mat', name: 'Chính sách bảo mật', title: 'Chính sách bảo mật', body: '<p>Heartlock chỉ dùng thông tin khách hàng để xử lý đơn và chăm sóc. Không chia sẻ cho bên thứ ba ngoài phạm vi cần thiết để giao hàng/thanh toán.</p>' },
  { slug: 'nang-cap-san-pham', name: 'Nâng cấp sản phẩm', title: 'Nâng cấp sản phẩm', body: '<p>Chương trình nâng cấp (nếu có) sẽ được thông báo trên website và tới thành viên đủ điều kiện.</p>' },
  { slug: 'cong-tac-vien', name: 'Cộng tác viên', title: 'Cộng tác viên', body: '<p>Đăng ký cộng tác viên qua form liên hệ. Hoa hồng và điều kiện hợp tác sẽ được gửi sau khi xét duyệt.</p>' },
  { slug: 'gia-nhap-keyholder', name: 'Gia nhập Keyholder', title: 'Đặc quyền thành viên Keyholder', body: '<p>Thành viên Keyholder nhận ưu đãi sớm, quà sinh nhật và điểm tích lũy theo đơn hàng.</p>' },
  { slug: 've-chung-toi', name: 'Về chúng tôi', title: 'Về Heartlock', body: '<p>Heartlock mang đến trang sức bạc 925 tinh tế cho phong cách mỗi ngày — tối giản, hiện đại và dễ phối.</p>' },
  { slug: 'tin-tuc-xu-huong', name: 'Tin tức và xu hướng', title: 'Tin tức & xu hướng', body: '<p>Cập nhật lookbook, xu hướng trang sức bạc và cảm hứng phối đồ mới nhất từ Heartlock.</p>' },
  { slug: 'su-kien-hop-tac', name: 'Sự kiện và hợp tác', title: 'Sự kiện & hợp tác', body: '<p>Theo dõi các sự kiện pop-up, collab và chiến dịch mùa từ Heartlock trên website và mạng xã hội.</p>' },
  { slug: 'co-hoi-nghe-nghiep', name: 'Cơ hội nghề nghiệp', title: 'Cơ hội nghề nghiệp', body: '<p>Gửi CV về careers@heartlock.vn nếu bạn muốn đồng hành cùng đội ngũ Heartlock.</p>' },
  { slug: 'he-thong-cua-hang', name: 'Hệ thống cửa hàng', title: 'Hệ thống cửa hàng', body: '<p>Hiện hỗ trợ mua online toàn quốc. Thông tin showroom (nếu mở) sẽ cập nhật tại trang này.</p>' },
];

async function supportsTextBlock() {
  try {
    const probe = await api('admin/cms/pages', 'POST', {
      name: 'Probe TEXT_BLOCK',
      slug: 'probe-text-block-' + Date.now(),
      locale: 'vi-VN',
      isActive: false,
      targetDevice: 'ALL',
      seo: { title: 'probe', description: 'probe' },
      blocks: [{ type: 'TEXT_BLOCK', isVisible: true, sortOrder: 0, config: { title: 't', content: '<p>t</p>' } }],
    });
    try {
      await api('admin/cms/pages/' + probe.id, 'PUT', {
        name: probe.name,
        slug: probe.slug,
        locale: 'vi-VN',
        isActive: false,
        targetDevice: 'ALL',
        seo: { title: 'probe', description: 'probe' },
        blocks: [],
      });
    } catch {
      /* ignore cleanup */
    }
    return true;
  } catch {
    return false;
  }
}

function withSort(blocks) {
  return blocks.map((block, sortOrder) => ({ ...block, sortOrder }));
}

async function savePage(meta, blocks) {
  const pages = await api('admin/cms/pages');
  const previous = pages.find((page) => page.slug === meta.slug);
  const body = {
    name: meta.name,
    slug: meta.slug,
    locale: 'vi-VN',
    isActive: true,
    targetDevice: 'ALL',
    seo: {
      title: meta.title + ' | Heartlock',
      description: meta.title + ' — thông tin hỗ trợ khách hàng Heartlock.',
      keywords: meta.slug.replaceAll('-', ', '),
      canonicalUrl: '/' + meta.slug,
      imageUrl: '',
    },
    blocks: withSort(blocks),
  };
  const page = await api('admin/cms/pages' + (previous ? '/' + previous.id : ''), previous ? 'PUT' : 'POST', body);
  await api('admin/cms/pages/' + page.id + '/publish', 'POST');
  process.stdout.write('PAGE ' + meta.slug + '\n');
  return page;
}

const useText = await supportsTextBlock();
process.stdout.write('TEXT_BLOCK=' + useText + '\n');

for (const meta of FOOTER_PAGES) {
  const blocks = useText
    ? [thesisBlock('TEXT_BLOCK', { title: meta.title, content: meta.body })]
    : [thesisBlock('PRODUCT_EXPANDABLE_DESCRIPTION', { title: meta.title, description: meta.body, maxCollapsedLines: 12 })];
  await savePage(meta, blocks);
}

const footer = {
  newsletterHeading: 'Đăng ký nhận tin',
  newsletterSubHeading: 'Nhận ưu đãi và bộ sưu tập mới từ Heartlock',
  copyrightText: '© ' + new Date().getFullYear() + ' Heartlock. All rights reserved.',
  socialLinks: [
    { platform: 'Facebook', displayName: 'Facebook Heartlock', url: 'https://facebook.com', orderIndex: 0 },
    { platform: 'Instagram', displayName: 'Instagram Heartlock', url: 'https://instagram.com', orderIndex: 1 },
    { platform: 'TikTok', displayName: 'TikTok Heartlock', url: 'https://tiktok.com', orderIndex: 2 },
    { platform: 'YouTube', displayName: 'YouTube Heartlock', url: 'https://youtube.com', orderIndex: 3 },
  ],
  menuColumns: [
    {
      title: 'Chăm sóc khách hàng',
      orderIndex: 0,
      items: [
        { label: 'FAQs & Liên hệ', url: '/faqs-lien-he', orderIndex: 0 },
        { label: 'Tra cứu đơn hàng', url: '/tra-cuu-don-hang', orderIndex: 1 },
        { label: 'Hướng dẫn đo size', url: '/huong-dan-do-size', orderIndex: 2 },
        { label: 'Hướng dẫn bảo dưỡng trang sức', url: '/huong-dan-bao-duong', orderIndex: 3 },
        { label: 'Hướng dẫn đăng ký/đăng nhập', url: '/huong-dan-dang-ky-dang-nhap', orderIndex: 4 },
        { label: 'Hướng dẫn mua hàng & thanh toán', url: '/huong-dan-mua-hang-thanh-toan', orderIndex: 5 },
        { label: 'Hướng dẫn đổi hàng/hoàn tiền', url: '/huong-dan-doi-hang-hoan-tien', orderIndex: 6 },
        { label: 'Cá nhân hóa & quà tặng', url: '/ca-nhan-hoa-qua-tang', orderIndex: 7 },
        { label: 'Gợi ý chọn trang sức', url: '/stylist', orderIndex: 8 },
      ],
    },
    {
      title: 'Chính sách hỗ trợ',
      orderIndex: 1,
      items: [
        { label: 'Thanh toán', url: '/chinh-sach-thanh-toan', orderIndex: 0 },
        { label: 'Trả góp', url: '/chinh-sach-tra-gop', orderIndex: 1 },
        { label: 'Giao nhận', url: '/chinh-sach-giao-nhan', orderIndex: 2 },
        { label: 'Đổi hàng/hoàn tiền', url: '/chinh-sach-doi-hang-hoan-tien', orderIndex: 3 },
        { label: 'Bảo hành', url: '/chinh-sach-bao-hanh', orderIndex: 4 },
        { label: 'Bảo mật', url: '/chinh-sach-bao-mat', orderIndex: 5 },
        { label: 'Nâng cấp sản phẩm', url: '/nang-cap-san-pham', orderIndex: 6 },
        { label: 'Cộng tác viên', url: '/cong-tac-vien', orderIndex: 7 },
      ],
    },
    {
      title: 'Đặc quyền thành viên',
      orderIndex: 2,
      items: [
        { label: 'Đăng ký', url: '/dang-ky', orderIndex: 0 },
        { label: 'Gia nhập Heartlock Keyholder', url: '/gia-nhap-keyholder', orderIndex: 1 },
      ],
    },
    {
      title: 'Về chúng tôi',
      orderIndex: 3,
      items: [
        { label: 'Về Heartlock', url: '/ve-chung-toi', orderIndex: 0 },
        { label: 'Tin tức và xu hướng', url: '/tin-tuc-xu-huong', orderIndex: 1 },
        { label: 'Sự kiện và hợp tác', url: '/su-kien-hop-tac', orderIndex: 2 },
        { label: 'Cơ hội nghề nghiệp', url: '/co-hoi-nghe-nghiep', orderIndex: 3 },
        { label: 'Hệ thống cửa hàng', url: '/he-thong-cua-hang', orderIndex: 4 },
      ],
    },
  ],
};

await api('admin/cms/footer', 'PUT', footer);
const live = await api('storefront/cms/site-layout', 'GET', undefined, false);
process.stdout.write(JSON.stringify({
  ok: true,
  textBlock: useText,
  footerColumns: live?.footer?.menuColumns?.map((column) => ({
    title: column.title,
    items: column.items?.map((item) => item.url),
  })),
  sample: await api('storefront/cms/pages/chinh-sach-bao-mat', 'GET', undefined, false).then((page) => ({
    slug: page.slug,
    blocks: page.blocks?.map((block) => block.type),
  })),
}, null, 2) + '\n');
