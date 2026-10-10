# Việt Phục Remix — Final submission stabilization

Ngày kiểm tra: 10/10/2026. Repo: `C:\Users\asus\Documents\GITHUB PROJECT\Viet-Phuc-Remix\Audition-AI-Arena`.

## A. Repository baseline

Branch được giữ nguyên: `feat/viet-phuc-remix-snapshot-20261010`. HEAD ban đầu: `f025053494c9852383cd82549a18cdfc5abb3b7b` (`feat: add context-aware outfits and complete photo layers`). Không reset, checkout nhánh khác, fetch, commit hoặc push trong lượt stabilization này.

Working tree ban đầu có đúng một thay đổi của người dùng: `assets/sources/drive/guoc-moc-layer.png`. Nguồn này được bảo toàn, SHA-256 trước và sau đều là `8e1aa4300717ea2f657a5cf5e9e52f3c47043474401995a4a662a86389191e4c`, 1,274,772 byte. Bản tải gốc trước khi người dùng thay cũng còn nguyên tại `assets/sources/baseline/shoes/shoes-guoc-moc.png`, hash `f651afd66e63870049fbeb5f6abca33c94a0c475f689b4962980a3f9849594b9`.

Baseline: lint/build và 11 unit tests qua; 13 E2E cũ qua. Asset validation thất bại vì provenance còn ghi nguồn Guốc Mộc cũ. Các kết quả E2E cũ không chứng minh hết flicker: đo theo khung hình tái hiện được lỗi.

## B. Root causes đã xác minh

| Hiện tượng | Nguyên nhân và bằng chứng |
|---|---|
| SVG → photo khi vào Studio | Recolor chỉ bắt đầu sau khi `MannequinCanvas` mount; state recolor ban đầu rỗng dù cache có kết quả. Renderer dùng SVG cho cả trạng thái đang chờ. Baseline lần đầu có 5 khung hình SVG nhìn thấy. |
| Đổi phụ kiện làm toàn bộ ảnh nháy | `primaryImagesReady` dùng `selectedConfigs.every(...)`, bao gồm túi/giày/phụ kiện. Chỉ một ảnh mới đang tải cũng vô hiệu hóa toàn bộ photo. Với túi bị trì hoãn 700 ms, baseline ghi 88 khung hình SVG. |
| Quay lại Discovery chậm | `AnimatePresence mode="wait"` bắt trang mới chờ exit 260–350 ms rồi mới mount và chạy entrance. 10 lần quay lại Page 1 có median 440.85 ms, khoảng 402.70–467.70 ms. Long task lớn nhất baseline 70 ms; thời gian exit nối tiếp là nguyên nhân trực tiếp của phần lớn độ trễ. Không quy toàn bộ độ trễ cho canvas. |
| Túi Gấm + Quai Thao Mini chồng nhau | Điểm carry Nhật Bình ở `[69,264]` khác A-pose mặc định, nhưng mini luôn giữ `[106,264]`; vùng alpha thực bị chồng. Điểm carry và scale của túi còn nằm trong renderer, khó dùng chung khi kiểm tra va chạm. |
| Cổ/búi tóc thiếu tự nhiên | Cằm ở y=91.5, cổ áo photo ở y=105; búi tóc nhô từ y=28 lên đầu bắt đầu y=39. Headwear/eyewear cần cùng dịch chuyển khi chỉnh đầu. |
| Guốc Mộc chưa đúng bản mới | Đối chiếu hình thực: nguồn mới có đế thấp; runtime/thumbnail vẫn là thiết kế đế cao cũ. Pipeline tổng lấy Guốc từ baseline, nên chạy lại toàn bộ sẽ tiếp tục bỏ qua nguồn người dùng thay. |
| Bối cảnh đổi nhưng outfit giữ nguyên | Không thấy sự kiện bị bỏ qua. Default Remix 15 có bộ truyền thống vượt xa ứng viên khác; khóa thủ công giới hạn các slot được đổi; hysteresis 0.012 giữ bộ hiện tại khi cải thiện nhỏ. Đây là những kết quả hợp lệ nhưng UI trước đây không giải thích. |

Các giả thuyết như GPU chậm hay một memory leak có sẵn không được kết luận là nguyên nhân nếu chưa có bằng chứng. Số lần React render trước/sau chưa được đo bằng React Profiler; việc giữ DOM ảnh và loại cập nhật geometry trùng được kiểm tra riêng.

## C. Implemented changes

### Photo readiness và cache

