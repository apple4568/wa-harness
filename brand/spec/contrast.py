import sys, itertools
def lum(h):
    h=h.lstrip('#'); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=lum(a),lum(b); hi,lo=max(la,lb),min(la,lb); return (hi+0.05)/(lo+0.05)
cands={'cobalt_a':'#2F45FF','cobalt_b':'#2436E0','cobalt_c':'#1E2FD1','cobalt_d':'#2B3FF0','cobalt_e':'#1C2BC7',
'mint':'#31E3B5','mint_deep':'#0E7C63','mint_text':'#0B6B55','ink950':'#0B1020','ink900':'#141B2D','ink700':'#3B4459','ink500':'#6B7385','ink300':'#C4CAD6','ink200':'#E1E5EC','ink100':'#F1F3F7','ink50':'#F8F9FB','white':'#FFFFFF',
'success':'#0F8A5F','success2':'#177E5C','warning':'#B45309','warning2':'#C56A00','error':'#D92D20','error2':'#C8281B','info':'#2436E0'}
bgs=['white','ink50','ink100','ink950','ink900','cobalt_b','mint']
print('fg/bg', *bgs, sep='\t')
for k,v in cands.items():
    print(k, v, *[f"{cr(v,cands[b]):.2f}" for b in bgs], sep='\t')
