# CrabShare Docs

Trang tài liệu tiếng Việt cho dự án CrabShare, tham khảo bố cục của [FAIP Docs](https://docs.faip.pro/index.html#section-school).

## Chạy dự án

Yêu cầu Node.js 20 trở lên. Chạy và build website không cần cài thư viện.

```sh
node scripts/serve.mjs
```

Mở http://localhost:4173. Máy chủ chỉ lắng nghe trên máy cục bộ. Có thể đặt biến môi trường `PORT` để đổi cổng. Sau khi sửa mã nguồn, chạy lại build và tải lại trang.

```sh
node scripts/build.mjs
node --test
```

Thư mục `dist/` là website tĩnh hoàn chỉnh, có thể dùng với bất kỳ máy chủ static nào và hỗ trợ đặt trong thư mục con.

## Phát triển

Dự án dùng pnpm và `pnpm-lock.yaml` để quản lý công cụ định dạng. Prettier chỉ là công cụ phát triển, không được đưa vào website.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

| Lệnh                | Chức năng                                             |
| ------------------- | ----------------------------------------------------- |
| `pnpm build`        | Sinh website vào `dist/`                              |
| `pnpm test`         | Build và kiểm tra tài liệu, bảng, liên kết, file Word |
| `pnpm format`       | Định dạng JavaScript, CSS, JSON cấu hình và Markdown  |
| `pnpm format:check` | Kiểm tra định dạng mà không sửa file                  |
| `pnpm check`        | Kiểm tra định dạng, build và chạy toàn bộ test        |

Mã nguồn dùng UTF-8, xuống dòng LF và thụt lề 2 dấu cách (Python: 4). `.editorconfig`, `.gitattributes` và Prettier giữ các quy chuẩn này nhất quán. Dữ liệu sinh tự động trong `src/data/` không cần định dạng thủ công.

## Nội dung

Đủ 31 tài liệu TL-01 đến TL-31 và 219 bảng, được phân thành 5 nhóm. Các thẻ tổng quan là lối tắt đến 6 tài liệu nền tảng; thư viện bên dưới chứa đầy đủ 31 tài liệu.

- Đọc trực tiếp trên trình duyệt, có mục lục, điều hướng trước/sau, in và tải bản Word.
- Tìm theo mã, tiêu đề hoặc mô tả, hỗ trợ tiếng Việt không dấu. Tìm kiếm áp dụng cho toàn bộ thư viện, không tìm toàn văn.
- Tab hỗ trợ phím mũi tên, Home/End; nhấn `/` để tìm, Escape để xóa tìm kiếm.
- Liên kết nhóm có dạng `index.html#section-finance`, từng tài liệu có URL riêng như `docs/tl-01.html`.
- Giao diện responsive, bảng rộng cuộn ngang trong vùng riêng.

## Cấu trúc

```text
crabshare-docs/
├── public/
│   ├── documents/           31 bản Word gốc
│   └── favicon.svg
├── src/
│   ├── data/documents.json  Dữ liệu được sinh từ Word
│   ├── site.mjs             Mẫu trang chủ và trang đọc
│   ├── styles.css           Giao diện và kiểu in
│   └── app.js               Tab, tìm kiếm và mục lục
├── scripts/
│   ├── import-documents.py  Chuyển DOCX sang dữ liệu web
│   ├── build.mjs            Sinh website tĩnh
│   └── serve.mjs            Máy chủ local
├── tests/site.test.mjs      Kiểm tra nội dung và liên kết
├── package.json
└── pnpm-lock.yaml
```

## Cập nhật tài liệu

Chỉnh/thay bản Word trong `public/documents/` rồi chạy với Python 3.10 trở lên (chỉ dùng thư viện chuẩn):

```sh
python scripts/import-documents.py
node scripts/build.mjs
node --test
```

Cũng có thể truyền đường dẫn thư mục chứa đủ 31 file `TL-*.docx` vào script nhập. Script giữ thứ tự đoạn văn, tiêu đề, danh sách và bảng; giữ nguyên nội dung văn bản, không diễn giải lại các kết luận pháp lý. Bản Word tải về là nguồn gốc; giao diện đọc chuyển định dạng sang HTML và không mô phỏng phân trang của Word.

`.gitignore` loại trừ `dist/`, dependencies, cấu hình bí mật, file tạm và gói tài liệu hỗn hợp `Chuan_hoa (2)/`. Chỉ 31 tài liệu đã chọn được sao chép vào `public/documents/`; các tài liệu khác trong gói nguồn không được đưa lên website.