`preparePhotoOutfit` chuẩn bị đúng outfit đang chọn từ Page 2, gồm ảnh support và recolor cho đúng core/màu. Không preload 675 outfit. Một loader dùng chung đợi `Image.decode()`, chia sẻ promise và trạng thái qua `useSyncExternalStore`; cache giữ tối đa 24 resource khi tải ổn định. Các ảnh đang tải và lớp có subscriber được giữ tới khi có thể thu hồi.

Mỗi support slot có trạng thái riêng. Trong lúc tải, chỉ lớp đó chờ; core, các lớp khác và stage giữ nguyên. Core đọc recolor đã chuẩn bị ngay từ render đầu. Chờ core dùng hình nền trung tính trong stage cố định, không minh họa bộ đồ khác. Kết quả async cũ bị bỏ qua theo core/màu hiện tại. Lỗi thực dùng bản vẽ tương ứng cho riêng lớp lỗi và có thông báo; chọn lại sau khi nguồn phục hồi có thể retry.

Cache recolor giữ 8 kết quả; URL đang dùng có lease để tránh revoke khi còn hiển thị, URL bị loại được revoke. Vòng pixel dùng cùng thuật toán cũ nhưng chia thành các đoạn nhỏ và nhường main thread khi quá ngân sách 8 ms. Thanh trạng thái cao cố định 32 px. Callback geometry phụ thuộc ID từng món, giữ state cũ nếu số đo không đổi.

### Fitting và anatomy

Giữ viewBox `300 × 600`, cổ áo và vai của cả năm core. Đầu dịch xuống 8 đơn vị; cằm mới y=99.5, búi tóc nhỏ hơn; cổ ngắn tương ứng. Nón Lá và kính photo/bản vẽ dự phòng dịch theo đầu. Chain bạc được clip dưới cổ; riêng Nhật Bình, áo occlude phần chain cạnh cổ thêu thay vì phủ chi tiết cổ.

Túi Gấm dùng carry theo core và scale đồng đều, đưa cấu hình vào `getOutfitLayerConfig`. Tote giữ điểm mang vai hiện có. Crossbody dùng điểm đầu dây đo gần 83% chiều ngang và vai phải chuẩn, chiều cao vùng nhìn thấy 164. Mini thử các vị trí có khoảng cách 6 đơn vị với vùng alpha của túi: hông đối diện `[190,264]`, hoặc vị trí treo thấp `[106,318]` / `[190,318]` khi túi chéo chiếm hai bên. Thêm dây nối từ eo đến mini. Không xóa phụ kiện đã chọn và không kéo giãn riêng hai trục.

Chỉ tái tạo hai derivative Guốc Mộc, qua `python tools/prepare-photo-assets.py --only-guoc`: runtime PNG `800 × 516`, thumbnail WebP tương ứng; giữ alpha thật và màu/đế/quai nguồn. Metadata ghi input mới; provenance phân biệt bản thay tại máy với bản tải Drive gốc. Pipeline tổng cũng đọc override đã ghi, tránh vô tình quay lại Guốc cũ.

### Recommendation và navigation

Giữ nguyên trọng số, trait, catalogue, guardrail và hợp đồng AI. Decision trace cho biết context, locks, ranking, chosen/best score và lý do giữ bộ đồ. UI giải thích khóa / cải thiện nhỏ / bộ hiện tại còn đứng đầu. Nút **Phối lại tự động** là yêu cầu rõ ràng để bỏ khóa và chọn ứng viên tốt nhất, bỏ hysteresis chỉ trong hành động này; giữ target Remix và trạng thái accent `null`. Đổi bối cảnh bình thường vẫn tôn trọng món thủ công. Khi ID outfit không đổi, reducer giữ tham chiếu `items`.

Page transition dùng `popLayout` với ref DOM, trang mới vào flow ngay; trang thoát là `inert` và rời accessibility tree. Opacity của trang quay lại được khôi phục cả khi điều hướng nhanh. Entrance 180 ms và fade cục bộ vẫn còn, bỏ dịch chuyển y trong chuyển trang; không xóa animation intro/card. Reduced motion được áp dụng ở Concept/Studio. Scroll alignment của trang đến và state/form/unlocked steps được giữ.

Sau các release gate, đã bỏ mode switch SVG/Photo và chữ Demo. Photo là mặc định; SVG còn làm emergency fallback nội bộ.

### Exact changed files

