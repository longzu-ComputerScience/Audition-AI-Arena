import { test, expect, Page, Locator } from '@playwright/test';
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
  await page.getByRole('button',{name:'Bỏ qua mở đầu',exact:true}).click();
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
  await page.getByRole('button',{name:'Bỏ qua mở đầu',exact:true}).click();
  for(const core of Object.values(CORE_ITEMS)){
    await page.locator('#select-core-garment').selectOption(core.id);
    const image=page.locator('[data-page="discovery"] img[alt^="Ảnh tách nền trang phục"]');
    await expect(image).toHaveAttribute('src',`/images/layers/${core.id}.png`);
    await expect.poll(()=>image.evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);
    await screenshot(page,`artifacts/visual/preview-${core.id}-${info.project.name}.png`);
    await page.getByRole('button',{name:/Back — Quay lại phần giới thiệu/}).click();
    await page.getByRole('button',{name:'Hồ sơ cổ phục: '+core.name,exact:true}).click();
    const sources=await page.getByRole('dialog').locator('img').evaluateAll(images=>images.map(i=>i.getAttribute('src')));
    expect(sources).toContain(getCoreGarmentDemoMedia(core.id)!.gallery[0].src);
    expect(sources).toContain(getCoreGarmentLookbook(core.id)!.src);
    expect(sources.every(s=>!s?.includes('/images/layers/'))).toBe(true);
    await page.getByRole('button',{name:'Đóng bảng chi tiết',exact:true}).click();
    await page.getByRole('button',{name:'Bỏ qua mở đầu',exact:true}).click();
  }
});

