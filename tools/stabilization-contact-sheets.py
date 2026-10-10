"""Readable fitting sheets; outputs stay in ignored artifacts, never overwrite source images."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
root=Path(__file__).resolve().parents[1]/'artifacts/stabilization/visual'
cores=['ao-nhat-binh','ao-tac','ao-dai','ao-tu-than','ao-ngu-than']
cases=[(0,'none'),(1,'none'),(2,'none'),(0,'0'),(0,'1'),(0,'2'),(0,'3'),(1,'1'),(2,'1')]
for viewport in ['desktop','laptop','mobile']:
    for core in cores:
        sheet=Image.new('RGB',(350*len(cases),760),'#FAF7EE')
        draw=ImageDraw.Draw(sheet)
        for i,(bag,accent) in enumerate(cases):
            p=root/f'{viewport}-{core}-bag{bag}-accent{accent}.png'
            image=ImageOps.contain(Image.open(p).convert('RGB'),(340,700))
            sheet.paste(image,(i*350+(350-image.width)//2,35))
            draw.text((i*350+8,8),f'{core} / bag {bag} / accent {accent}',fill='black')
        sheet.save(root/f'contact-{viewport}-{core}.jpg',quality=92)
for viewport in ['desktop','mobile']:
    sheet=Image.new('RGB',(300*5,620*3),'#FAF7EE')
    draw=ImageDraw.Draw(sheet)
    for row,bag in enumerate([0,1,2]):
        for col,core in enumerate(cores):
            image=ImageOps.contain(Image.open(root/f'{viewport}-{core}-bag{bag}-accent1.png').convert('RGB'),(290,580))
            sheet.paste(image,(col*300+(300-image.width)//2,row*620+30))
            draw.text((col*300+5,row*620+5),f'{core} / bag {bag} + mini',fill='black')
    sheet.save(root/f'contact-mini-bags-{viewport}.jpg',quality=92)
print('Created 15 full fitting sheets and two mini/bag sheets covering 135 fitting views.')
