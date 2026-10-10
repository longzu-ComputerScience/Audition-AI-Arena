import { test, expect, Page } from '@playwright/test';
import fs from 'node:fs';
const dir='artifacts/qa-2026-10-10';
fs.mkdirSync(dir,{recursive:true});
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1kAAAAASUVORK5CYII=';
const shortError='Cấu hình API hiện tại chưa hỗ trợ tạo ảnh. Vui lòng đổi sang API key có quyền tạo ảnh.';
// Default guard: no QA request can reach a paid Gemini endpoint.
test.beforeEach(async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/api/**',route=>{
    const path=new URL(route.request().url()).pathname;
    return route.fulfill({json:path==='/api/ai-status'?{isAvailable:true,hasApiKey:true}:
      {success:false,error:'MOCK: request blocked by QA guard',errorCode:'QA_GUARD'}});
  });
});
async function opening(page:Page){
  await page.goto('/');
  await page.getByRole('button',{name:'Đã Hiểu',exact:true}).click();
  await expect(page.getByRole('button',{name:/^Hồ sơ cổ phục:/})).toHaveCount(5);
}
async function studio(page:Page){
  await opening(page);
  await page.getByRole('button',{name:'Bỏ qua mở đầu',exact:true}).click();
  await page.locator('#select-core-garment').selectOption('ao-dai');
  await page.locator('#select-occasion').selectOption({label:'Sự kiện trang trọng'});
  await page.locator('#select-location').selectOption({label:'Phố cổ Hội An'});
  await page.getByRole('button',{name:/Tiếp tục chọn phong cách/}).click();
  await page.getByRole('button',{name:'Vào Remix Studio',exact:true}).click();
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-garment-id','ao-dai');
}
async function evidence(page:Page,name:string){
  await page.screenshot({path:`${dir}/${name}.png`,fullPage:true});
}
async function survey(page:Page,name:string){
  await page.waitForTimeout(200);
  const data=await page.evaluate(()=>{
    const visible=(e:Element)=>{const s=getComputedStyle(e),b=e.getBoundingClientRect();return b.width>0&&b.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('[hidden],[inert]');};
    const controls=Array.from(document.querySelectorAll<HTMLElement>('button,input,select,textarea,[tabindex="0"]')).filter(visible).map(e=>{
      const b=e.getBoundingClientRect(),s=getComputedStyle(e);return {text:(e.getAttribute('aria-label')||e.textContent||e.getAttribute('id')||'').trim().slice(0,80),width:b.width,height:b.height,color:s.color,bg:s.backgroundColor,disabled:(e as HTMLButtonElement).disabled||false};
    });
    const rgb=(c:string)=>{const a=c.match(/[\d.]+/g)?.map(Number)||[];return [a[0]||0,a[1]||0,a[2]||0,a[3]??1];};
    const mix=(a:number[],b:number[])=>[a[0]*a[3]+b[0]*(1-a[3]),a[1]*a[3]+b[1]*(1-a[3]),a[2]*a[3]+b[2]*(1-a[3]),1];
    const lum=(a:number[])=>a.slice(0,3).map(n=>{const c=n/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const contrasts=Array.from(document.querySelectorAll<HTMLElement>('span,p,label,button,h1,h2,h3,h4')).filter(e=>visible(e)&&Array.from(e.childNodes).some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent?.trim())&&!e.closest('button:disabled')).map(e=>{
      const ancestors:HTMLElement[]=[];let parent:HTMLElement|null=e;while(parent){ancestors.unshift(parent);parent=parent.parentElement;}
      let bg=[250,247,238,1],opacity=1,gradient=false;
      for(const a of ancestors){const s=getComputedStyle(a);bg=mix(rgb(s.backgroundColor),bg);opacity*=Number(s.opacity);if(s.backgroundImage!=='none')gradient=true;}
      const s=getComputedStyle(e),fg=rgb(s.color);fg[3]*=opacity;const color=mix(fg,bg),l1=lum(color),l2=lum(bg);
      const ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05),large=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&Number(s.fontWeight)>=700);
      return {text:e.textContent?.trim().slice(0,100),color:s.color,bg:bg.slice(0,3),ratio:Number(ratio.toFixed(2)),required:large?3:4.5,gradientEstimate:gradient};
    });
    return {viewport:{width:innerWidth,height:innerHeight},scrollWidth:document.documentElement.scrollWidth,
      overflow:Array.from(document.querySelectorAll<HTMLElement>('header,main,section,button,input,select')).filter(e=>visible(e)&&(e.getBoundingClientRect().right>innerWidth+2||e.getBoundingClientRect().left< -2)).map(e=>({tag:e.tagName,text:e.textContent?.trim().slice(0,80),right:e.getBoundingClientRect().right})),
      brokenImages:Array.from(document.images).filter(i=>visible(i)&&i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src')),
      controls,lowContrast:contrasts.filter(c=>c.ratio<c.required),allContrasts:contrasts};
  });
  fs.writeFileSync(`${dir}/${name}.json`,JSON.stringify(data,null,2));
  await evidence(page,name);
  expect.soft(data.scrollWidth,`${name}: horizontal page overflow`).toBeLessThanOrEqual(data.viewport.width);
  expect.soft(data.brokenImages,`${name}: broken HTML images`).toEqual([]);
  return data;
}
for(const viewport of [{width:1920,height:1080},{width:1366,height:768},{width:768,height:1024},{width:390,height:844},{width:360,height:800},{width:683,height:384}]){
  test(`QA layout ${viewport.width}x${viewport.height}${viewport.width===683?' (200% reflow equivalent, not native browser zoom)':''}`,async({page})=>{
    await page.setViewportSize(viewport);const tag=`${viewport.width}x${viewport.height}`;
    const errors:string[]=[];const network:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)network.push(`${r.status()} ${new URL(r.url()).pathname}`);});
    await page.goto('/');await survey(page,`${tag}-about`);
    const aboutBounds=await page.getByRole('dialog').boundingBox();
    fs.writeFileSync(`${dir}/${tag}-about-bounds.json`,JSON.stringify({viewport,bounds:aboutBounds}));
    expect.soft(aboutBounds!.y,'About header must remain within viewport').toBeGreaterThanOrEqual(0);
    expect.soft(aboutBounds!.y+aboutBounds!.height,'About footer must remain within viewport').toBeLessThanOrEqual(viewport.height);
    // Record clipping first, then use a real keyboard activation to continue low-height coverage.
    const understood=page.getByRole('button',{name:'Đã Hiểu',exact:true});
    if(viewport.height===384){await understood.focus();await understood.press('Enter');}else await understood.click();
    await expect(page.locator('header nav button').nth(1)).toBeDisabled();
    await expect(page.locator('header nav button').nth(2)).toBeDisabled();
    await survey(page,`${tag}-opening`);
    const profile=page.getByRole('button',{name:/^Hồ sơ cổ phục:/}).first();await profile.click();
    await survey(page,`${tag}-profile`);await page.keyboard.press('Escape');await expect(profile).toBeFocused();
    await page.getByRole('button',{name:'Bỏ qua mở đầu',exact:true}).click();await survey(page,`${tag}-discovery`);
    await page.locator('#select-core-garment').selectOption('ao-nhat-binh');
    await page.locator('#select-location').selectOption({label:'Văn Miếu – Quốc Tử Giám'});
    await page.getByRole('button',{name:/Tiếp tục chọn phong cách/}).dblclick();
    await expect(page.locator('main')).toHaveAttribute('data-active-step','2');
    await page.getByRole('button',{name:'Hoài cổ (Vintage)',exact:true}).click();
    await page.getByRole('button',{name:'Đỏ son',exact:true}).click();await survey(page,`${tag}-concept`);
    await page.getByRole('button',{name:'Vào Remix Studio',exact:true}).dblclick();
    await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-garment-id','ao-nhat-binh');
    await survey(page,`${tag}-remix`);
    for(const target of ['0','50','100']){await page.locator('#remix-dial-slider').fill(target);await expect(page.locator('#remix-dial-slider')).toHaveValue(target);}
    await page.getByRole('button',{name:'Trợ Lý Phối Đồ AI',exact:true}).click();
    const input=page.locator('#ai-stylist-input');await input.fill('Tiếng Việt có dấu & <script>alert(1)</script> '+ 'yêu cầu riêng '.repeat(300));
    await page.route('**/api/ai-stylist',r=>r.fulfill({json:{success:true,modelUsed:'QA MOCK',review:'Tư vấn mock: '+ 'Nội dung tiếng Việt dài. '.repeat(80),recommendations:['Chuỗi dài: '+ 'A'.repeat(400)],suggestedItems:[]}}));
    await page.getByRole('button',{name:'Tư vấn',exact:true}).click();await expect(page.getByText('Nhận Định Tạo Mẫu',{exact:true})).toBeVisible();
    await survey(page,`${tag}-chat-long-content`);
    const chat=await page.locator('.floating-ai-scroll').evaluate(e=>({width:e.clientWidth,scrollWidth:e.scrollWidth}));
    fs.writeFileSync(`${dir}/${tag}-chat-width.json`,JSON.stringify(chat));
    expect.soft(chat.scrollWidth,'Long AI content must wrap within panel').toBeLessThanOrEqual(chat.width);
    await page.keyboard.press('Escape');
    await page.route('**/api/generate-outfit-image',r=>r.fulfill({json:{success:true,imageUrl:png}}));
    await page.getByRole('button',{name:'Tạo bản minh họa AI',exact:true}).click();
    await expect(page.getByRole('button',{name:'Tải ảnh xuống',exact:true})).toBeVisible();await survey(page,`${tag}-image-modal`);
    await page.keyboard.press('Escape');
    fs.writeFileSync(`${dir}/${tag}-console-network.json`,JSON.stringify({errors,network},null,2));expect(errors).toEqual([]);expect(network).toEqual([]);
  });
}

