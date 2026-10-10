from pathlib import Path
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parents[1]/'artifacts/visual'
for group,paths,columns in [('outfits',sorted(root.glob('outfit-*.png')),4),('colors',sorted(root.glob('ao-*.png')),6)]:
    sheet=Image.new('RGB',(columns*300,((len(paths)+columns-1)//columns)*460),'#e8e4dc')
    draw=ImageDraw.Draw(sheet)
    for i,p in enumerate(paths):
        im=Image.open(p).convert('RGB')
        im.thumbnail((295,430))
        x,y=i%columns*300,i//columns*460
        sheet.paste(im,(x+(300-im.width)//2,y))
        draw.text((x+5,y+435),p.stem,fill='black')
    sheet.save(root/f'{group}-contact.jpg',quality=93)
sheet=Image.new('RGB',(900,1000),'#e8e4dc')
draw=ImageDraw.Draw(sheet)
for row,core in enumerate(['ao-nhat-binh','ao-tac']):
    for col,(label,name) in enumerate([('Before',f'before-{core}.png'),('After',f'{core}-default.png')]):
        im=Image.open(root/name).convert('RGB')
        im.thumbnail((440,460))
        x,y=col*450,row*500
        sheet.paste(im,(x+(450-im.width)//2,y))
        draw.text((x+12,y+470),f'{label}: {core}',fill='black')
sheet.save(root/'before-after.jpg',quality=93)
