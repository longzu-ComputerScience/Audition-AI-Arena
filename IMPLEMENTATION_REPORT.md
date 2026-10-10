# Việt Phục Remix — Báo cáo triển khai

> Báo cáo lịch sử cho lượt triển khai trước. Trạng thái repository, bản Guốc Mộc người dùng thay, release gate và kết quả kiểm tra mới nhất nằm trong [STABILIZATION_REPORT.md](STABILIZATION_REPORT.md); các thông tin branch/HEAD bên dưới không mô tả working tree hiện tại.

Ngày kiểm tra: 10/10/2026. Thư mục repository: `Audition-AI-Arena` trong workspace hiện tại.

## Repository

- Đã fetch và đối chiếu `HEAD` với `origin/main`: `4a62e4e32a4702d49338ee333b028387efd205cd`.
- Nhánh làm việc: `feat/context-outfit-photo-layers`.
- Working tree ban đầu sạch; không reset repository hoặc ghi đè thay đổi có sẵn của người dùng.
- Thay đổi đang nằm trong working tree của nhánh này, chưa commit/push hoặc triển khai.
- Bản tải thử của lượt kiểm tra Drive trước đã được dọn. Các bản tải trong `assets/sources/drive/` hiện nay là nguồn chính thức phục vụ yêu cầu triển khai, được giữ lại để tái tạo và kiểm tra nguồn gốc.

## Bộ đề xuất theo ngữ cảnh

Tìm kiếm toàn bộ 27 tổ hợp quần–giày–túi khi chưa bật accent, hoặc 108 tổ hợp khi accent đang bật. Đầu vào gồm áo, dịp, địa điểm, phong cách, màu vải chính và mục tiêu Remix. Mỗi chiều đều được kiểm tra có thể thay đổi bản phối thắng ở các ngưỡng phù hợp của catalog.

| Chiều chấm điểm | Trọng số | Lý do |
|---|---:|---|
| Khoảng cách Remix | 48% | Giữ ý nghĩa của dial; ưu tiên mức thực tế gần mục tiêu |
| Dịp sử dụng | 13% | Cân nhắc độ chỉn chu, di sản và nhu cầu di chuyển |
| Địa điểm | 7% | Tín hiệu phụ về không gian văn hóa, ngoài trời hoặc đô thị |
| Phong cách | 12% | Phân biệt thanh lịch, năng động, tối giản, hoài cổ và streetwear |
| Màu | 9% | Quan hệ hue, tương phản sáng/tối, độ bão hòa, sắc ấm/lạnh và diện tích món đồ |
| Tương thích áo | 7% | Cân nhắc phom áo và chi tiết cổ/ngực có thể bị phụ kiện che |
| Độ thống nhất bộ đồ | 4% | Tránh độ hiện đại giữa các món chênh lệch quá lớn |

Tổng trọng số bằng 100%. Điểm được chuẩn hóa; tổ hợp vượt quá khoảng cách gần nhất có thể đạt cộng 8 điểm Remix nhận hình phạt mềm tăng nhanh. Hysteresis 0,012 giữ bản phối hiện tại khi cải thiện không đáng kể. Trường hợp bằng điểm được phân xử ổn định theo khoảng cách rồi ID, không dùng ngẫu nhiên.

Các thành phố cung cấp tín hiệu nhẹ; không suy đoán thời tiết trực tiếp, nội quy địa điểm hoặc dress code cụ thể. Hà Nội, Huế, Đà Nẵng và TP. Hồ Chí Minh có thể cho kết quả giống nhau nếu các đầu vào còn lại giống nhau.

Actual Remix luôn là trung bình làm tròn của modernityScore các món hỗ trợ đang hoạt động, loại áo chính và accent null. Catalog rời rạc không thể đạt mọi mục tiêu; dial 0/100 vẫn giữ đúng mục tiêu người dùng, còn mức thực tế do đồ đang chọn quyết định.

Reducer cập nhật setup, đồ, mục tiêu và khóa thủ công cùng một lần. Món được chọn tay được giữ khi đổi áo/dịp/địa điểm/phong cách/màu. Chọn tay, thêm hoặc gỡ accent đồng bộ dial với mức thực tế. Khi người dùng thay đổi dial, các khóa được giải phóng để tìm lại bản phối. Accent bắt đầu null, giữ null qua thay đổi ngữ cảnh và dial, chỉ bật bằng thao tác rõ ràng.

