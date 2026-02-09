import base64, sys
b64 = sys.stdin.read().strip()
data = base64.b64decode(b64)
with open(r'C:\Users\Adam Murphy\AI\TDG\assets\towers\models\basic_t2.obj', 'wb') as f:
    f.write(data)
print(f'Written {len(data)} bytes')