test('QA About modal: keyboard focus, Escape, accessible name and scroll containment',async({page})=>{
  await page.goto('/');const modal=page.getByRole('dialog');await expect(modal).toBeVisible();
  await page.getByRole('button',{name:'Đã Hiểu',exact:true}).focus();await page.keyboard.press('Tab');
  const focus=await page.evaluate(()=>({inside:!!document.activeElement?.closest('[role=dialog]'),text:document.activeElement?.textContent?.trim(),scrollLocked:document.body.style.overflow==='hidden'}));
  fs.writeFileSync(`${dir}/about-keyboard.json`,JSON.stringify(focus,null,2));await evidence(page,'about-keyboard');
  expect.soft(focus.inside,'Tab must stay inside the modal').toBe(true);
  expect.soft(focus.scrollLocked,'Background scrolling must be locked').toBe(true);
  expect.soft(await modal.getAttribute('aria-labelledby'),'Dialog has an accessible name').toBeTruthy();
  await page.keyboard.press('Escape');expect.soft(await modal.count(),'Escape closes About').toBe(0);
});

test('QA image modal: focus containment and focus return',async({page})=>{
  await page.route('**/api/generate-outfit-image',r=>r.fulfill({json:{success:false,errorCode:'QUOTA_EXCEEDED',error:'MOCK technical detail'}}));
  await studio(page);const trigger=page.getByRole('button',{name:'Tạo bản minh họa AI',exact:true});await trigger.click();
  const modal=page.getByRole('dialog',{name:'Bản Minh Họa Thời Trang AI',exact:true});await expect(page.getByText(shortError,{exact:true})).toBeVisible();
  const initial=await page.evaluate(()=>({inside:!!document.activeElement?.closest('[aria-modal=true]'),text:document.activeElement?.textContent?.trim(),bodyOverflow:document.body.style.overflow}));
  await page.getByRole('button',{name:'Thử lại',exact:true}).focus();await page.keyboard.press('Tab');
  const tab=await page.evaluate(()=>({inside:!!document.activeElement?.closest('[aria-modal=true]'),text:document.activeElement?.textContent?.trim()}));
  fs.writeFileSync(`${dir}/image-modal-keyboard.json`,JSON.stringify({initial,tab},null,2));await evidence(page,'image-modal-keyboard');
  expect.soft(initial.inside,'Opening modal transfers focus inside').toBe(true);expect.soft(tab.inside,'Tab stays inside').toBe(true);
  await page.keyboard.press('Escape');await expect(page.locator('[aria-modal=true]')).toHaveCount(0);expect.soft(await trigger.evaluate(e=>e===document.activeElement),'Focus returns to the generation button').toBe(true);
});