Guardrail dùng chung nhóm dịp trang trọng và ngưỡng Actual Remix ≥80. Các quy tắc bảo vệ kết cấu áo tiếp tục hoạt động. Đánh giá Gemini không được hạ mức cảnh báo của quy tắc dùng chung. Gợi ý tại máy được ghi rõ nguồn, dùng cùng bộ chấm điểm và chỉ đề xuất ID có trong catalog. Áp dụng gợi ý vẫn cần nút thao tác của người dùng.

## Drive và xử lý ảnh

Danh sách toàn bộ thư mục/file đã quét nằm trong [drive-inventory.json](assets/drive-inventory.json). Danh sách **chính xác 19 file tải**, Drive ID, kích thước và đường dẫn gốc nằm trong [hồ sơ xử lý ảnh](assets/README.md); SHA-256 nằm trong [download-provenance.json](assets/download-provenance.json).

- Tải 18 file trong các nhánh `Images/Layer/` và `Images/Túi/TuiGam.png` để đối chiếu thiết kế túi.
- Giữ nguyên binary Drive trong `assets/sources/drive/`.
- Tái sử dụng 2 cutout áo và 13 cutout đồ hỗ trợ đã có; giữ bản trước tối ưu trong `assets/sources/baseline/`.
- Chuyển `AoDai-layer.jpg`, `AoTuThan-layer.jpg`, `AoNguThan-layer.jpg` thành PNG có alpha thật bằng GrabCut offline, loại vùng bóng rời, feather mép phía trong. Không xóa toàn cục pixel trắng, không tạo lại hoa văn hoặc dáng áo bằng ảnh sinh.
- Làm sạch vùng cổ mannequin trưng bày còn sót trong cutout Nhật Bình bằng vùng đo cụ thể.
- Crop theo alpha và resize đồng nhất, tối đa 1.200 px cho áo và 800 px cho món hỗ trợ.
- Bỏ qua 4 bản accessory layer ở `Images/Phụ kiện/` có tên/kích thước trùng bản trong `Images/Layer/Phụ kiện/`. Chưa tải/hash đối chiếu 4 bản này, nên chỉ ghi nhận ứng viên trùng, không khẳng định binary giống hệt.
- Tạo mới 3 mặt nạ cho Dài/Tứ Thân/Ngũ Thân, làm lại 2 mặt nạ Nhật Bình/Tấc. Mặt nạ cũ được lưu trong `assets/sources/baseline/masks/`.
- Đã decode và kiểm tra alpha, kích thước, bounds, SHA-256, mask coverage và spill của toàn bộ 18 lớp/5 mặt nạ. Không còn món catalog thiếu ảnh layer hợp lệ.

[driveAssetManifest.json](src/data/driveAssetManifest.json) giữ các entry editorial/catalog cũ và bổ sung 18 entry `photo-layer`, gồm Drive ID, nguồn xử lý, hash, crop/resize và mask. Thông số đo nằm trong [photoAssetMetadata.json](src/data/photoAssetMetadata.json).

## Mannequin và ghép lớp

Giữ một mannequin trong viewBox 300 × 600. Các mốc chung và fitting nằm trong [photoLayerFitting.ts](src/data/photoLayerFitting.ts); `layeredOutfitMap.ts` tiếp tục là entrypoint tương thích.

| Mốc | Tọa độ |
|---|---|
| Đầu | (150, 65) |
| Vai | (108, 134), (192, 134) |
| Khuỷu tay | (66, 208), (234, 208) |
| Cổ tay | (44, 280), (256, 280) |
| Bàn tay | (36, 294), (264, 294) |
| Eo/hông | (150, 248), (150, 280) |
| Cổ chân | (135, 535), (165, 535) |

Cổ ảnh áo được neo ở (150,105); gấu Nhật Bình/Tấc/Dài/Tứ Thân/Ngũ Thân lần lượt ở y=414/435/510/485/433. Quần neo eo y=248, gấu y=538; giày có baseline y=562. Scale đồng nhất giữ đúng tỉ lệ ảnh, không kéo giãn theo hai trục.

Tay SVG được kéo nhẹ về tư thế A tự nhiên. Khi ảnh áo sẵn sàng, tay SVG nằm dưới tay áo ảnh để tránh lộ cánh tay ở vị trí không khớp. Túi gấm neo tại cửa tay áo, có chi tiết ngón tay nhỏ ở quai; Dài dùng scale túi 0,8 để giữ trong khung. Nhật Bình/Tấc/Dài có carry anchor đo riêng, cùng một cơ thể và tư thế nền. Tote đặt ở vai phải, túi chéo theo hướng dây thật của nguồn. Giày được căn theo cặp chân; nón ở đầu, kính ở mắt, chuỗi bạc cắt vùng phía sau cổ áo, quai thao mini ở hông. Quần và giày nằm dưới áo; túi/accent nằm phía trước.

