import { test, expect, Page } from '@playwright/test';
import fs from 'node:fs';
import { CORE_ITEMS, SUPPORT_ITEMS } from '../../src/data/mockFashionData';
import { getCoreGarmentDemoMedia, getCoreGarmentLookbook } from '../../src/data/demoImageMap';
import { computeActualRemix } from '../../src/utils/fashionCalculations';
async function screenshot(page:Page,path:string){
  fs.mkdirSync('artifacts/visual',{recursive:true});
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(400);
  await page.screenshot({path,fullPage:true});
}

async function welcome(page:Page) {
  await page.goto('/');
  await page.getByRole('button',{name:'Đã Hiểu',exact:true}).click();
  await expect(page.locator('main img[alt^="Ảnh tách nền trang phục"]')).toHaveCount(5);
  const previews=await page.locator('main img[alt^="Ảnh tách nền trang phục"]').evaluateAll(images=>images.map(i=>i.getAttribute('src')));
  expect(previews.every(p=>p?.startsWith('/images/layers/ao-'))).toBe(true);
}
async function studio(page:Page) {
  await welcome(page);
  await expect(page.locator('header nav button').nth(1)).toBeDisabled();
  await page.getByRole('button',{name:'Bỏ qua giới thiệu',exact:true}).click();
  await page.locator('#select-core-garment').selectOption('ao-dai');
  await page.locator('#select-occasion').selectOption({label:'Sự kiện trang trọng'});
  await expect(page.locator('[data-page="discovery"] img[alt^="Ảnh tách nền trang phục"]')).toHaveAttribute('src','/images/layers/ao-dai.png');
  await page.getByRole('button',{name:/Tiếp tục chọn phong cách/}).click();
  await page.getByRole('button',{name:'Vào Remix Studio',exact:true}).click();
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('href',/^blob:/);
}
test('existing journey, manual locks, dial, optional accent and navigation',async({page},info)=>{
  const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
  await studio(page);
  await expect(page.locator('#photo-layer-accent image')).toHaveAttribute('href',/accent-/);
  await page.getByRole('button',{name:/Tủ Đồ Phối Kèm/}).click();
  await page.getByRole('button',{name:'Gỡ bỏ phụ kiện',exact:true}).click();
  await expect(page.locator('#photo-layer-accent')).toHaveCount(0);
  await page.getByRole('button',{name:'Thay đổi',exact:true}).nth(0).click();
  await page.getByRole('option',{name:/Raw Denim/}).click();
  await expect(page.locator('#photo-layer-bottom image')).toHaveAttribute('href',/bottom-raw-denim/);
  const actual=Number(await page.locator('#remix-dial-slider').inputValue());
  expect(actual).toBeGreaterThan(15);
  await page.getByRole('button',{name:'+ Thêm phụ kiện',exact:true}).click();
  await expect(page.locator('#photo-layer-accent image')).toHaveAttribute('href',/accent-/);
  await page.getByRole('button',{name:'Gỡ bỏ phụ kiện',exact:true}).click();
  await expect(page.locator('#photo-layer-accent')).toHaveCount(0);
  await page.locator('header nav button').nth(0).click();
  await page.locator('#select-location').selectOption({label:'Phố cổ Hội An'});
  await page.locator('#select-core-garment').selectOption('ao-tu-than');
  await page.locator('header nav button').nth(2).click();
  await expect(page.locator('#photo-layer-bottom image')).toHaveAttribute('href',/bottom-raw-denim/);
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('href',/^blob:/);
  await expect(page.getByRole('radiogroup',{name:'Chế độ hiển thị mannequin'})).toHaveCount(0);
  await expect(page.getByText('Photo Layers (Demo)',{exact:true})).toHaveCount(0);
  await page.locator('header nav button').nth(1).click();
  await page.locator('header nav button').nth(2).click();
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('href',/^blob:/);
  await page.locator('#remix-dial-slider').fill('100');
  await expect(page.locator('#photo-layer-bottom image')).toHaveAttribute('href',/bottom-raw-denim/);
  await expect(page.locator('#photo-layer-bag image')).toHaveAttribute('href',/techwear/);
  await expect(page.locator('#photo-layer-accent')).toHaveCount(0);
  fs.mkdirSync('artifacts/visual',{recursive:true});
  await screenshot(page,`artifacts/visual/studio-${info.project.name}.png`);
  const swatch=page.getByRole('radio',{name:/Chọn màu/}).nth(1);
  const hex=(await swatch.getAttribute('title'))!.match(/#[0-9A-Fa-f]{6}/)![0];
  await swatch.click();
  await page.locator('header nav button').nth(1).click();
  await expect(page.locator('main')).toContainText(hex);
  await page.locator('header nav button').nth(0).click();
  await expect(page.locator('#select-core-garment')).toBeVisible();
  await screenshot(page,`artifacts/visual/discovery-${info.project.name}.png`);
  await page.getByRole('button',{name:/Back — Quay lại phần giới thiệu/}).click();
  await expect(page.locator('main img[alt^="Ảnh tách nền trang phục"]')).toHaveCount(5);
  fs.mkdirSync('artifacts/visual',{recursive:true});
  await screenshot(page,`artifacts/visual/journey-${info.project.name}.png`);
  expect(errors).toEqual([]);
});
test('all five Page 1 previews are isolated garments; galleries and Lookbook retain editorial photos',async({page},info)=>{
  await welcome(page);
  await page.getByRole('button',{name:'Bỏ qua giới thiệu',exact:true}).click();
  for(const core of Object.values(CORE_ITEMS)){
    await page.locator('#select-core-garment').selectOption(core.id);
    const image=page.locator('[data-page="discovery"] img[alt^="Ảnh tách nền trang phục"]');
    await expect(image).toHaveAttribute('src',`/images/layers/${core.id}.png`);
    await expect.poll(()=>image.evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);
    await screenshot(page,`artifacts/visual/preview-${core.id}-${info.project.name}.png`);
    await page.getByRole('button',{name:'Hồ sơ cổ phục',exact:true}).click();
    const sources=await page.getByRole('dialog').locator('img').evaluateAll(images=>images.map(i=>i.getAttribute('src')));
    expect(sources).toContain(getCoreGarmentDemoMedia(core.id)!.gallery[0].src);
    expect(sources).toContain(getCoreGarmentLookbook(core.id)!.src);
    expect(sources.every(s=>!s?.includes('/images/layers/'))).toBe(true);
    await page.getByRole('button',{name:'Đóng bảng chi tiết',exact:true}).click();
  }
});
test('complete onboarding confirms all three fields and unlocks Concept',async({page})=>{
  await welcome(page);
  const card=page.locator('main button').filter({hasText:'VPR-AD-1930'});
  await card.click();
  await page.getByRole('button',{name:/Sự kiện trang trọng/}).click();
  await page.getByRole('button',{name:/Đại Nội Huế/}).click();
  await expect(page.getByRole('button',{name:'Vào Remix Studio',exact:true})).toBeVisible();
  await expect(page.locator('header nav button').nth(2)).toBeDisabled();
  await page.getByRole('button',{name:'Vào Remix Studio',exact:true}).click();
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('href',/^blob:/);
});
test('AI receives the current snapshot and applies a valid suggestion only on request',async({page})=>{
  let snapshot:any;
  await page.route('**/api/ai-status',route=>route.fulfill({json:{isAvailable:true,hasApiKey:true}}));
  await page.route('**/api/ai-stylist',route=>{
    snapshot=route.request().postDataJSON();
    return route.fulfill({json:{success:true,modelUsed:'Local Context Stylist',review:'Gợi ý tại máy để kiểm tra hợp đồng giao diện.',recommendations:[],
      suggestedItems:[{category:'bottom',itemId:'bottom-raw-denim',itemName:'Raw Denim Baggy Cạp Cao',reason:'Kiểm tra thao tác áp dụng rõ ràng.'}]}});
  });
  await studio(page);
  const before=await page.locator('#photo-layer-bottom image').getAttribute('href');
  await page.locator('#ai-stylist-input').fill('Kiểm tra ngữ cảnh hiện tại');
  await page.getByRole('button',{name:'Tư vấn',exact:true}).click();
  await expect(page.getByText('Gợi ý tại máy',{exact:true})).toBeVisible();
  expect(snapshot.coreId).toBe('ao-dai');expect(snapshot.occasion).toBe('Sự kiện trang trọng');
  const byId=(slot:'bottom'|'shoes'|'bag')=>SUPPORT_ITEMS[slot].find(i=>i.id===snapshot[`${slot}Id`])!;
  const accent=SUPPORT_ITEMS.accent.find(i=>i.id===snapshot.accentId);
  expect(accent).toBeDefined();
  expect(snapshot.actualRemix).toBe(computeActualRemix({bottom:byId('bottom'),shoes:byId('shoes'),bag:byId('bag'),accent:accent!}));
  expect(snapshot.targetRemix).toBe(Number(await page.locator('#remix-dial-slider').inputValue()));
  await expect(page.locator('#photo-layer-bottom image')).toHaveAttribute('href',before!);
  await page.getByRole('button',{name:'Áp dụng món này',exact:true}).click();
  await expect(page.locator('#photo-layer-bottom image')).toHaveAttribute('href',/bottom-raw-denim/);
  await expect(page.getByRole('button',{name:'Đã chọn',exact:true})).toBeDisabled();
});