| Nhóm | File |
|---|---|
| App/UI | `src/App.tsx`, `src/components/ConceptReveal.tsx`, `src/components/DiscoveryScreen.tsx`, `src/components/MannequinCanvas.tsx`, `src/components/RemixStudio.tsx` |
| Photo/state | `src/utils/photoImageCache.ts` (mới), `src/utils/preparePhotoOutfit.ts` (mới), `src/utils/fabricRecolor.ts`, `src/utils/outfitRecommendation.ts`, `src/utils/stylingState.ts`, `src/data/photoLayerFitting.ts` |
| Derivative/provenance | `public/images/layers/shoes/shoes-guoc-moc.png`, `public/images/catalog/shoes/shoes-guoc-moc.webp`, `src/data/photoAssetMetadata.json`, `src/data/driveAssetManifest.json`, `assets/download-provenance.json`, `assets/README.md` |
| Tests | `playwright.config.ts`, `tests/browser/journey.spec.ts`, `tests/browser/photo.spec.ts`, `tests/browser/stability.spec.ts` (mới), `tests/recommendation.test.ts` |
| Tools | `tools/prepare-photo-assets.py`, `tools/update-asset-provenance.py`, `tools/validate-photo-assets.ts`, `tools/validate-photo-assets.py`, `tools/capture-photo-matrix.mjs`, `tools/profile-stabilization.mjs` (mới), `tools/stabilization-contact-sheets.py` (mới), `tools/stabilization-diagnostics.ts` (mới), `tools/run-stabilization-qa.mjs` (mới) |
| Reports | `STABILIZATION_REPORT.md` (mới), chú thích lịch sử ở `IMPLEMENTATION_REPORT.md` |

Ảnh nguồn Guốc xuất hiện trong git diff vì thay đổi có sẵn của người dùng, không phải file Codex sửa. Không đổi `server.ts`, backend services/routes, models, keys, env files, dependencies, catalogue ID Quần Tây, gallery hay Lookbook.

## D. Visual verification

Baseline: [studio](artifacts/stabilization/before/studio-desktop.png), [năm core với túi/mini](artifacts/stabilization/before/contact.png). Ảnh đối chiếu sau: [năm core](artifacts/stabilization/after/contact.png).

Đã capture 11 outfit reference, 30 core/color, một mobile overview và 135 fitting view (5 core × 9 tổ hợp × desktop/laptop/mobile). Matrix: [matrix.json](artifacts/stabilization/visual/matrix.json). 15 sheet theo core/viewport và hai sheet tổng túi + mini nằm trong `artifacts/stabilization/visual/`.

Đã xem trực tiếp toàn bộ năm silhouette trên desktop/mobile/laptop, nón/kính/chain, tất cả bottoms/footwear/bags, cùng các nhóm mini + ba túi. [Túi + mini desktop](artifacts/stabilization/visual/contact-mini-bags-desktop.jpg), [mobile](artifacts/stabilization/visual/contact-mini-bags-mobile.jpg). Nhật Bình đã tách mini khỏi Túi Gấm; túi chéo dùng mini treo thấp có dây; Guốc mới có đế thấp và cùng baseline. Chain Nhật Bình được occlude một phần theo cổ thêu, có chủ ý.

Actual-app screenshots từ navigation/controls nằm tại `artifacts/visual/studio-{desktop,laptop-motion,mobile}.png`, `discovery-*.png`, `journey-*.png`, và `artifacts/stabilization/qa/app-*.png` / `rapid-*.png`. Đây là ứng dụng thực, bổ sung cho fixture; test fixture không được dùng làm bằng chứng duy nhất.

Không khẳng định toàn bộ 675 phối đồ đều tối ưu thẩm mỹ chỉ từ DOM test. Kết hợp ảnh 2D vẫn mang phối cảnh gốc của từng asset; dây túi chéo che một phần thân áo theo cách đeo đã chọn. Không tạo nguồn ảnh khác để thay đổi thiết kế.

## E. Tests và performance

| Kiểm tra | Kết quả |
|---|---|
| `npm run lint` | PASS |
| `npm run build` | PASS; JS 575.12 kB, gzip 168.36 kB. Cảnh báo chunk >500 kB và `__dirname` cho phiên bản Vite tương lai đã có từ baseline. |
| `npm test` | PASS, 12/12; gồm matrix 21,175 context và refresh/locks/hysteresis. |
| `npm run test:assets` | PASS: 18 PNG, 5 mask, 675 fitting/catalogue combinations; kiểm tra alpha, hash nguồn, aspect ratio, bounds, collision mini với ba túi. |
| `--only-guoc --verify-repeatable` | PASS: tái tạo Guốc cho hash y hệt, tất cả 23 layer/mask khác giữ nguyên. |
| `npm run test:e2e` | PASS, 45/45 trên QA server riêng: desktop, laptop normal motion và mobile Chromium. Gồm test hồi quy URL màu bị cache loại. |
| `npm run test:visual` | PASS: 11 references + 30 colors + mobile overview + 135 fitting views, không browser exception. |
| `git diff --check` | PASS |