test('garment profiles are independent of selection, preserve scroll and remain keyboard accessible',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await welcome(page);
  const collection=page.locator('[data-garment-card="true"]').locator('..');
  const cards=page.locator('[data-garment-card="true"]');
  const profiles=cards.getByRole('button',{name:/^Hồ sơ cổ phục:/});
  await expect(cards).toHaveCount(5);
  await expect(profiles).toHaveCount(5);
  const footer=page.locator('footer');
  await expect(footer).toHaveText('Sắc Việt © 2026 · Fashion Editorial Styling Studio');
  await expect(footer.locator('button, span')).toHaveCount(0);
  await expect(footer.locator(':scope > *')).toHaveCount(1);
  expect(await footer.evaluate(element=>getComputedStyle(element).textAlign)).toBe('center');
  await expect(page.locator('button button')).toHaveCount(0);
  const scrollPosition=()=>page.evaluate(()=>({
    x:window.scrollX,y:window.scrollY,
    collectionScrollX:document.querySelector('[data-garment-card="true"]')?.parentElement?.scrollLeft,
  }));

  for(const [index,core] of Object.values(CORE_ITEMS).entries()){
    const selection=page.getByRole('button',{name:`Chọn ${core.name}`,exact:true});
    const card=cards.filter({has:selection});
    await expect(card.getByRole('heading',{name:core.name,exact:true})).toBeVisible();
    await expect(card.getByText(core.subTitle,{exact:true})).toBeVisible();
    await expect(card.getByText(core.editorialDescription,{exact:true})).toHaveCount(0);
    const profile=card.getByRole('button',{name:`Hồ sơ cổ phục: ${core.name}`,exact:true});
    await profile.scrollIntoViewIfNeeded();
    await profile.focus();
    const before=await scrollPosition();
    if(index%2===0) await page.keyboard.press('Enter');
    else await profile.click();
    const dialog=page.getByRole('dialog',{name:core.vietnameseTitle,exact:true});
    await expect(dialog).toBeVisible();
    const modalHeader=dialog.locator(':scope > div').first();
    await expect(modalHeader.locator('span')).toHaveText(['HỒ SƠ CỔ PHỤC']);
    await expect(modalHeader).not.toContainText(core.archiveCode);
    await expect(modalHeader).toContainText(core.era);
    await expect(dialog).not.toContainText(/\bphom\b/i);
    await expect(dialog).toContainText(core.editorialDescription);
    const modalBounds=(await dialog.boundingBox())!;
    expect(modalBounds.x).toBeGreaterThanOrEqual(0);
    expect(modalBounds.x+modalBounds.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    if(page.viewportSize()!.width>=1024) expect(modalBounds.width).toBeGreaterThan(900);
    expect(await dialog.evaluate(element=>element.scrollWidth<=element.clientWidth)).toBe(true);
    const content=dialog.locator('.heritage-profile-content');
    await content.evaluate(element=>element.scrollTo(0,element.scrollHeight));
    await expect(dialog.getByRole('button',{name:'Đóng bảng chi tiết',exact:true})).toBeInViewport();
    await expect(dialog.getByRole('button',{name:'Đóng bảng chi tiết',exact:true})).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('button',{name:'Đóng Hồ Sơ',exact:true})).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button',{name:'Đóng bảng chi tiết',exact:true})).toBeFocused();
    await page.mouse.wheel(0,500);
    expect(await scrollPosition()).toEqual(before);
    if(index%2===0) await page.keyboard.press('Escape');
    else await dialog.getByRole('button',{name:'Đóng bảng chi tiết',exact:true}).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(profile).toBeFocused();
    expect(await scrollPosition()).toEqual(before);
    await expect(selection).toHaveAttribute('aria-pressed','false');
    await expect(page.locator('[data-page="onboarding"] nav button').nth(1)).toBeDisabled();
    await expect(page.locator('main')).toHaveAttribute('data-active-step','1');
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  if((page.viewportSize()?.width ?? 0)>=1024){
    const positions=await cards.evaluateAll(elements=>elements.map(element=>element.getBoundingClientRect().top));
    expect(new Set(positions).size).toBe(1);
  }else{
    const geometry=await cards.evaluateAll(elements=>elements.map(element=>{
      const box=element.getBoundingClientRect();return {top:box.top,bottom:box.bottom,left:box.left};
    }));
    expect(new Set(geometry.map(box=>box.left)).size).toBe(1);
    for(let index=1;index<geometry.length;index++) expect(geometry[index].top).toBeGreaterThan(geometry[index-1].bottom);
    expect(await collection.first().evaluate(element=>element.scrollWidth<=element.clientWidth)).toBe(true);
    await expect(collection.first()).toHaveCSS('overflow-y','visible');
  }

  const selectDai=page.getByRole('button',{name:'Chọn Áo Dài',exact:true});
  await selectDai.scrollIntoViewIfNeeded();
  await selectDai.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{name:/Bạn dự định diện Áo Dài/})).toBeVisible();
  await page.locator('[data-page="onboarding"] nav button').nth(0).click();
  await expect(selectDai).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Hồ sơ cổ phục: Áo Tấc',exact:true}).click();
  await expect(page.getByRole('dialog',{name:CORE_ITEMS['ao-tac'].vietnameseTitle,exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Đóng Hồ Sơ',exact:true}).click();
  await expect(selectDai).toHaveAttribute('aria-pressed','true');
  await selectDai.click();
  await page.getByRole('button',{name:/Sự kiện trang trọng/}).click();
  await page.getByRole('button',{name:/Đại Nội Huế/}).click();
  await expect(page.getByRole('button',{name:'Vào Remix Studio',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Vào Remix Studio',exact:true}).click();
  await page.getByRole('button',{name:'Hồ sơ chi tiết →',exact:true}).click();
  const studioProfile=page.getByRole('dialog',{name:CORE_ITEMS['ao-dai'].vietnameseTitle,exact:true});
  await expect(studioProfile).toBeVisible();
  await expect(studioProfile.getByText('HỒ SƠ CỔ PHỤC',{exact:true})).toBeVisible();
  await expect(studioProfile.locator(':scope > div').first()).not.toContainText(CORE_ITEMS['ao-dai'].archiveCode);
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Giới thiệu',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('Triết Lý "Tiếp Biến Văn Hóa"');
  await page.getByRole('button',{name:'Đã Hiểu',exact:true}).click();
  expect(errors).toEqual([]);
});


test('garment exhibit has scoped depth, bounded mouse tilt and a complete reduced-motion view',async({page},info)=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await welcome(page);
  const shell=page.locator('.heritage-gallery-shell');
  const cards=page.locator('[data-garment-card="true"]');
  const surface=cards.first().locator('.heritage-card');
  await expect(shell).toHaveCount(1);
  await expect(cards).toHaveCount(5);
  const openingBackground=await shell.evaluate(element=>getComputedStyle(element).backgroundImage);
  expect(openingBackground).toContain('radial-gradient');
  expect(await page.locator('main').evaluate(element=>getComputedStyle(element).backgroundImage)).toBe(openingBackground);
  expect(await shell.evaluate(element=>getComputedStyle(element,'::before').animationDuration)).toBe('28s');
  expect(await shell.evaluate(element=>getComputedStyle(element,'::before').pointerEvents)).toBe('none');
  for(const card of await cards.all()){
    const image=card.locator('img');
    // Reveal each image in the page before checking its native lazy-load decode.
    await image.scrollIntoViewIfNeeded();
    await expect.poll(()=>image.evaluate((element:HTMLImageElement)=>element.complete&&element.naturalWidth>0)).toBe(true);
    await expect(image).toHaveCSS('object-fit','contain');
    await expect(image).toHaveCSS('filter','none');
    await expect(image).toHaveCSS('mix-blend-mode','normal');
    await expect(image).toHaveCSS('transform','none');
    const frame=card.locator('.heritage-photo-frame');
    await expect(frame).toHaveCSS('border-top-color','rgb(201, 173, 123)');
    expect(await frame.evaluate(element=>getComputedStyle(element).boxShadow)).toContain('inset');
    expect(await frame.evaluate(element=>getComputedStyle(element,'::before').pointerEvents)).toBe('none');
  }
  await cards.first().scrollIntoViewIfNeeded();
  await expect(cards.first()).toHaveCSS('transform','none');
  await screenshot(page,'artifacts/visual/exhibit-'+info.project.name+'.png');

  const hasMouse=await page.evaluate(()=>matchMedia('(hover: hover) and (pointer: fine)').matches);
  const bounds=(await cards.first().boundingBox())!;
  const moveOverCard=()=>page.mouse.move(bounds.x+bounds.width*0.8,bounds.y+bounds.height*0.25);
  await moveOverCard();
  if(hasMouse){
    await expect.poll(()=>surface.evaluate(element=>parseFloat((element as HTMLElement).style.getPropertyValue('--tilt-y')))).toBeGreaterThan(0);
    const tilt=await surface.evaluate(element=>({
      x:parseFloat((element as HTMLElement).style.getPropertyValue('--tilt-x')),
      y:parseFloat((element as HTMLElement).style.getPropertyValue('--tilt-y')),
    }));
    expect(Math.abs(tilt.x)).toBeLessThanOrEqual(2.5);
    expect(Math.abs(tilt.y)).toBeLessThanOrEqual(2.5);
    expect(await surface.evaluate(element=>getComputedStyle(element).transform)).not.toBe('none');
    await expect.poll(()=>surface.evaluate(element=>(element as HTMLElement).style.getPropertyValue('--highlight-visible'))).toBe('1');
    await page.mouse.move(4,4);
    await expect.poll(()=>surface.evaluate(element=>(element as HTMLElement).style.getPropertyValue('--tilt-y'))).toBe('');
    await expect(surface).toHaveCSS('transform','none');
    await moveOverCard();
  }else{
    expect(await surface.evaluate(element=>(element as HTMLElement).style.getPropertyValue('--tilt-y'))).toBe('');
    await expect(surface).toHaveCSS('transform','none');
    await cards.last().scrollIntoViewIfNeeded();
    expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(0);
    expect(await cards.first().evaluate(element=>element.parentElement!.scrollLeft)).toBe(0);
  }

  // Live preference changes cancel the active frame and leave a static, complete exhibit.
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(surface).toHaveCSS('transform','none');
  expect(await shell.evaluate(element=>getComputedStyle(element,'::before').animationName)).toBe('none');
  await expect.poll(()=>surface.evaluate(element=>(element as HTMLElement).style.getPropertyValue('--tilt-y'))).toBe('');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const daiProfile=page.getByRole('button',{name:'Hồ sơ cổ phục: Áo Dài',exact:true});
  await daiProfile.scrollIntoViewIfNeeded();
  if(hasMouse) await daiProfile.click();
  else await daiProfile.tap();
  await expect(page.getByRole('dialog',{name:CORE_ITEMS['ao-dai'].vietnameseTitle,exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  const daiSelection=page.getByRole('button',{name:'Chọn Áo Dài',exact:true});
  if(hasMouse) await daiSelection.click();
  else await daiSelection.tap();
  await expect(page.getByRole('heading',{name:/Bạn dự định diện Áo Dài/})).toBeVisible();
  await expect(shell).toHaveCount(0);
  expect(await page.locator('[data-page="onboarding"]').evaluate(element=>getComputedStyle(element).backgroundImage)).toBe('none');
  await page.locator('[data-page="onboarding"] nav button').nth(0).click();
  const selected=page.getByRole('button',{name:'Chọn Áo Dài',exact:true});
  await expect(selected).toHaveAttribute('aria-pressed','true');
  await expect(cards.filter({has:selected}).locator('.heritage-card')).toHaveCSS('border-top-color','rgb(143, 41, 37)');
  await page.getByRole('button',{name:'Bỏ qua mở đầu',exact:true}).click();
  await expect(page.locator('[data-page="discovery"]')).toBeVisible();
  await expect(shell).toHaveCount(0);
  await expect(page.locator('footer button')).toHaveCount(0);
  expect(await page.locator('main').evaluate(element=>getComputedStyle(element).backgroundImage)).toBe(openingBackground);
});


test('garment collection and landscape profiles fit 390px and 1440px',async({page},info)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [390,1440]){
    await page.setViewportSize({width,height:900});
    await welcome(page);
    const collection=page.locator('.heritage-collection');
    const cards=page.locator('[data-garment-card="true"]');
    await expect(cards).toHaveCount(5);
    await expect(page.getByText(/Vuốt ngang để xem/)).toHaveCount(0);
    await expect(page.getByRole('button',{name:/Xem áo (trước|tiếp theo)/})).toHaveCount(0);
    for(const core of Object.values(CORE_ITEMS)){
      const card=cards.filter({has:page.getByRole('heading',{name:core.name,exact:true})});
      await expect(card.getByText(core.archiveCode,{exact:false})).toHaveCount(0);
      await expect(card.locator('[title]')).toHaveCount(0);
    }
    const geometry=await cards.evaluateAll(elements=>elements.map(element=>{
      const box=element.getBoundingClientRect();return {left:box.left,top:box.top,bottom:box.bottom};
    }));
    if(width===1440){
      expect(new Set(geometry.map(box=>box.top)).size).toBe(1);
      expect(new Set(geometry.map(box=>box.left)).size).toBe(5);
    }else{
      expect(new Set(geometry.map(box=>box.left)).size).toBe(1);
      for(let index=1;index<geometry.length;index++) expect(geometry[index].top).toBeGreaterThan(geometry[index-1].bottom);
      await expect(collection).toHaveCSS('overflow-x','visible');
      await expect(collection).toHaveCSS('overflow-y','visible');
      expect(await collection.evaluate(element=>element.scrollWidth<=element.clientWidth)).toBe(true);
      await cards.last().scrollIntoViewIfNeeded();
      expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(0);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await screenshot(page,'artifacts/visual/collection-'+width+'-'+info.project.name+'.png');

    for(const core of Object.values(CORE_ITEMS)){
      const profile=page.getByRole('button',{name:'Hồ sơ cổ phục: '+core.name,exact:true});
      await profile.click();
      const dialog=page.getByRole('dialog',{name:core.vietnameseTitle,exact:true});
      await expect(dialog).toBeVisible();
      const content=dialog.locator('.heritage-profile-content');
      const gallery=dialog.locator('.heritage-profile-gallery');
      const details=dialog.locator('.heritage-profile-details');
      const dialogBounds=(await dialog.boundingBox())!;
      expect(dialogBounds.x).toBeGreaterThanOrEqual(16);
      expect(dialogBounds.x+dialogBounds.width).toBeLessThanOrEqual(width-16);
      expect(dialogBounds.height).toBeLessThanOrEqual(810);
      expect(await content.evaluate(element=>element.scrollWidth<=element.clientWidth)).toBe(true);
      const photo=gallery.locator('img').first();
      await expect.poll(()=>photo.evaluate((element:HTMLImageElement)=>element.complete&&element.naturalWidth>0)).toBe(true);
      await expect(photo).toHaveCSS('object-fit','contain');
      const galleryBounds=(await gallery.boundingBox())!;
      const detailsBounds=(await details.boundingBox())!;
      if(width===1440){
        expect(dialogBounds.width).toBeCloseTo(1100,0);
        expect(detailsBounds.x).toBeGreaterThan(galleryBounds.x+galleryBounds.width);
        expect(Math.abs(detailsBounds.y-galleryBounds.y)).toBeLessThan(2);
      }else{
        expect(dialogBounds.width).toBeLessThanOrEqual(358);
        expect(detailsBounds.y).toBeGreaterThan(galleryBounds.y+galleryBounds.height);
        expect(Math.abs(detailsBounds.x-galleryBounds.x)).toBeLessThan(2);
      }
      if(core.id==='ao-nhat-binh'){
        await page.screenshot({path:'artifacts/visual/profile-'+width+'-'+info.project.name+'.png'});
      }
      await content.evaluate(element=>element.scrollTo(0,element.scrollHeight));
      expect(await content.evaluate(element=>element.scrollTop)).toBeGreaterThan(0);
      await expect(dialog.getByRole('button',{name:'Đóng bảng chi tiết',exact:true})).toBeInViewport();
      await expect(dialog.getByRole('button',{name:'Đóng Hồ Sơ',exact:true})).toBeInViewport();
      await dialog.getByRole('button',{name:'Đóng bảng chi tiết',exact:true}).click();
      await expect(profile).toBeFocused();
      await expect(page.getByRole('button',{name:'Chọn '+core.name,exact:true})).toHaveAttribute('aria-pressed','false');
      await expect(page.locator('[data-page="onboarding"] nav button').nth(1)).toBeDisabled();
    }
  }
});

test('desktop sizing enlarges garment cards and the rendered lookbook while mobile stays unchanged',async({page},info)=>{
  test.skip(info.project.name!=='desktop','The existing mobile project covers touch interactions; this matrix compares viewport sizes.');
  await page.emulateMedia({reducedMotion:'reduce'});
  const previousSizing=`@media(min-width:1024px){
    .heritage-gallery-shell .heritage-gallery-content{max-width:1440px;padding-inline:32px}
    .heritage-gallery-shell .heritage-photo-frame{height:220px}
    .heritage-profile-modal .heritage-lookbook-layout{grid-template-columns:repeat(12,minmax(0,1fr))}
    .heritage-profile-modal .heritage-lookbook-photo{grid-column:span 5 / span 5;width:auto;height:auto;max-height:300px;aspect-ratio:3 / 4}
    .heritage-profile-modal .heritage-lookbook-caption{grid-column:span 7 / span 7}
  }`;
  const containedSize=(image:HTMLImageElement)=>{
    const box=image.getBoundingClientRect();
    const scale=Math.min(box.width/image.naturalWidth,box.height/image.naturalHeight);
    return {width:image.naturalWidth*scale,height:image.naturalHeight*scale};
  };
  for(const viewport of [{width:390,height:844},{width:1023,height:768},{width:1024,height:768},{width:1440,height:900},{width:1920,height:1080},{width:1366,height:600}]){
    await page.setViewportSize(viewport);
    await welcome(page);
    const cards=page.locator('[data-garment-card="true"]');
    const frames=cards.locator('.heritage-photo-frame');
    const measure=()=>frames.evaluateAll(elements=>elements.map(element=>{
      const box=element.getBoundingClientRect();return {width:box.width,height:box.height};
    }));
    const oldStyle=await page.addStyleTag({content:previousSizing});
    const before=await measure();
    await oldStyle.evaluate(element=>element.parentNode?.removeChild(element));
    const after=await measure();
    const geometry=await cards.evaluateAll(elements=>elements.map(element=>{
      const box=element.getBoundingClientRect();return {left:box.left,right:box.right,top:box.top,bottom:box.bottom,width:box.width};
    }));
    if(viewport.width>=1024){
      expect(new Set(geometry.map(box=>box.top)).size).toBe(1);
      expect(Math.max(...geometry.map(box=>box.width))-Math.min(...geometry.map(box=>box.width))).toBeLessThan(1);
      expect(geometry[0].left).toBeGreaterThanOrEqual(24);
      expect(geometry[4].right).toBeLessThanOrEqual(viewport.width-24);
      for(let index=0;index<5;index++){
        expect(after[index].height).toBeGreaterThan(before[index].height+35);
        expect(after[index].width).toBeGreaterThan(before[index].width);
      }
    }else{
      expect(after).toEqual(before);
      expect(after.every(box=>box.height===(viewport.width<640?205:220))).toBe(true);
      expect(new Set(geometry.map(box=>box.left)).size).toBe(1);
    }
    for(const card of await cards.all()){
      const image=card.locator('img');
      await image.scrollIntoViewIfNeeded();
      await expect.poll(()=>image.evaluate((element:HTMLImageElement)=>element.complete&&element.naturalWidth>0)).toBe(true);
      await expect(image).toHaveCSS('object-fit','contain');
      const profile=card.getByRole('button',{name:/^Hồ sơ cổ phục:/});
      const cardBox=(await card.boundingBox())!;
      const buttonBox=(await profile.boundingBox())!;
      expect(buttonBox.y+buttonBox.height).toBeLessThanOrEqual(cardBox.y+cardBox.height);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(viewport.height===600){
      expect(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight)).toBe(true);
      await cards.last().getByRole('button',{name:/^Hồ sơ cổ phục:/}).scrollIntoViewIfNeeded();
      await expect(cards.last().getByRole('button',{name:/^Hồ sơ cổ phục:/})).toBeInViewport();
    }
    if([390,1920,1366].includes(viewport.width)) await screenshot(page,`artifacts/visual/desktop-sizing-${viewport.width}x${viewport.height}.png`);
    const profile=page.getByRole('button',{name:'Hồ sơ cổ phục: Áo Nhật Bình',exact:true});
    await profile.click();
    const dialog=page.getByRole('dialog');
    const content=dialog.locator('.heritage-profile-content');
    const image=dialog.locator('.heritage-lookbook-photo img');
    await image.scrollIntoViewIfNeeded();
    await expect.poll(()=>image.evaluate((element:HTMLImageElement)=>element.complete&&element.naturalWidth>0)).toBe(true);
    await expect(image).toHaveCSS('object-fit','contain');
    const enlarged=await image.evaluate(containedSize);
    const oldLookbookStyle=await page.addStyleTag({content:previousSizing});
    const original=await image.evaluate(containedSize);
    await oldLookbookStyle.evaluate(element=>element.parentNode?.removeChild(element));
    if(viewport.width>=1024){
      expect(enlarged.width).toBeGreaterThan(original.width*1.3);
      expect(enlarged.height).toBeGreaterThan(original.height*1.3);
    }else expect(enlarged).toEqual(original);
    const naturalAspect=await image.evaluate((element:HTMLImageElement)=>element.naturalWidth/element.naturalHeight);
    expect(enlarged.width/enlarged.height).toBeCloseTo(naturalAspect,5);
    expect(await content.evaluate(element=>element.scrollWidth<=element.clientWidth)).toBe(true);
    const bounds=(await dialog.boundingBox())!;
    expect(bounds.height).toBeLessThanOrEqual(viewport.height*0.9+1);
    await image.scrollIntoViewIfNeeded();
    if([390,1920,1366].includes(viewport.width)) await page.screenshot({path:`artifacts/visual/desktop-lookbook-${viewport.width}x${viewport.height}.png`});
    await content.evaluate(element=>element.scrollTo(0,element.scrollHeight));
    await expect(dialog.getByRole('button',{name:'Đóng Hồ Sơ',exact:true})).toBeInViewport();
    await expect(dialog.getByRole('button',{name:'Đóng bảng chi tiết',exact:true})).toBeInViewport();
    await dialog.getByRole('button',{name:'Đóng bảng chi tiết',exact:true}).click();
    await expect(profile).toBeFocused();
    await expect(page.getByRole('button',{name:'Chọn Áo Nhật Bình',exact:true})).toHaveAttribute('aria-pressed','false');
    console.log('Desktop sizing verification',JSON.stringify({viewport,frame:after[0],lookbookBefore:original,lookbookAfter:enlarged}));
  }
});

test('desktop garment cards fit common viewport heights and remain accessible on short displays',async({page},info)=>{
  test.skip(info.project.name!=='desktop','This viewport matrix runs once with desktop Chrome at browser zoom 100%.');
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const viewport of [{width:1366,height:768},{width:1536,height:864},{width:1920,height:1080},{width:1366,height:520}]){
    await page.setViewportSize(viewport);
    await welcome(page);
    // Font metrics must settle before comparing card heights across stylesheet overrides.
    await page.evaluate(async()=>{await document.fonts.ready;});
    // Preserve the original small entry scroll to the garment introduction.
    if(viewport.height===768){
      await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(0);
      await expect(page.locator('.heritage-garment-welcome')).toBeInViewport({ratio:1});
    }
    await page.evaluate(()=>window.scrollTo(0,0));
    const cards=page.locator('[data-garment-card="true"]');
    const frames=cards.locator('.heritage-photo-frame');
    const cardSizes=()=>cards.evaluateAll(elements=>elements.map(element=>{
      const box=element.getBoundingClientRect();return {height:box.height,width:box.width,top:box.top,bottom:box.bottom};
    }));
    const actual=await cardSizes();
    const frameHeights=await frames.evaluateAll(elements=>elements.map(element=>element.getBoundingClientRect().height));
    const initialStyle=await page.addStyleTag({content:`
      .heritage-gallery-shell .heritage-photo-frame{height:220px}
      .heritage-gallery-shell .heritage-card{padding-block:16px}
      .heritage-gallery-shell .heritage-card-copy{margin-top:14px}
      .heritage-gallery-shell .heritage-card-action{margin-top:16px;padding-top:10px}
    `});
    const initial=await cardSizes();
    await initialStyle.evaluate(element=>element.parentNode?.removeChild(element));
    const enlargedStyle=await page.addStyleTag({content:`
      .heritage-gallery-shell .heritage-photo-frame{height:clamp(300px,calc(100dvh - 480px),520px)}
      .heritage-gallery-shell .heritage-card{padding-block:16px}
      .heritage-gallery-shell .heritage-card-copy{margin-top:14px}
      .heritage-gallery-shell .heritage-card-action{margin-top:16px;padding-top:10px}
    `});
    const enlarged=await cardSizes();
    await enlargedStyle.evaluate(element=>element.parentNode?.removeChild(element));
    await page.evaluate(()=>window.scrollTo(0,0));
    expect(new Set(actual.map(box=>box.top)).size).toBe(1);
    for(let index=0;index<5;index++){
      expect(actual[index].height).toBeGreaterThan(initial[index].height+10);
      expect(actual[index].height).toBeLessThan(enlarged[index].height);
      expect(actual[index].width).toBe(initial[index].width);
      expect(actual[index].width).toBe(enlarged[index].width);
      expect(frameHeights[index]).toBeGreaterThan(220);
    }
    const layout=await cardSizes();
    if(viewport.height>=768){
      expect(Math.max(...layout.map(box=>box.bottom))).toBeLessThanOrEqual(viewport.height);
      await expect(page.getByRole('button',{name:'Bỏ qua mở đầu',exact:true})).toBeInViewport({ratio:1});
      await expect(page.locator('.heritage-intro-navigation')).toBeInViewport({ratio:1});
      const headerBottom=(await page.locator('header').boundingBox())!.height;
      expect((await page.locator('.heritage-intro-navigation').boundingBox())!.y).toBeGreaterThanOrEqual(headerBottom);
      for(const profile of await cards.locator('button[aria-haspopup="dialog"]').all()) await expect(profile).toBeInViewport({ratio:1});
    }else{
      expect(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight)).toBe(true);
    }
    expect(await page.evaluate(()=>visualViewport?.scale)).toBe(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    for(const card of await cards.all()){
      const image=card.locator('img');
      await image.scrollIntoViewIfNeeded();
      await expect.poll(()=>image.evaluate((element:HTMLImageElement)=>element.complete&&element.naturalWidth>0)).toBe(true);
      await expect(image).toHaveCSS('object-fit','contain');
      await expect(image).toHaveCSS('transform','none');
      const profile=card.locator('button[aria-haspopup="dialog"]');
      expect((await profile.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await screenshot(page,`artifacts/visual/compact-cards-${viewport.width}x${viewport.height}.png`);
    if(viewport.height<768){
      const profile=cards.last().locator('button[aria-haspopup="dialog"]');
      await profile.scrollIntoViewIfNeeded();
      expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(0);
      await profile.click();
      await expect(page.getByRole('dialog',{name:CORE_ITEMS['ao-ngu-than'].vietnameseTitle,exact:true})).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(profile).toBeFocused();
      await cards.last().getByRole('button',{name:'Chọn Áo Ngũ Thân',exact:true}).click();
      await expect(page.getByRole('heading',{name:/Bạn dự định diện Áo Ngũ Thân/})).toBeVisible();
    }
    console.log('Compact card verification',JSON.stringify({viewport,photoHeight:frameHeights[0],cardHeight:actual[0].height,initialCardHeight:initial[0].height,previousCardHeight:enlarged[0].height,cardsBottom:Math.max(...layout.map(box=>box.bottom))}));
  }
});

test('Sắc Việt brand returns every screen to the garment opening and preserves the styling snapshot',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  const snapshot=async()=>JSON.parse((await page.locator('[data-recommendation-trace]').getAttribute('data-recommendation-trace'))!);
  const returnHome=async()=>{
    await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
    await page.getByRole('button',{name:'Sắc Việt',exact:true}).click();
    await expect(page.locator('[data-garment-card="true"]')).toHaveCount(5);
    await expect(page.locator('[data-page="onboarding"] nav button').nth(0)).toHaveAttribute('aria-current','step');
    await expect(page.locator('[data-page="discovery"], #select-core-garment')).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('main')).toHaveAttribute('data-active-step','1');
    await expect(page.locator('.heritage-garment-welcome')).toBeInViewport({ratio:1});
    expect(await page.evaluate(()=>scrollY)).toBeLessThan(300);
    expect(await page.evaluate(()=>(window as any).brandNavigationToken)).toBe('same-document');
  };
  for(const entry of ['skipped','completed']){
    await page.goto('/');
    await expect(page).toHaveTitle(/^Sắc Việt —/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content',/^Sắc Việt —/);
    await expect(page.getByRole('dialog')).toContainText('Sắc Việt');
    await expect(page.locator('footer')).toHaveText('Sắc Việt © 2026 · Fashion Editorial Styling Studio');
    await page.getByRole('button',{name:'Đã Hiểu',exact:true}).click();
    await page.evaluate(()=>{(window as any).brandNavigationToken='same-document';});
    if(entry==='skipped'){
      await page.getByRole('button',{name:'Bỏ qua mở đầu',exact:true}).click();
      await expect(page.locator('#select-core-garment')).toBeFocused();
      await page.locator('#select-core-garment').selectOption('ao-dai');
      await page.locator('#select-occasion').selectOption({label:'Sự kiện trang trọng'});
      await page.locator('#select-location').selectOption({label:'Phố cổ Hội An'});
      await returnHome();
      await expect(page.locator('header nav button').nth(1)).toBeDisabled();
      await page.getByRole('button',{name:'Bỏ qua mở đầu',exact:true}).click();
      await expect(page.locator('#select-core-garment')).toHaveValue('ao-dai');
      await expect(page.locator('#select-occasion')).toHaveValue('Sự kiện trang trọng');
      await expect(page.locator('#select-location')).toHaveValue('Phố cổ Hội An');
      await page.getByRole('button',{name:/Tiếp tục chọn phong cách/}).click();
    }else{
      await page.getByRole('button',{name:'Chọn Áo Dài',exact:true}).click();
      // Returning while the opening is already mounted must reset its local sub-step.
      await returnHome();
      await expect(page.getByRole('button',{name:'Chọn Áo Dài',exact:true})).toHaveAttribute('aria-pressed','true');
      await page.getByRole('button',{name:'Chọn Áo Dài',exact:true}).click();
      await page.getByRole('button',{name:/Sự kiện trang trọng/}).click();
      await page.getByRole('button',{name:/Đại Nội Huế/}).click();
    }
    await expect(page.locator('[data-page="concept"]')).toBeVisible();
    await page.getByRole('button',{name:'Năng động',exact:true}).click();
    await page.getByRole('button',{name:'Xanh lam',exact:true}).click();
    await returnHome();
    await expect(page.locator('header nav button').nth(1)).toBeEnabled();
    await expect(page.locator('header nav button').nth(2)).toBeDisabled();
    await page.locator('header nav button').nth(1).click();
    await page.getByRole('button',{name:'Vào Remix Studio',exact:true}).click();
    await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-garment-id','ao-dai');
    await page.locator('#remix-dial-slider').fill('62');
    await page.getByRole('button',{name:/Tủ Đồ Phối Kèm/}).click();
    await page.getByRole('button',{name:'Thay đổi',exact:true}).nth(0).click();
    await page.getByRole('option',{name:/Raw Denim/}).click();
    await page.getByRole('button',{name:'Gỡ bỏ phụ kiện',exact:true}).click();
    const before=await snapshot();
    expect(before.context.coreGarment).toBe('ao-dai');
    expect(before.context.style).toBe('Năng động');
    expect(before.context.preferredColor).toBe('Xanh lam');
    expect(before.context.occasion).toBe('Sự kiện trang trọng');
    expect(before.context.location).toBe(entry==='skipped'?'Phố cổ Hội An':'Đại Nội Huế');
    expect(before.locks.bottom).toBeTruthy();
    expect(before.context.includeAccent).toBe(false);
    const coreColor=await page.locator('#photo-layer-core image').getAttribute('data-fabric-color');
    const target=await page.locator('#remix-dial-slider').inputValue();
    await returnHome();
    await expect(page.locator('header nav button').nth(1)).toBeEnabled();
    await expect(page.locator('header nav button').nth(2)).toBeEnabled();
    await page.locator('header nav button').nth(2).click();
    await expect(page.locator('[data-page="remix"]')).toBeVisible();
    expect(await snapshot()).toEqual(before);
    await expect(page.locator('#remix-dial-slider')).toHaveValue(target);
    await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-fabric-color',coreColor!);
    await expect(page.locator('#photo-layer-accent')).toHaveCount(0);
    // Global navigation stays unlocked even with interactive onboarding active.
    await page.locator('header nav button').nth(0).click();
    await expect(page.locator('[data-garment-card="true"]')).toHaveCount(5);
    await page.getByRole('button',{name:'Hồ sơ cổ phục: Áo Tấc',exact:true}).click();
    await expect(page.getByRole('dialog',{name:CORE_ITEMS['ao-tac'].vietnameseTitle,exact:true})).toBeVisible();
    await page.keyboard.press('Escape');
    await returnHome();
    if(entry==='completed'){
      await expect(page.getByRole('button',{name:'Chọn Áo Dài',exact:true})).toHaveAttribute('aria-pressed','true');
      // Fully confirmed skip still routes directly to the already unlocked Studio.
      await page.getByRole('button',{name:'Bỏ qua mở đầu',exact:true}).click();
      await expect(page.locator('[data-page="remix"]')).toBeVisible();
      expect(await snapshot()).toEqual(before);
    }
    await page.getByRole('button',{name:'Giới thiệu',exact:true}).click();
    await expect(page.getByRole('dialog')).toContainText('Sắc Việt');
    await page.getByRole('button',{name:'Đã Hiểu',exact:true}).click();
  }
  expect(errors).toEqual([]);
});

test('complete onboarding confirms all three fields and unlocks Concept',async({page})=>{
  await welcome(page);
  const card=page.getByRole('button',{name:'Chọn Áo Dài',exact:true});
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
  let requests=0;
  await page.route('**/api/ai-status',route=>route.fulfill({json:{isAvailable:true,hasApiKey:true}}));
  await page.route('**/api/ai-stylist',route=>{
    requests++;
    snapshot=route.request().postDataJSON();
    return route.fulfill({json:{success:true,modelUsed:'Local Context Stylist',review:'Gợi ý tại máy để kiểm tra hợp đồng giao diện.',recommendations:[],
      suggestedItems:[{category:'bottom',itemId:'bottom-raw-denim',itemName:'Raw Denim Baggy Cạp Cao',reason:'Kiểm tra thao tác áp dụng rõ ràng.'}]}});
  });
  await studio(page);
  const before=await page.locator('#photo-layer-bottom image').getAttribute('href');
  const launcher=page.getByRole('button',{name:'Trợ Lý Phối Đồ AI',exact:true});
  await launcher.click();
  expect(requests).toBe(0);
  await page.locator('#ai-stylist-input').fill('Kiểm tra ngữ cảnh hiện tại');
  await page.getByRole('button',{name:'Đóng trợ lý AI',exact:true}).click();
  await expect(page.locator('#ai-stylist-input')).toHaveCount(1);
  await expect(page.locator('#ai-stylist-input')).toBeHidden();
  await launcher.click();
  await expect(page.locator('#ai-stylist-input')).toHaveValue('Kiểm tra ngữ cảnh hiện tại');
  expect(requests).toBe(0);
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
  await page.keyboard.press('Escape');
  await expect(launcher).toBeFocused();
  await launcher.click();
  await expect(page.getByRole('button',{name:'Đã chọn',exact:true})).toBeDisabled();
  await expect(page.getByText('Gợi ý tại máy',{exact:true})).toBeVisible();
  expect(requests).toBe(1);
  // Global overlays take precedence over both the launcher and the non-modal chat.
  const profile=page.getByRole('button',{name:'Hồ sơ chi tiết →',exact:true});
  await profile.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog',{name:CORE_ITEMS['ao-dai'].vietnameseTitle,exact:true})).toBeVisible();
  await expect(launcher).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog',{name:'Trợ Lý Phối Đồ AI',exact:true})).toBeVisible();
  await page.route('**/api/generate-outfit-image',route=>route.fulfill({json:{success:false,error:'Kiểm tra modal tạo ảnh',errorCode:'TEST'}}));
  await page.getByRole('button',{name:'Tạo bản minh họa AI',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[role="dialog"][aria-modal="true"]')).toBeVisible();
  await expect(launcher).toBeHidden();
  await page.getByRole('button',{name:'Đóng cửa sổ',exact:true}).click();
  await expect(launcher).toBeVisible();
  await expect(page.getByRole('button',{name:'Đã chọn',exact:true})).toBeDisabled();
  expect(requests).toBe(1);
});


test('floating AI remains accessible without an API key and fits the viewport',async({page},info)=>{
  const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
  let requests=0;
  await page.route('**/api/ai-status',route=>route.fulfill({json:{isAvailable:false,hasApiKey:false}}));
  await page.route('**/api/ai-stylist',route=>{requests++;return route.fulfill({json:{success:false,error:'Unexpected request'}});});
  await welcome(page);
  await expect(page.locator('.floating-ai-root')).toHaveCount(0);
  await page.getByRole('button',{name:'Bỏ qua mở đầu',exact:true}).click();
  await expect(page.locator('.floating-ai-root')).toHaveCount(0);
  await page.locator('#select-core-garment').selectOption('ao-dai');
  await page.getByRole('button',{name:/Tiếp tục chọn phong cách/}).click();
  await page.getByRole('button',{name:'Vào Remix Studio',exact:true}).click();
  const launcher=page.getByRole('button',{name:'Trợ Lý Phối Đồ AI',exact:true});
  const panel=page.getByRole('dialog',{name:'Trợ Lý Phối Đồ AI',exact:true});
  await expect(launcher).toBeVisible();
  const imageAction=page.getByRole('button',{name:'Tạo bản minh họa AI (Cần API Key)',exact:true});
  await imageAction.scrollIntoViewIfNeeded();
  const actionBox=(await imageAction.boundingBox())!;
  const launcherBox=(await launcher.boundingBox())!;
  expect(actionBox.x+actionBox.width).toBeLessThanOrEqual(launcherBox.x);
  await expect(launcher).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('[data-remix-controls] #ai-stylist-input')).toHaveCount(0);
  const heritage=page.locator('[data-heritage-panel]');
  await expect(heritage).toHaveCount(1);
  expect(await heritage.evaluate(e=>e.previousElementSibling?.querySelectorAll('section').length)).toBe(2);
  const wardrobe=page.getByRole('button',{name:/Tủ Đồ Phối Kèm/}).locator('..');
  for(const property of ['background-color','border-top-color','box-shadow']){
    await expect(heritage).toHaveCSS(property,await wardrobe.evaluate((e,p)=>getComputedStyle(e).getPropertyValue(p),property));
  }
  await expect(page.locator('#remix-heritage-title')).toHaveCSS('color','rgb(143, 41, 37)');
  await page.mouse.move(0,0);
  await expect(launcher).toHaveCSS('background-color','rgb(143, 41, 37)');
  await expect(launcher).toHaveCSS('color','rgb(255, 248, 237)');
  await expect(launcher.locator('svg')).toHaveCSS('stroke','rgb(255, 248, 237)');
  expect(launcherBox.width).toBeGreaterThanOrEqual(44);
  expect(launcherBox.height).toBeGreaterThanOrEqual(44);
  await expect(heritage).toContainText(CORE_ITEMS['ao-dai'].heritageStory!);
  await expect(heritage).toContainText(CORE_ITEMS['ao-dai'].silhouette);
  await page.emulateMedia({reducedMotion:'no-preference'});
  expect(await launcher.evaluate(e=>getComputedStyle(e,'::before').animationDuration)).toBe('3s');
  await page.keyboard.press('Tab');
  await launcher.focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await expect(page.getByRole('tooltip')).toHaveText('Trợ Lý Phối Đồ AI');
  if(info.project.name!=='mobile'){
    await page.mouse.move(0,0); await launcher.hover();
    await expect(page.getByRole('tooltip')).toBeVisible();
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  expect(await launcher.evaluate(e=>getComputedStyle(e,'::before').animationName)).toBe('none');
  await page.keyboard.press('Enter');
  await expect(panel).toBeVisible();
  await expect(launcher).toHaveAttribute('aria-controls',(await panel.getAttribute('id'))!);
  await expect(launcher).toHaveAttribute('aria-expanded','true');
  await expect(panel).toHaveAttribute('aria-modal','false');
  await expect(page.getByRole('button',{name:'Đóng trợ lý AI',exact:true})).toBeFocused();
  await expect(panel).toContainText('Chưa có API Key');
  await expect(panel).toContainText('GEMINI_API_KEY');
  await expect(page.locator('#ai-stylist-input')).toBeDisabled();
  expect(await page.locator('body').evaluate(e=>getComputedStyle(e).overflow)).not.toBe('hidden');
  await page.locator('#remix-dial-slider').fill('80');
  await expect(page.locator('#remix-dial-slider')).toHaveValue('80');
  await expect(panel).toBeVisible();
  await page.emulateMedia({reducedMotion:'no-preference'});
  expect(await launcher.evaluate(e=>getComputedStyle(e,'::before').animationName)).toBe('none');
  fs.mkdirSync('artifacts/visual',{recursive:true});
  await page.screenshot({path:`artifacts/visual/floating-ai-${info.project.name}.png`});
  const base=page.viewportSize()!;
  for(const height of [base.height,520,360]){
    await page.setViewportSize({width:base.width,height});
    await expect.poll(()=>panel.evaluate(e=>{
      const r=e.getBoundingClientRect();return r.top>=65&&r.bottom<=innerHeight&&r.right<=innerWidth&&r.left>=0;
    })).toBe(true);
    expect(await panel.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(page.getByRole('button',{name:'Đóng trợ lý AI',exact:true})).toBeInViewport({ratio:1});
    const width=(await panel.boundingBox())!.width;
    expect(width).toBeCloseTo(Math.min(420,base.width-32),0);
  }
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(launcher).toBeFocused();
  await expect(page.locator('.floating-ai-panel')).toHaveAttribute('inert','');
  await page.keyboard.press('Tab');
  expect(await page.locator('.floating-ai-panel').evaluate(e=>e.contains(document.activeElement))).toBe(false);
  expect(requests).toBe(0);
  await page.locator('header nav button').nth(1).click();
  await expect(page.locator('.floating-ai-root')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('floating AI preserves loading and errors across close and supports quick advice and retry',async({page})=>{
  await page.route('**/api/ai-status',route=>route.fulfill({json:{isAvailable:true,hasApiKey:true}}));
  let requests=0; const payloads:any[]=[];
  let release!:()=>void;
  const gate=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/ai-stylist',async route=>{
    requests++; payloads.push(route.request().postDataJSON());
    if(requests===1){
      await gate;
      await route.fulfill({json:{success:false,error:'Lỗi thử nghiệm có thể thử lại'}});
    }else await route.fulfill({json:{success:true,modelUsed:'Local Context Stylist',review:'Tư vấn nhanh đã hoàn tất.',recommendations:['Giữ bản phối hiện tại.'],suggestedItems:[]}});
  });
  await studio(page);
  const launcher=page.getByRole('button',{name:'Trợ Lý Phối Đồ AI',exact:true});
  await launcher.click();
  await page.getByRole('button',{name:'🎨 Hài hòa màu sắc',exact:true}).click();
  await expect(page.getByText('AI Stylist đang phân tích bản phối...',{exact:true})).toBeVisible();
  const draft=await page.locator('#ai-stylist-input').inputValue();
  await page.keyboard.press('Escape');
  await launcher.click();
  await expect(page.locator('#ai-stylist-input')).toHaveValue(draft);
  await expect(page.locator('#ai-stylist-input')).toBeDisabled();
  expect(requests).toBe(1);
  release();
  await expect(page.getByText('Lỗi thử nghiệm có thể thử lại',{exact:true})).toBeVisible();
  await page.keyboard.press('Escape'); await launcher.click();
  await expect(page.getByText('Lỗi thử nghiệm có thể thử lại',{exact:true})).toBeVisible();
  expect(requests).toBe(1);
  await page.getByRole('button',{name:'Thử lại lần nữa',exact:true}).click();
  await expect(page.getByText('"Tư vấn nhanh đã hoàn tất."',{exact:true})).toBeVisible();
  expect(requests).toBe(2);
  expect(payloads[0].consultationType).toBe('color');
  expect(payloads[1].userQuery).toBe(draft);
});


const movable=(page:Page,category:'bag'|'accent')=>page.locator(`[data-movable-layer="${category}"]`);
const accessoryPoint=(layer:Locator)=>layer.evaluate(e=>({x:Number((e as HTMLElement).dataset.x),y:Number((e as HTMLElement).dataset.y)}));
async function selectMovableItem(page:Page,category:'bag'|'accent',index:number){
  await page.getByRole('button',{name:category==='bag'?/^Chọn nhanh Túi/:/^Chọn nhanh Phụ kiện/}).click();
  await page.getByRole('option').filter({hasText:SUPPORT_ITEMS[category][index].name}).click();
  await page.keyboard.press('Escape');
  await expect(movable(page,category)).toHaveAttribute('data-ready','true');
}
async function accessoryHitPoint(layer:Locator){
  await layer.scrollIntoViewIfNeeded();
  return layer.evaluate(e=>{
    const path=e.querySelector<SVGGeometryElement>('[data-accessory-hit-area]')!;
    const b=path.getBBox(), matrix=path.getScreenCTM()!;
    const candidates=[];
    for(let j=0;j<40;j++)for(let i=0;i<40;i++){
      const x=b.x+b.width*(i+.5)/40,y=b.y+b.height*(j+.5)/40;
      if(path.isPointInFill(new DOMPoint(x,y)))candidates.push({x,y,d:Math.abs(i-20)+Math.abs(j-20)});
    }
    for(const candidate of candidates.sort((a,b)=>a.d-b.d)){
      const p=new DOMPoint(candidate.x,candidate.y).matrixTransform(matrix);
      if(document.elementFromPoint(p.x,p.y)?.closest('[data-movable-layer]')===e)return {x:p.x,y:p.y,scale:matrix.a};
    }
    throw new Error('No unobstructed painted accessory pixel');
  });
}
async function dragAccessory(page:Page,category:'bag'|'accent',dx:number,dy:number,touch:boolean){
  const layer=movable(page,category), hit=await accessoryHitPoint(layer);
  const before=await accessoryPoint(layer);
  if(touch){
    const client=await page.context().newCDPSession(page);
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:hit.x,y:hit.y}]});
    await expect(layer).toHaveAttribute('data-dragging','true');
    expect(await accessoryPoint(layer)).toEqual(before);
    for(let i=1;i<=6;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:hit.x+dx*i/6,y:hit.y+dy*i/6}]});
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await client.detach();
  }else{
    await page.mouse.move(hit.x,hit.y);await page.mouse.down();
    await expect(layer).toHaveAttribute('data-dragging','true');
    expect(await accessoryPoint(layer)).toEqual(before);
    await page.mouse.move(hit.x+dx,hit.y+dy,{steps:6});await page.mouse.up();
  }
  await expect(layer).toHaveAttribute('data-dragging','false');
  return {before,hit};
}

test('accessory dragging moves only bags and accents with mouse or touch, updates leaders and survives resize',async({page},info)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  let imageRequests=0,apiRequests=0;
  page.on('request',r=>{if(r.url().includes('/images/layers/'))imageRequests++;if(r.url().includes('/api/'))apiRequests++;});
  await page.route('**/api/ai-status',r=>r.fulfill({json:{isAvailable:false,hasApiKey:false}}));
  await studio(page);
  await selectMovableItem(page,'bag',0);await selectMovableItem(page,'accent',0);
  await page.waitForTimeout(400);
  await page.evaluate(()=>{
    (window as any).fixedPhotoNodes=['core','bottom','shoes'].map(s=>document.querySelector(`#photo-layer-${s} image`));
    (window as any).fixedPhotoRects=(window as any).fixedPhotoNodes.map((e:SVGGraphicsElement)=>{const b=e.getBBox();return {x:b.x,y:b.y,width:b.width,height:b.height};});
    (window as any).fixedMannequin=document.querySelector('#layer-mannequin-base')?.outerHTML;
  });
  const traceBefore=await page.locator('[data-recommendation-trace]').getAttribute('data-recommendation-trace');
  const dial=await page.locator('#remix-dial-slider').inputValue();
  const bag=movable(page,'bag');
  await expect(page.getByRole('group',{name:/^Mannequin 2D/})).toBeVisible();
  await expect(page.getByRole('button',{name:new RegExp(`^Di chuyển túi: ${SUPPORT_ITEMS.bag[0].name}`)})).toBeVisible();
  const original=await accessoryPoint(bag);
  const hit=await accessoryHitPoint(bag);
  const callout=page.getByRole('button',{name:/^Chọn nhanh Túi/});
  const calloutBefore=await callout.boundingBox();
  const lineBefore=await page.locator('[data-leader-category="bag"] circle').evaluate(e=>({x:Number(e.getAttribute('cx')),y:Number(e.getAttribute('cy'))}));
  const scrollBefore=await page.evaluate(()=>scrollY);
  const requestsBefore={imageRequests,apiRequests};
  await dragAccessory(page,'bag',40,30,info.project.name==='mobile');
  const moved=await accessoryPoint(bag);
  expect(moved.x-original.x).toBeCloseTo(40/hit.scale,1);
  expect(moved.y-original.y).toBeCloseTo(30/hit.scale,1);
  expect(await page.evaluate(()=>scrollY)).toBe(scrollBefore);
  await expect(bag.locator('[data-accessory-selection]')).toBeVisible();
  expect(await callout.boundingBox()).toEqual(calloutBefore);
  const lineAfter=await page.locator('[data-leader-category="bag"] circle').evaluate(e=>({x:Number(e.getAttribute('cx')),y:Number(e.getAttribute('cy'))}));
  expect(lineAfter.x-lineBefore.x).toBeCloseTo(40,1);expect(lineAfter.y-lineBefore.y).toBeCloseTo(30,1);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.locator('[data-recommendation-trace]').getAttribute('data-recommendation-trace')).toBe(traceBefore);
  await expect(page.locator('#remix-dial-slider')).toHaveValue(dial);
  await page.waitForTimeout(150);
  expect({imageRequests,apiRequests}).toEqual(requestsBefore);
  expect(await page.evaluate(()=>{
    const nodes=['core','bottom','shoes'].map(s=>document.querySelector(`#photo-layer-${s} image`));
    return nodes.every((e,i)=>e===(window as any).fixedPhotoNodes[i]&&JSON.stringify((()=>{const b=(e as SVGGraphicsElement).getBBox();return {x:b.x,y:b.y,width:b.width,height:b.height};})())===JSON.stringify((window as any).fixedPhotoRects[i]))
      &&document.querySelector('#layer-mannequin-base')?.outerHTML===(window as any).fixedMannequin;
  })).toBe(true);
  const viewport=page.viewportSize()!;
  await page.setViewportSize({width:info.project.name==='mobile'?430:1100,height:viewport.height});
  await expect.poll(()=>accessoryPoint(bag)).toEqual(moved);
  await expect(bag).toHaveAttribute('data-ready','true');
  await page.setViewportSize(viewport);
  const accent=movable(page,'accent');
  const accentBefore=await accessoryPoint(accent);
  const accentHit=await accessoryHitPoint(accent);
  await dragAccessory(page,'accent',12,18,info.project.name==='mobile');
  const accentAfter=await accessoryPoint(accent);
  expect(accentAfter.x-accentBefore.x).toBeCloseTo(12/accentHit.scale,1);
  expect(accentAfter.y-accentBefore.y).toBeCloseTo(18/accentHit.scale,1);
  // Cancel releases the pointer session, then another gesture remains possible.
  const cancelHit=await accessoryHitPoint(accent);
  if(info.project.name==='mobile'){
    const client=await page.context().newCDPSession(page);
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cancelHit.x,y:cancelHit.y}]});
    await client.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await client.detach();
  }else{
    await page.mouse.move(cancelHit.x,cancelHit.y);await page.mouse.down();
    await accent.dispatchEvent('pointercancel',{pointerId:1});await page.mouse.up();
  }
  await expect(accent).toHaveAttribute('data-dragging','false');
  await page.getByRole('button',{name:'Chọn để di chuyển phụ kiện',exact:true}).click();
  await expect(accent).toBeFocused();await page.keyboard.press('ArrowRight');
  expect((await accessoryPoint(accent)).x).toBeCloseTo(accentAfter.x+5,4);
  await expect(accent.locator('[data-accessory-selection]')).toHaveCSS('stroke-width','2.5px');
  // Clicking a non-focusable background ends selection and keyboard movement, without resetting coordinates.
  const retained={bag:await accessoryPoint(bag),accent:await accessoryPoint(accent)};
  const background=page.getByRole('heading',{name:'Bản phối 2D trực tiếp',exact:true});
  if(info.project.name==='mobile')await background.tap();else await background.click();
  await expect(page.locator('[data-accessory-selection]')).toHaveCount(0);
  await expect(bag).toHaveAttribute('aria-pressed','false');await expect(accent).toHaveAttribute('aria-pressed','false');
  await expect(accent).not.toBeFocused();
  await page.keyboard.press('ArrowRight');
  expect(await accessoryPoint(bag)).toEqual(retained.bag);expect(await accessoryPoint(accent)).toEqual(retained.accent);
  // Either direct dragging or the explicit selector can start another edit.
  await dragAccessory(page,'bag',8,5,info.project.name==='mobile');
  await expect(bag.locator('[data-accessory-selection]')).toBeVisible();
  await page.getByRole('button',{name:'Chọn để di chuyển phụ kiện',exact:true}).click();
  await expect(accent.locator('[data-accessory-selection]')).toBeVisible();
  await expect(bag).toHaveAttribute('aria-pressed','false');
  const afterReselect={bag:await accessoryPoint(bag),accent:await accessoryPoint(accent)};
  await page.getByRole('button',{name:/Tủ Đồ Phối Kèm/}).click();
  await expect(page.locator('[data-accessory-selection]')).toHaveCount(0);
  await page.getByRole('button',{name:/Tủ Đồ Phối Kèm/}).click();
  expect(await accessoryPoint(bag)).toEqual(afterReselect.bag);expect(await accessoryPoint(accent)).toEqual(afterReselect.accent);
  // Regular scrolling outside the painted items still works on a real touch stream.
  if(info.project.name==='mobile'){
    const svg=page.locator('svg[aria-label^="Mannequin"]');await svg.scrollIntoViewIfNeeded();
    const box=(await svg.boundingBox())!;
    const startY=Math.min(box.y+box.height-20,viewport.height-40), startX=box.x+8;
    const oldY=await page.evaluate(()=>scrollY);
    const client=await page.context().newCDPSession(page);
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:startX,y:startY}]});
    for(let i=1;i<=6;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:startX,y:startY-120*i/6}]});
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await client.detach();
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(oldY);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  fs.mkdirSync('artifacts/visual',{recursive:true});
  await page.locator('svg[aria-label^="Mannequin"]').scrollIntoViewIfNeeded();
  await page.screenshot({path:`artifacts/visual/accessory-drag-${info.project.name}.png`});
  expect(errors).toEqual([]);
});