for(const state of ['MISSING_API_KEY','PERMISSION_DENIED','QUOTA_EXCEEDED','HTTP_500','NETWORK_ERROR','TIMEOUT','EMPTY_CANDIDATE','NO_IMAGE_DATA','SUCCESS','SUCCESS_WITHOUT_IMAGE'] as const){
  test(`QA image API ${state} (MOCK)`,async({page})=>{
    if(state==='TIMEOUT')await page.addInitScript(()=>{const native=window.setTimeout.bind(window);window.setTimeout=((fn:any,ms?:number,...args:any[])=>native(fn,ms===75000?200:ms,...args)) as typeof window.setTimeout;});
    let calls=0,payload:any;
    await page.route('**/api/generate-outfit-image',async route=>{
      calls++;payload=route.request().postDataJSON();
      if(state==='NETWORK_ERROR')return route.abort('failed');
      if(state==='TIMEOUT'){await new Promise(r=>setTimeout(r,500));try{await route.fulfill({json:{success:false,error:'Delayed mock'}});}catch{}return;}
      return route.fulfill({status:state==='HTTP_500'?500:200,json:state==='SUCCESS'?{success:true,imageUrl:png}:state==='SUCCESS_WITHOUT_IMAGE'?{success:true}:{success:false,error:`MOCK ${state}: service failure`,errorCode:state}});
    });
    await studio(page);
    await page.getByRole('button',{name:'Chọn để di chuyển túi',exact:true}).click();await page.keyboard.press('Shift+ArrowRight');
    const position=await page.locator('[data-movable-layer=bag]').evaluate(e=>({x:e.getAttribute('data-x'),y:e.getAttribute('data-y')}));
    const ids=JSON.parse((await page.locator('[data-recommendation-trace]').getAttribute('data-recommendation-trace'))!).chosenKey.split('|');
    await page.getByRole('button',{name:'Tạo bản minh họa AI',exact:true}).dblclick();
    if(state==='SUCCESS'){
      const download=page.waitForEvent('download');await page.getByRole('button',{name:'Tải ảnh xuống',exact:true}).click();
      const file=await download;expect(file.suggestedFilename()).toBe('sac-viet-ao-dai.png');await file.saveAs(`${dir}/mock-download.png`);
    }else{
      await expect(page.getByText('Không thể tạo bản minh họa AI',{exact:true})).toBeVisible();
      await expect(page.getByRole('button',{name:'Tải ảnh xuống',exact:true})).toHaveCount(0);
      if(state==='PERMISSION_DENIED'||state==='QUOTA_EXCEEDED'){
        await expect(page.getByText(shortError,{exact:true})).toBeVisible();await expect(page.locator('[aria-modal=true]')).not.toContainText('MOCK technical');
      }
      if(state==='TIMEOUT')await expect(page.locator('[aria-modal=true]')).toContainText('quá thời gian chờ');
    }
    expect.soft(calls,'A double click must not generate duplicate image requests').toBe(1);expect(payload.coreId).toBe('ao-dai');expect(payload.location).toBe('Phố cổ Hội An');expect(payload.occasion).toBe('Sự kiện trang trọng');
    expect([payload.bottomId,payload.shoesId,payload.bagId,payload.accentId??'']).toEqual(ids);
    fs.writeFileSync(`${dir}/image-${state}.json`,JSON.stringify({mock:true,payload,position,positionsInPayload:'accessoryPositions' in payload,calls},null,2));
    await evidence(page,`image-${state}`);await page.keyboard.press('Escape');await expect(page.locator('[aria-modal=true]')).toHaveCount(0);
  });
}

