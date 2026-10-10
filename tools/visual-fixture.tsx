// Development-only browser harness. This is not a product page or navigation route.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MannequinCanvas } from '../src/components/MannequinCanvas';
import { GarmentPreview } from '../src/components/GarmentPreview';
import { CORE_ITEMS, SUPPORT_ITEMS, resolveCorePalette, resolveCoreGarmentColor } from '../src/data/mockFashionData';
import { CoreVietPhucId } from '../src/types';
import '../src/index.css';
type Selection = { core: CoreVietPhucId; bottom: number; shoes: number; bag: number; accent: number | null; color: string };
declare global { interface Window { setTestOutfit: (selection: Partial<Selection>) => void } }
function Fixture() {
  const [s, set] = useState<Selection>({ core:'ao-nhat-binh',bottom:0,shoes:0,bag:0,accent:null,color:'Để hệ thống gợi ý' });
  window.setTestOutfit=next=>set(previous=>({...previous,...next}));
  const core=CORE_ITEMS[s.core];
  return <div style={{maxWidth:700,margin:'0 auto',padding:20}}><MannequinCanvas core={core}
    items={{bottom:SUPPORT_ITEMS.bottom[s.bottom],shoes:SUPPORT_ITEMS.shoes[s.shoes],bag:SUPPORT_ITEMS.bag[s.bag],accent:s.accent===null?null:SUPPORT_ITEMS.accent[s.accent]}}
    fabricColor={resolveCoreGarmentColor(s.core,s.color).hex} palette={resolveCorePalette(s.core,s.color)} />
    <div data-testid="garment-preview"><GarmentPreview coreGarment={s.core}/></div></div>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
