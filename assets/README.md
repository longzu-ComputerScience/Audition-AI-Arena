# Photo asset processing record

Drive files are archived separately from runtime derivatives. The user replaced `sources/drive/guoc-moc-layer.png`; its current bytes are preserved and the previous download hash/size remain recorded under `originalDownload`. This local revision is not represented as a new remote download. Editorial/Lookbook mappings remain intact.

## Exact downloads

| Drive path | Drive file ID | Bytes | Original |
|---|---|---:|---|
| Images/Layer/Phụ kiện/accent-non-la-layer.png | `1vTR3wqlRrFe7GJeOgYqBJStHZ_Y6i93_` | 543615 | [accent-non-la-layer.png](sources/drive/accent-non-la-layer.png) |
| Images/Layer/Phụ kiện/accent-quai-thao-mini-layer.png | `1jcsMgjAuWaMZt7_vO3NE7LFbtRhEFLLW` | 811283 | [accent-quai-thao-mini-layer.png](sources/drive/accent-quai-thao-mini-layer.png) |
| Images/Layer/Phụ kiện/accent-silver-jewelry-layer.png | `1L1rGdRvJxWBqKzUzn8jK1hCq1tCPVqNq` | 497274 | [accent-silver-jewelry-layer.png](sources/drive/accent-silver-jewelry-layer.png) |
| Images/Layer/Phụ kiện/accent-y2k-shades-layer.png | `1iWkxuMhVEyZbj_KFnMnJm0uATQqEUCtD` | 194794 | [accent-y2k-shades-layer.png](sources/drive/accent-y2k-shades-layer.png) |
| Images/Layer/Áo/ao-nhat-binh-layer.png | `1D3J3kPK7acEUaCqXuqWy3GfERzq3TD15` | 8042837 | [ao-nhat-binh-layer.png](sources/drive/ao-nhat-binh-layer.png) |
| Images/Layer/Áo/AoDai-layer.jpg | `1iZg7wnJVjTiguK4Psj3-pqsELg2QGwGF` | 115745 | [AoDai-layer.jpg](sources/drive/AoDai-layer.jpg) |
| Images/Layer/Áo/AoNguThan-layer.jpg | `1NXKlD7zFg9bMQOVSlKiokOZpF37wzliC` | 97644 | [AoNguThan-layer.jpg](sources/drive/AoNguThan-layer.jpg) |
| Images/Layer/Áo/AoTac-layer.png | `1Csfgw0Mo367bUl8v6AsuwTzeXU_LAgmA` | 777326 | [AoTac-layer.png](sources/drive/AoTac-layer.png) |
| Images/Layer/Áo/AoTuThan-layer.jpg | `1qSlcwBdXA8wRjNNgxc6pOms1wVx_Q3XX` | 146712 | [AoTuThan-layer.jpg](sources/drive/AoTuThan-layer.jpg) |
| Images/Layer/Túi/bag-gam-layer.png | `1OZYstPbox2zlObAKX2kwc3LO82JoecJx` | 2778343 | [bag-gam-layer.png](sources/drive/bag-gam-layer.png) |
| Images/Layer/Túi/bag-techwear-crossbody-layer.png | `13Lzs_gsWEAbccBGAkfT2L1oodRXdfYQo` | 583774 | [bag-techwear-crossbody-layer.png](sources/drive/bag-techwear-crossbody-layer.png) |
| Images/Layer/Túi/bag-tote-linen-layer.png | `1NW8TKU6vV3Zbi_yO29-zU-5-d5Ok7Uho` | 758091 | [bag-tote-linen-layer.png](sources/drive/bag-tote-linen-layer.png) |
| Images/Layer/Giày/guoc-moc-layer.png | `1qjVKXWP95aARS_KDLr29BHc0KBRNdc3w` | 1274772 | [guoc-moc-layer.png](sources/drive/guoc-moc-layer.png) |
| Images/Layer/Quần/quan-lua-layer.png | `1bTss4mq2Eqwaqp1-Vpb9nPTDJf_EDDgR` | 5136767 | [quan-lua-layer.png](sources/drive/quan-lua-layer.png) |
| Images/Layer/Quần/QuanDenim-layer.png | `1sTkxS3FRSexyrIwGjWLs-21mE_luH9gs` | 1082116 | [QuanDenim-layer.png](sources/drive/QuanDenim-layer.png) |
| Images/Layer/Quần/QuanTay-layer.png | `1yGIsXbKlNOjtq_hw7xXZx84mfrfEfamQ` | 5531524 | [QuanTay-layer.png](sources/drive/QuanTay-layer.png) |
| Images/Layer/Giày/shoes-chunky-loafer-layer.png | `1o2RX9n-OcSjgoadkcg7XM0yJF46SqXlH` | 550414 | [shoes-chunky-loafer-layer.png](sources/drive/shoes-chunky-loafer-layer.png) |
| Images/Layer/Giày/shoes-retro-sneaker-layer.png | `1-bOxEPKP0W-eZDMckOK2Zz3neHto64UH` | 707799 | [shoes-retro-sneaker-layer.png](sources/drive/shoes-retro-sneaker-layer.png) |
| Images/Túi/TuiGam.png | `1vGHZpo586kC6qk_yqY4545JrM2Mx09Wb` | 5427809 | [TuiGam.png](sources/drive/TuiGam.png) |