test('QA image timeout also covers a stalled response body (MOCK)',async({page})=>{
  await page.addInitScript(()=>{
    const native=window.setTimeout.bind(window),realFetch=window.fetch.bind(window);
    window.setTimeout=((fn:any,ms?:number,...args:any[])=>native(fn,ms===75000?200:ms,...args)) as typeof window.setTimeout;
    window.fetch=((input:any,init:any)=>{
      if(String(input).includes('/api/generate-outfit-image')){
        (window as any).qaStalledResponse={headersReceived:true,aborted:false};
        init.signal.addEventListener('abort',()=>{(window as any).qaStalledResponse.aborted=true;});
        return Promise.resolve({ok:true,json:()=>new Promise(()=>{})} as Response);
      }
      return realFetch(input,init);
    }) as typeof window.fetch;
  });
  await studio(page);await page.getByRole('button',{name:'Tạo bản minh họa AI',exact:true}).click();await page.waitForTimeout(1000);
  const state=await page.evaluate(()=>(window as any).qaStalledResponse);fs.writeFileSync(`${dir}/image-stalled-body.json`,JSON.stringify(state));await evidence(page,'image-stalled-body');
  expect.soft(state.aborted,'Timeout must remain active until response JSON completes').toBe(true);
  await expect.soft(page.getByRole('button',{name:'Đóng cửa sổ',exact:true}),'Request should exit loading after timeout').toBeEnabled();
});

