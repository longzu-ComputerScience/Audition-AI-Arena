import sys

# Analyze trousers
with open("/tmp/quan-lua.rgba", "rb") as f:
    data = f.read()

width, height = 2048, 2048

# Samples from corners
corners = [(0, 0), (2047, 0), (0, 2047), (2047, 2047), (1024, 50), (50, 1024), (2000, 1024)]
print("Quần lụa background sample points:")
for x, y in corners:
    idx = (y * width + x) * 4
    r, g, b, a = data[idx:idx+4]
    print(f"  ({x}, {y}): R={r}, G={g}, B={b}, A={a}")

# Sample from center of trousers: (1024, 1024)
# Between the legs or on the leg:
print("Quần lụa garment sample points:")
for x, y in [(850, 1024), (1200, 1024), (1024, 300), (1024, 1500)]:
    idx = (y * width + x) * 4
    r, g, b, a = data[idx:idx+4]
    print(f"  ({x}, {y}): R={r}, G={g}, B={b}, A={a}")

# Analyze Ao Nhat Binh
with open("/tmp/ao-nhat-binh.rgba", "rb") as f:
    nb_data = f.read()

nb_w, nb_h = 1792, 2400
print("\nÁo Nhật Bình background sample points:")
for x, y in [(0, 0), (1791, 0), (0, 2399), (1791, 2399), (896, 50)]:
    idx = (y * nb_w + x) * 4
    r, g, b, a = nb_data[idx:idx+4]
    print(f"  ({x}, {y}): R={r}, G={g}, B={b}, A={a}")

print("Áo Nhật Bình garment sample points:")
for x, y in [(896, 1200), (500, 1000), (1300, 1000), (896, 500)]:
    idx = (y * nb_w + x) * 4
    r, g, b, a = nb_data[idx:idx+4]
    print(f"  ({x}, {y}): R={r}, G={g}, B={b}, A={a}")