## Runtime derivatives

Three JPEG garments were segmented offline. Two existing garment cutouts and twelve baseline support cutouts were reused; the updated Guoc Moc layer is derived directly from the preserved user revision. Layers are cropped by real alpha bounds and uniformly resized. Original masks for Nhật Bình and Tấc and the original downloaded Guoc Moc are archived in `sources/baseline/`.

| Catalog ID | PNG dimensions | Input | Recolor mask |
|---|---|---|---|
| `ao-nhat-binh` | 994 × 1200 | `assets/sources/baseline/ao-nhat-binh.png` | yes |
| `ao-tac` | 813 × 975 | `assets/sources/baseline/ao-tac.png` | yes |
| `ao-dai` | 713 × 1044 | `assets/sources/drive/AoDai-layer.jpg` | yes |
| `ao-tu-than` | 679 × 1041 | `assets/sources/drive/AoTuThan-layer.jpg` | yes |
| `ao-ngu-than` | 724 × 909 | `assets/sources/drive/AoNguThan-layer.jpg` | yes |
| `bottom-silk-wide` | 363 × 800 | `assets/sources/baseline/quan-lua.png` | no |
| `bottom-tailored-trousers` | 285 × 800 | `assets/sources/baseline/bottoms/bottom-tailored-trousers.png` | no |
| `bottom-raw-denim` | 458 × 800 | `assets/sources/baseline/bottoms/bottom-raw-denim.png` | no |
| `shoes-guoc-moc` | 800 × 516 | `assets/sources/drive/guoc-moc-layer.png` | no |
| `shoes-chunky-loafer` | 800 × 513 | `assets/sources/baseline/shoes/shoes-chunky-loafer.png` | no |
| `shoes-retro-sneaker` | 800 × 524 | `assets/sources/baseline/shoes/shoes-retro-sneaker.png` | no |
| `bag-gam-vintage` | 698 × 800 | `assets/sources/baseline/bags/bag-gam-vintage.png` | no |
| `bag-tote-linen` | 652 × 800 | `assets/sources/baseline/bags/bag-tote-linen.png` | no |
| `bag-techwear-crossbody` | 644 × 800 | `assets/sources/baseline/bags/bag-techwear-crossbody.png` | no |
| `accent-non-la` | 800 × 430 | `assets/sources/baseline/accessories/accent-non-la.png` | no |
| `accent-quai-thao-mini` | 633 × 800 | `assets/sources/baseline/accessories/accent-quai-thao-mini.png` | no |
| `accent-y2k-shades` | 800 × 190 | `assets/sources/baseline/accessories/accent-y2k-shades.png` | no |
| `accent-silver-jewelry` | 800 × 720 | `assets/sources/baseline/accessories/accent-silver-jewelry.png` | no |

All eighteen files passed PNG decoding, transparency, alpha bounds, measured aspect ratio and fitting validation. All five masks passed coverage, dimensions and spill checks. No catalog item lacks a valid photo asset.

## Duplicate candidates skipped

These four files have the same filename and size as the Layer copies. Their remote binaries were not downloaded or hash-compared; binary equality is not claimed.

| Drive path | Drive file ID | Layer counterpart |
|---|---|---|
| Images/Phụ kiện/accent-y2k-shades-layer.png | `1kZmpMWGqdQwfhRyA-Gbye_Y3j3KYoEgd` | Images/Layer/Phụ kiện/accent-y2k-shades-layer.png |
| Images/Phụ kiện/accent-silver-jewelry-layer.png | `1l-XTdgO8nrTD05ja3ckpZCsCITS-1xIL` | Images/Layer/Phụ kiện/accent-silver-jewelry-layer.png |
| Images/Phụ kiện/accent-quai-thao-mini-layer.png | `1mqg24W91GgoZf0iJMWWJ74mb-RYFX4Ei` | Images/Layer/Phụ kiện/accent-quai-thao-mini-layer.png |
| Images/Phụ kiện/accent-non-la-layer.png | `1NxPSaEfclTWZX7--KLqQwlK_4qL9vvR7` | Images/Layer/Phụ kiện/accent-non-la-layer.png |

Full hashes, processing inputs, crop/resize transforms, mask hashes and source IDs are in [download-provenance.json](download-provenance.json), [photoAssetMetadata.json](../src/data/photoAssetMetadata.json) and [driveAssetManifest.json](../src/data/driveAssetManifest.json).