test('accessory positions persist through UI and color changes; reset, swapped items and a new core use defaults',async({page},info)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/api/ai-status',r=>r.fulfill({json:{isAvailable:true,hasApiKey:true}}));
  await studio(page);await selectMovableItem(page,'bag',0);await selectMovableItem(page,'accent',1);
  const bag=movable(page,'bag'),accent=movable(page,'accent');
  const defaults={bag:await accessoryPoint(bag),accent:await accessoryPoint(accent)};
  await page.getByRole('button',{name:'Chọn để di chuyển túi',exact:true}).click();
  await page.keyboard.press('Shift+ArrowRight');await page.keyboard.press('Shift+ArrowDown');
  await page.getByRole('button',{name:'Chọn để di chuyển phụ kiện',exact:true}).click();
  await page.keyboard.press('Shift+ArrowRight');await page.keyboard.press('Shift+ArrowDown');
  const custom={bag:await accessoryPoint(bag),accent:await accessoryPoint(accent)};
  expect(custom.bag.x).toBeCloseTo(defaults.bag.x+20,4);
  expect(custom.accent.x).toBeCloseTo(defaults.accent.x+20,4);
  await page.getByRole('button',{name:/Tủ Đồ Phối Kèm/}).click();await page.getByRole('button',{name:/Tủ Đồ Phối Kèm/}).click();
  await page.getByRole('button',{name:'Trợ Lý Phối Đồ AI',exact:true}).click();
  await page.locator('#ai-stylist-input').fill('Không đổi vị trí phụ kiện');
  await page.keyboard.press('Escape');
  await page.getByRole('radio',{name:/Chọn màu/}).nth(1).click();
  expect(await accessoryPoint(bag)).toEqual(custom.bag);expect(await accessoryPoint(accent)).toEqual(custom.accent);
  await page.getByRole('button',{name:'Đổi Concept',exact:true}).click();await page.getByRole('button',{name:'Vào Remix Studio',exact:true}).click();
  await expect(bag).toHaveAttribute('data-ready','true');await expect(accent).toHaveAttribute('data-ready','true');
  expect(await accessoryPoint(bag)).toEqual(custom.bag);expect(await accessoryPoint(accent)).toEqual(custom.accent);
  // Changing the bag must not move an unchanged, custom-positioned accent, even if its default fitting changes.
  await selectMovableItem(page,'bag',2);
  expect(await bag.getAttribute('data-offset-x')).toBe('0');expect(await bag.getAttribute('data-offset-y')).toBe('0');
  expect(await accessoryPoint(accent)).toEqual(custom.accent);
  await page.getByRole('button',{name:'Chọn để di chuyển túi',exact:true}).click();await page.keyboard.press('Shift+ArrowLeft');
  await selectMovableItem(page,'accent',3);
  expect(await accent.getAttribute('data-offset-x')).toBe('0');expect(await accent.getAttribute('data-offset-y')).toBe('0');
  await page.getByRole('button',{name:'Chọn để di chuyển phụ kiện',exact:true}).click();
  await page.keyboard.press('Shift+ArrowRight');
  // Clamp at both extremes without resizing or losing the item.
  for(let i=0;i<35;i++)await page.keyboard.press('Shift+ArrowLeft');
  for(let i=0;i<35;i++)await page.keyboard.press('Shift+ArrowUp');
  expect(await accessoryPoint(accent)).toEqual({x:2,y:2});
  for(let i=0;i<35;i++)await page.keyboard.press('Shift+ArrowRight');
  for(let i=0;i<35;i++)await page.keyboard.press('Shift+ArrowDown');
  const bounds=await accent.locator('[data-accessory-hit-area]').evaluate((e:SVGGraphicsElement)=>{const b=e.getBBox();return {x:b.x,y:b.y,width:b.width,height:b.height};});
  const clamped=await accessoryPoint(accent);
  expect(clamped.x+bounds.width).toBeCloseTo(298,1);expect(clamped.y+bounds.height).toBeCloseTo(598,1);
  const trace=await page.locator('[data-recommendation-trace]').getAttribute('data-recommendation-trace');
  const color=await page.locator('#photo-layer-core image').getAttribute('data-fabric-color');
  await page.getByRole('button',{name:'Đặt lại vị trí phụ kiện',exact:true}).click();
  await expect(bag).toHaveAttribute('data-offset-x','0');await expect(accent).toHaveAttribute('data-offset-x','0');
  await expect(accent).toHaveAttribute('data-offset-y','0');
  expect(await page.locator('[data-recommendation-trace]').getAttribute('data-recommendation-trace')).toBe(trace);
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-fabric-color',color!);
  await page.getByRole('button',{name:'Chọn để di chuyển túi',exact:true}).click();await page.keyboard.press('ArrowRight');
  await page.getByRole('button',{name:'Sắc Việt',exact:true}).click();
  await page.getByRole('button',{name:'Chọn Áo Tấc',exact:true}).click();
  await page.locator('header nav button').nth(2).click();
  await expect(bag).toHaveAttribute('data-ready','true');
  await expect(bag).toHaveAttribute('data-offset-x','0');await expect(bag).toHaveAttribute('data-offset-y','0');
  await page.getByRole('button',{name:/^Chọn nhanh Phụ kiện/}).click();
  await page.getByRole('option',{name:/Không dùng phụ kiện/}).click();await page.keyboard.press('Escape');
  await expect(accent).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Chọn để di chuyển phụ kiện',exact:true})).toBeDisabled();
  await expect(page.locator('#photo-layer-accent')).toHaveCount(0);
  console.log('Accessory position state checks',JSON.stringify({project:info.project.name,defaults,custom}));
});