E2E: desktop `1280 × 900` reduced motion, laptop `1366 × 768` normal motion, iPhone 13 Chromium `390 × 844` normal motion. Có native journey, manual locks, null accent, Quần Tây, dial extremes, color synchronization, AI snapshot/apply, delayed loads 500 ms cho từng slot, giữ cùng DOM ảnh/URL/stage height/opacity, rapid selections/colors, missing image, invalid PNG decode, failed canvas encoding, retry/recovery, headwear fallback, scoring từ các control thật.

QA server dùng `node tools/run-stabilization-qa.mjs` và `QA_BASE_URL=http://127.0.0.1:3001 npm run test:e2e`. Tool tạo bản server trong ignored artifacts từ đúng `server.ts`, chỉ thay đường dẫn import tương đối và tùy chọn Vite cho cache/socket riêng, tắt HMR/watch; giữ nguyên API handler thực. Server dev gốc không bị dừng. Một số lượt trước bị gián đoạn bởi hot reload hoặc socket dev xung đột; chỉ lượt cuối ổn định được tính là kết quả cuối.

Recommendation diagnostics: [92 trường hợp](artifacts/stabilization/qa/recommendation-diagnostics.json); 3 đổi chosen, 8 giữ do hysteresis trong bộ mẫu đã chọn. Ở target 51, Ngũ Thân, từ sự kiện trang trọng sang đi chơi cuối tuần: bộ Quần Tây + Loafer + Túi Gấm có score 0.84185293; Quần Lụa + Loafer + Tote đạt 0.85213847. Chênh lệch 0.01028554 nhỏ hơn 0.012 nên giữ bộ cũ; refresh áp dụng đúng bộ tốt nhất. Trace các control thực: `artifacts/stabilization/qa/context-*.json`.

Performance được đo trên app thật bằng Chrome normal motion, RAF/opacity >0.5, Long Task/Layout Shift observers và CDP heap sau GC. [Baseline](artifacts/stabilization/before/profile.json) và [đo cuối](artifacts/stabilization/final/profile.json). Trong 10 lượt quay lại Page 1 (5 từ Studio, 5 từ Concept), median first-visible giảm từ 440.85 ms xuống 77.00 ms. Lần vào Studio đầu, ảnh core hiện sau 303.90 ms so với 560.50 ms baseline; 0 khung hình SVG nhìn thấy ở cả 22 chuyển trang/đổi túi được lấy mẫu cuối. Khi trì hoãn ảnh Tote 700 ms, core photo vẫn ổn định và first-visible layer cập nhật ở 25.70 ms. Đây là browser-local latency, không phải cam kết về hosting hay thiết bị khác.

Sau 2 chu kỳ × 30 lựa chọn thật (5 core × 6 màu), heap sau GC là 20.06 MB và 20.43 MB; cache giữ 21/24 ảnh, 8/8 recolor, 0 in-flight và 8 URL hoạt động sau mỗi chu kỳ (tối đa quan sát 9 URL). Không ghi nhận layout shift ngoài thao tác người dùng. Long task lớn nhất là 94 ms khi điều hướng, 124 ms trong stress đổi màu; các quan sát này không chứng minh thời gian JS/render hay GPU trên máy khác. React render count và native/GPU memory không được instrument.

## F. Submission status

READY WITH DOCUMENTED LIMITATIONS — các release gate ảnh, layer, fallback, desktop/mobile, và kiểm thử regression đã qua. Không có blocker đã biết trong phạm vi local validation.

Giới hạn cần công bố: chưa có API key để kiểm tra live Gemini; unit/browser mocks kiểm tra hợp đồng và thao tác áp dụng, không chứng minh dịch vụ AI bên ngoài. Các viewport được kiểm tra bằng Chrome/Chromium, không thay thế test Safari trên thiết bị thật. Số đo localhost không cam kết cùng latency trên điện thoại cấu hình thấp hoặc hosting khác. Các cảnh báo build kể trên còn tồn tại, không làm build thất bại.