test('QA applied stylist suggestion stays consistent after a manual replacement (MOCK)',async({page})=>{
  await page.route('**/api/ai-stylist',r=>r.fulfill({json:{success:true,modelUsed:'QA MOCK',review:'Kiểm tra đồng bộ gợi ý',recommendations:[],suggestedItems:[{category:'bottom',itemId:'bottom-raw-denim',itemName:'Raw Denim Baggy Cạp Cao',reason:'MOCK'}]}}));
  await studio(page);const launcher=page.getByRole('button',{name:'Trợ Lý Phối Đồ AI',exact:true});await launcher.click();
  await page.locator('#ai-stylist-input').fill('Gợi ý quần');await page.getByRole('button',{name:'Tư vấn',exact:true}).click();
  await page.getByRole('button',{name:'Áp dụng món này',exact:true}).click();await page.keyboard.press('Escape');
  await page.getByRole('button',{name:/^Chọn nhanh Phần dưới/}).click();await page.getByRole('option',{name:/Quần Lụa/}).click();await page.keyboard.press('Escape');
  await expect(page.locator('#photo-layer-bottom image')).toHaveAttribute('href',/quan-lua\.png/);await launcher.click();
  await evidence(page,'stylist-stale-applied');await expect(page.getByRole('button',{name:/^(Áp dụng món này|Đã chọn)$/}),'Denim suggestion should be applicable again after switching to silk').toBeEnabled();
});

test('QA image request counts: single click and delayed double click (MOCK)',async({page})=>{
  const results:any[]=[];
  for(const variant of [{name:'single-immediate',double:false,delay:0},{name:'single-delayed',double:false,delay:200},{name:'double-delayed',double:true,delay:200}]){
    await page.unroute('**/api/generate-outfit-image');
    let calls=0;const payloads:any[]=[];
    await page.route('**/api/generate-outfit-image',async route=>{
      calls++;payloads.push(route.request().postDataJSON());
      if(variant.delay)await new Promise(resolve=>setTimeout(resolve,variant.delay));
      try{await route.fulfill({json:{success:false,errorCode:'QUOTA_EXCEEDED',error:'MOCK count probe'}});}catch{}
    });
    await studio(page);const trigger=page.getByRole('button',{name:'Tạo bản minh họa AI',exact:true});
    if(variant.double)await trigger.dblclick();else await trigger.click();
    await expect(page.getByText(shortError,{exact:true})).toBeVisible();await page.waitForTimeout(400);
    results.push({...variant,calls,payloads});
    fs.writeFileSync(`${dir}/image-request-counts.json`,JSON.stringify({mock:true,results},null,2));
    await evidence(page,`image-count-${variant.name}`);
    expect.soft(calls,variant.name+' should generate one request').toBe(1);
  }
});