test('accessory dragging fallback remains keyboard accessible when a bag or accent photo fails',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route(/\/(bags|accessories)\/[^/]+\.png$/,r=>r.fulfill({contentType:'image/png',body:'invalid PNG'}));
  await page.route('**/api/ai-status',r=>r.fulfill({json:{isAvailable:false,hasApiKey:false}}));
  await studio(page);
  await page.getByRole('button',{name:'Sắc Việt',exact:true}).click();
  await page.getByRole('button',{name:'Chọn Áo Nhật Bình',exact:true}).click();
  await page.locator('header nav button').nth(2).click();
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-garment-id','ao-nhat-binh');
  // The front-draped necklace must remain movable when its photo falls back to the existing vector.
  for(const category of ['bag','accent'] as const)for(let index=0;index<SUPPORT_ITEMS[category].length;index++){
    await selectMovableItem(page,category,index);
    const layer=movable(page,category),before=await accessoryPoint(layer);
    await expect(layer.locator(`#${SUPPORT_ITEMS[category][index].id}`)).toBeVisible();
    await page.getByRole('button',{name:`Chọn để di chuyển ${category==='bag'?'túi':'phụ kiện'}`,exact:true}).click();
    await expect(layer).toBeFocused();await page.keyboard.press('Shift+ArrowDown');
    expect((await accessoryPoint(layer)).y).toBeCloseTo(before.y+20,4);
    await page.getByRole('button',{name:'Đặt lại vị trí phụ kiện',exact:true}).click();
    await expect(layer).toHaveAttribute('data-offset-y','0');
    await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-garment-id','ao-nhat-binh');
  }
});