Toàn bộ 675 tổ hợp lý thuyết đã kiểm tra tự động trong trình duyệt. Đã xem ảnh 11 bản phối đại diện, gồm tất cả năm áo và các kiểu quần/giày/túi/accent. Không khẳng định đã xem riêng 675 ảnh bằng mắt.

Photo mặc định, kích hoạt khi các ảnh được chọn decode thành công và recolor khớp áo/màu hiện tại. Chưa sẵn sàng hoặc bị lỗi thì dùng SVG. Lỗi mặt nạ dùng SVG đúng màu người dùng chọn. Lựa chọn SVG/Photo được giữ qua đổi áo/màu và qua điều hướng giữa các bước.

## Đổi màu vải

Đã hỗ trợ cả năm áo. Mặt nạ alpha được áp dụng một lần; alpha ảnh gốc và pixel trang trí được bảo vệ. Độ sáng nguồn, nếp gấp và vùng sáng/bóng được giữ qua phép đổi màu. Mặt nạ Nhật Bình giữ cổ/bib, cổ tay, viền gấu, medallion và thêu; Dài giữ cụm hoa; Tứ Thân giữ dải lưng vàng và lớp lót trong; Ngũ Thân giữ viền cổ và các khuy; Tấc giữ nếp gấp của vải trơn.

Đã kiểm tra 30 cặp áo/màu trong canvas thật và xem bảng ảnh tương ứng:

- Mặc định: Nhật Bình `#8C2D19`, Tấc `#633B26`, Dài `#F4ECE1`, Tứ Thân `#4E3629`, Ngũ Thân `#8C3B24`.
- Xanh lam `#1D4E89`, đỏ son `#C23B22`, trắng/kem `#F5EFEB`, đen `#1A1817`, xanh ngọc `#267365` cho từng áo.

Kiểm tra pixel xác nhận alpha không đổi, vùng bảo vệ không bị nhuộm, vùng vải đổi màu và nếp gấp còn biến thiên sáng/tối. Thay áo/màu liên tục không hiển thị recolor của trạng thái cũ. Các swatch Studio đi qua cùng preferredColor với Concept, renderer và prompt AI.

Cache tối đa 8 ảnh kết quả bằng object URL, 10 ảnh nguồn/mặt nạ; gộp yêu cầu cùng key, thu hồi URL bị loại và giải phóng canvas sau encode. Chỉ preload ảnh đang chọn.

Ảnh là ghép 2D từ nguồn chụp cố định, không mô phỏng vải/ánh sáng/vật lý 3D hoặc màu nhuộm thực tế ngoài đời. Chi tiết được bảo vệ cố ý giữ màu nguồn.

## Preview và ranh giới giao diện

Đã kiểm tra năm card onboarding và lần lượt năm áo ở Page 1 trên desktop/mobile: đều dùng PNG trang phục tách nền; không dùng ảnh người mẫu toàn thân ở hai vị trí này. Giữ silhouette SVG khi ảnh lỗi.

Gallery hồ sơ cổ phục và Lookbook tiếp tục dùng nguồn editorial cũ, đã kiểm tra đường dẫn trong modal cho từng áo. `demoImageMap.ts`, ảnh `public/images/catalog/`, `public/images/demo/`, CSS, Header, ConceptReveal và LookbookModal không có diff. Không đổi layout, font, thương hiệu, số bước hoặc thêm control mới. Quần Tây giữ ID `bottom-tailored-trousers`; Cargo không trở lại catalog hoặc prompt.

## Code và kiểm chứng

Các nhóm file thay đổi:

- State/scoring: `src/App.tsx`, `src/utils/stylingState.ts`, `src/utils/outfitRecommendation.ts`, `src/utils/fashionCalculations.ts`, `src/data/mockFashionData.ts`.
- Renderer/preview: `MannequinCanvas.tsx`, `RemixStudio.tsx`, `InteractiveOnboarding.tsx`, `GarmentPreview.tsx`, `layeredOutfitMap.ts`, `photoLayerFitting.ts`, `photoAssetMetadata.json`.
- Recolor: `src/utils/fabricPixels.ts`, `src/utils/fabricRecolor.ts` và năm mặt nạ.
- AI contracts: `src/server/stylistService.ts`, `src/server/promptBuilder.ts`, `src/components/AIStylistPanel.tsx`, `src/types.ts`.
- Assets/provenance: 18 PNG layer, nguồn Drive/baseline, inventory/download provenance, manifest và `assets/README.md`.
- Kiểm thử: `tests/recommendation.test.ts`, `tests/fabric.test.ts`, `tests/ai-contract.test.ts`, `tests/browser/journey.spec.ts`, `tests/browser/photo.spec.ts`, `playwright.config.ts`.
- Công cụ: `tools/prepare-photo-assets.py`, `update-asset-provenance.py`, `validate-photo-assets.ts/.py`, `audit-layer-images.py`, `capture-photo-matrix.mjs`, `capture-baseline.mjs`, `make-visual-contact.py`, `visual-fixture.html/.tsx`.
- Dependency/docs: `package.json`, `package-lock.json`, `.gitignore`, `README.md`, báo cáo này. Cập nhật esbuild dev dependency để giải quyết peer dependency của Vite 8 và thêm Playwright cho kiểm thử. Không thay framework/runtime hoặc model Gemini/API key handling.

| Lệnh | Kết quả |
|---|---|
| `npm test` | 11/11 đạt, gồm matrix 21.175 ngữ cảnh, determinism, dial, manual locks, màu và AI contracts |
| `npm run test:assets` | 18 layer, 5 mask, 675 fitting combinations đạt |
| `npm run test:e2e` | 13/13 đạt; desktop và iPhone viewport Chromium, 675 outfit renders, 30 recolors, navigation và fallback |
| `npm run test:visual` | 11 outfit captures, 30 garment/color captures, mobile; không có browser exception |
| `node tools/capture-baseline.mjs` | Chụp renderer gốc ở HEAD đã đối chiếu, cho Nhật Bình và Tấc |
| `python tools/make-visual-contact.py` | Tạo bảng đối chiếu outfit, màu và trước/sau |
| `python tools/prepare-photo-assets.py --verify-repeatable` | Tái tạo từ nguồn lưu; kiểm tra hash 18 layer và 5 mask |
| `npm run lint` | TypeScript đạt |
| `npm run build` | Đạt; JS khoảng 571 kB, gzip khoảng 167 kB |
| `git diff --check` | Đạt |

Ảnh và log kiểm tra ở `artifacts/` được gitignore nhưng giữ tại máy để xem. [Bảng bản phối](artifacts/visual/outfits-contact.jpg), [bảng màu](artifacts/visual/colors-contact.jpg), [trước/sau](artifacts/visual/before-after.jpg), [Studio desktop](artifacts/visual/studio-desktop.png), [Studio mobile](artifacts/visual/studio-mobile.png), [onboarding](artifacts/visual/journey-desktop.png), [Page 1](artifacts/visual/discovery-desktop.png). Các ảnh Page 1 riêng từng áo có tên `preview-<core-id>-desktop/mobile.png`.

## Phân biệt trạng thái và giới hạn

- **Đã triển khai, kiểm thử và kiểm tra hình ảnh:** bộ đề xuất/state, 18 layer/5 mask, năm preview, ghép đồ đại diện, đổi màu, fallback, điều hướng desktop/mobile, giữ lựa chọn mode và gallery/Lookbook.
- **Đã triển khai, chưa xác minh qua dịch vụ thật:** request/prompt và chuẩn hóa kết quả Gemini. Unit và browser contract đã đạt; ca browser dùng response mô phỏng có ghi rõ nguồn. Môi trường không có API key nên chưa gọi Gemini Stylist hoặc tạo ảnh Gemini thật.
- **Chưa kiểm tra trên thiết bị thật:** Safari/iOS và các giới hạn RAM thực tế của điện thoại; kiểm tra mobile hiện dùng Chromium với viewport/device emulation.
- **Bị chặn bởi nguồn ảnh không phù hợp:** không có trong catalog hiện tại. 675 tổ hợp kiểm tra bằng máy; chỉ 11 bản phối đại diện được xem riêng bằng mắt.
- **Hoãn có lý do:** không tối ưu code splitting hoặc sửa cấu hình Vite ngoài phạm vi. Build có cảnh báo chunk >500 kB và `__dirname` trong cấu hình loader tương lai; không gây lỗi build hiện tại.
- **Chưa xuất bản:** chưa commit, push, merge hoặc deploy. Nhánh và working tree sẵn sàng để review.