test('silver necklace conceals its rear loop on all five garments with a moving clip and persistent custom positions',async({page},info)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/ai-status',r=>r.fulfill({json:{isAvailable:false,hasApiKey:false}}));
  await studio(page);
  fs.mkdirSync('artifacts/visual',{recursive:true});
  for(const coreId of ['ao-nhat-binh','ao-tac','ao-dai','ao-tu-than','ao-ngu-than'] as const){
    await page.getByRole('button',{name:'Sắc Việt',exact:true}).click();
    await page.getByRole('button',{name:`Chọn ${CORE_ITEMS[coreId].name}`,exact:true}).click();
    await page.locator('header nav button').nth(2).click();
    await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-garment-id',coreId);
    await selectMovableItem(page,'accent',0);
    const accent=movable(page,'accent'),defaults=await accessoryPoint(accent);
    await expect(accent).toHaveAttribute('data-offset-x','0');await expect(accent).toHaveAttribute('data-offset-y','0');
    await expect(page.locator('#photo-layer-accent image')).toHaveCount(1);
    const geometry=await accent.evaluate(e=>{
      const image=e.querySelector<SVGImageElement>('#photo-layer-accent image')!;
      const hit=e.querySelector<SVGGraphicsElement>('[data-accessory-hit-area]')!;
      const core=document.querySelector('#photo-layer-core')!;
      const b=hit.getBBox();
      (window as any).silverPhotoNode=image;
      return {inFront:Boolean(core.compareDocumentPosition(image)&Node.DOCUMENT_POSITION_FOLLOWING),
        clipped:image.hasAttribute('clip-path'),
        clipTop:Number(e.querySelector('clipPath rect')!.getAttribute('y')),
        localClip:e.contains(e.querySelector('clipPath')),
        concealedBackHit:(hit as SVGGeometryElement).isPointInFill(new DOMPoint(150,Number(image.getAttribute('y'))+1)),
        path:hit.getAttribute('d'), x:b.x,y:b.y,width:b.width,height:b.height,
        ratio:Number(image.getAttribute('width'))/Number(image.getAttribute('height'))};
    });
    expect(geometry.inFront).toBe(true);expect(geometry.clipped).toBe(true);
    expect(geometry.localClip).toBe(true);expect(geometry.concealedBackHit).toBe(false);
    expect(geometry.y).toBe(geometry.clipTop);expect(geometry.y).toBeGreaterThanOrEqual(118);expect(geometry.y).toBeLessThanOrEqual(123);
    expect(geometry.y+geometry.height).toBeGreaterThan(145);expect(geometry.y+geometry.height).toBeLessThan(155);
    expect(geometry.x).toBeGreaterThan(128);expect(geometry.x+geometry.width).toBeLessThan(172);
    expect(geometry.width).toBeGreaterThan(37);expect(geometry.width).toBeLessThan(41);expect(geometry.ratio).toBeCloseTo(800/720,5);
    await page.locator('svg[aria-label^="Mannequin"]').screenshot({path:`artifacts/visual/silver-${coreId}-${info.project.name}.png`});
    const hit=await accessoryHitPoint(accent);
    const lineBefore=await page.locator('[data-leader-category="accent"] circle').evaluate(e=>({x:Number(e.getAttribute('cx')),y:Number(e.getAttribute('cy'))}));
    await dragAccessory(page,'accent',12,55,info.project.name==='mobile');
    const custom=await accessoryPoint(accent);
    expect(custom.x-defaults.x).toBeCloseTo(12/hit.scale,1);expect(custom.y-defaults.y).toBeCloseTo(55/hit.scale,1);
    const lineAfter=await page.locator('[data-leader-category="accent"] circle').evaluate(e=>({x:Number(e.getAttribute('cx')),y:Number(e.getAttribute('cy'))}));
    expect(lineAfter.x-lineBefore.x).toBeCloseTo(12,1);expect(lineAfter.y-lineBefore.y).toBeCloseTo(55,1);
    const movedClip=await accent.evaluate(e=>{
      const rect=e.querySelector<SVGGraphicsElement>('clipPath rect')!;
      const hit=e.querySelector<SVGGraphicsElement>('[data-accessory-hit-area]')!;
      // The clip belongs to this translated group, not the fixed mannequin/collar.
      return {clipTop:Number(rect.getAttribute('y')),path:hit.getAttribute('d'),
        offset:Number((e as SVGGElement).dataset.offsetY), top:hit.getBBox().y};
    });
    expect(movedClip.clipTop).toBe(geometry.clipTop);expect(movedClip.path).toBe(geometry.path);
    expect(movedClip.top+movedClip.offset).toBeCloseTo(custom.y,4);
    await page.locator('svg[aria-label^="Mannequin"]').screenshot({path:`artifacts/visual/silver-moved-${coreId}-${info.project.name}.png`});
    await page.getByRole('heading',{name:'Bản phối 2D trực tiếp',exact:true}).click();
    await expect(page.locator('[data-accessory-selection]')).toHaveCount(0);
    expect(await accessoryPoint(accent)).toEqual(custom);
    expect(await accent.evaluate(e=>Boolean(document.querySelector('#photo-layer-core')!.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    const previousColor=await page.locator('#photo-layer-core image').getAttribute('data-fabric-color');
    await page.locator('[role="radio"][aria-checked="false"]').first().click();
    await expect(page.locator('#photo-layer-core image')).not.toHaveAttribute('data-fabric-color',previousColor!);
    await expect.poll(()=>accessoryPoint(accent)).toEqual(custom);
    expect(await page.evaluate(()=>document.querySelector('#photo-layer-accent image')===(window as any).silverPhotoNode)).toBe(true);
    await page.getByRole('button',{name:'Chọn để di chuyển phụ kiện',exact:true}).click();
    await page.keyboard.press('ArrowRight');expect((await accessoryPoint(accent)).x).toBeCloseTo(custom.x+5,4);
    await page.getByRole('button',{name:'Đặt lại vị trí phụ kiện',exact:true}).click();
    await expect.poll(()=>accessoryPoint(accent)).toEqual(defaults);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});
