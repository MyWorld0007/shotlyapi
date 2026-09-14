// ShotlyAPI Worker v4.1 - Fixed HMAC-SHA256 signature verification
// Trial: Rs.99 one-time | Starter: Rs.499/mo | Growth: Rs.899/mo | Pro: Rs.1799/mo

const PLANS = {
  free:    { name: 'Free',    price: 0,    limit: 20,     type: 'free' },
  trial:   { name: 'Trial',   price: 99,  limit: 100,   type: 'one_time', duration_days: 7 },
  starter: { name: 'Starter', price: 499, limit: 2000,  type: 'subscription' },
  growth:  { name: 'Growth',  price: 899, limit: 4000,  type: 'subscription' },
  pro:     { name: 'Pro',     price: 1799, limit: 10000, type: 'subscription' },
  demo:    { name: 'Demo',    price: 0,    limit: 200,    type: 'demo' },
}

const RZP_PLAN_IDS = {
  starter: 'RZP_PLAN_STARTER',
  growth:  'RZP_PLAN_GROWTH',
  pro:     'RZP_PLAN_PRO',
}

const corsHeaders =Âˆ	ĞXØÙ\ÜËPÛÛ›ÛP[İËSÜšYÚ[‰Îˆ	ÚÎ‹ËÜÚİX\Kš[‰Ëˆ	ĞXØÙ\ÜËPÛÛ›ÛP[İËSY]ÙÉÎˆ	ÑÑUÔÕÔSÓ”ÉËˆ	ĞXØÙ\ÜËPÛÛ›ÛP[İËRXY\œÉÎˆ	ĞÛÛ[U\K]]Üš^˜][Û‰Ëˆ	ĞXØÙ\ÜËPÛÛ›ÛP[İËPÜ™Y[X[ÉÎˆ	İYIËˆ	ĞÛÛ[TÙXİ\š]KTÛXŞIÎˆ™Y˜][\Ü˜È	ÜÙ[‰ÎÈØÜš\\Ü˜È	ÜÙ[‰ÎÈİ[K\Ü˜È	ÜÙ[‰È	İ[œØY™KZ[›[™IÎÈ[YË\Ü˜È	ÜÙ[‰È]Nˆ›ØÈÛÛ›™Xİ\Ü˜È	ÜÙ[‰ÈÎ‹ËØ\KœÚİX\Kš[È›Û\Ü˜È	ÜÙ[‰ÎÈœ˜[YKX[˜Ù\İÜœÈ	ÜÙ[‰ÈÎ‹ËÙ\Ú˜ÛİY›\™K˜ÛÛH‹ˆ	ÔİšXİU˜[œÜÜTÙXİ\š]IÎˆ	ÛX^XYÙOLÌMLÍŒÈ[˜ÛYTİX‘ÛXZ[œÉËˆ	ÖPÛÛ[U\KSÜ[ÛœÉÎˆ	Û›ÜÛšY™‰Ëˆ	ÖQœ˜[YKSÜ[ÛœÉÎˆ	ÑS–IËŸB‚™[˜İ[ÛˆœÛÛ”™\ÜÛœÙJ]Kİ]\Ë^˜RXY\œÊHÂˆYˆ
\İ]\ÊHİ]\ÈHŒˆ˜\ˆXY\œÈHÈ	ĞÛÛ[U\IÎˆ	Ø\XØ][Û‹ÚœÛÛ‰Ë	ĞXØÙ\ÜËPÛÛ›ÛP[İËSÜšYÚ[‰Îˆ	ÚÎ‹ËÜÚİX\Kš[‰Ë	ĞXØÙ\ÜËPÛÛ›ÛP[İËSY]ÙÉÎˆ	ÑÑUÔÕÔSÓ”ÉË	ĞXØÙ\ÜËPÛÛ›ÛP[İËRXY\œÉÎˆ	ĞÛÛ[U\K]]Üš^˜][Û‰Ë	ĞXØÙ\ÜËPÛÛ›ÛP[İËPÜ™Y[X[ÉÎˆ	İYIË	ĞÛÛ[TÙXİ\š]KTÛXŞIÎˆ™Y˜][\Ü˜È	ÜÙ[‰ÎÈØÜš\\Ü˜È	ÜÙ[‰ÎÈİ[K\Ü˜È	ÜÙ[‰È	İ[œØY™KZ[›[™IÎÈ[YË\Ü˜È	ÜÙ[‰È]Nˆ›ØÈÛÛ›™Xİ\Ü˜È	ÜÙ[‰ÈÎ‹ËØ\KœÚİX\Kš[È›Û\Ü˜È	ÜÙ[‰ÎÈœ˜[YKX[˜Ù\İÜœÈ	ÜÙ[‰ÈÎ‹ËÙ\Ú˜ÛİY›\™K˜ÛÛH‹	ÔİšXİU˜[œÜÜTÙXİ\š]IÎˆ	ÛX^XYÙOLÌMLÍŒÈ[˜ÛYTİX‘ÛXZ[œÉË	ÖPÛÛ[U\KSÜ[ÛœÉÎˆ	Û›ÜÛšY™‰Ë	ÖQœ˜[YKSÜ[ÛœÉÎˆ	ÑS–IÈBˆYˆ
^˜RXY\œÊHÈ›Üˆ
˜\ˆÈ[ˆ^˜RXY\œÊHXY\œÖÚ×HH^˜RXY\œÖÚ×HBˆ™]\›ˆ™]È™\ÜÛœÙJ”ÓÓ‹œİš[™ÚYJ]JKÈİ]\Îˆİ]\ËXY\œÎˆXY\œÈJBŸB‚™[˜İ[ÛˆœÛÛ‘\œ›ÜŠİ]\ËY\ÜØYÙJHÂˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈ\œ›ÜˆY\ÜØYÙHKİ]\ÊBŸB‚‹ËÈZ[ˆÒKLMˆ
›Üˆ•Õ[™\ÜİÛÜ™ÈH“Õ›Üˆ˜^›Üœ^JB˜\Ş[˜È[˜İ[ÛˆÚLMŠ^
HÂˆÛÛœİ]HH™]È^[˜ÛÙ\Š
K™[˜ÛÙJ^
BˆÛÛœİ\ÚH]ØZ]Ü\ËœİXK™YÙ\İ
	ÔÒKLM‰Ë]JBˆ™]\›ˆ\œ˜^K™œ›ÛJ™]ÈZ[\œ˜^J\Ú
JK›X\
[˜İ[ÛŠŠHÈ™]\›ˆ‹Ôİš[™ÊMŠKœYİ\
‹	Ì	ÊHJKš›Ú[Š	ÉÊBŸB‚‹ËÈPPËTÒLMˆ
›Üˆ˜^›Üœ^HÚYÛ˜]\™H™\šYšXØ][ÛŠB˜\Ş[˜È[˜İ[ÛˆXXÔÚLMŠY\ÜØYÙKÙXÜ™]
HÂˆÛÛœİÙ^Q]HH™]È^[˜ÛÙ\Š
K™[˜ÛÙJÙXÜ™]
BˆÛÛœİ\ÙÑ]HH™]È^[˜ÛÙ\Š
K™[˜ÛÙJY\ÜØYÙJBˆÛÛœİÙ^HH]ØZ]Ü\ËœİXKš[\ÜÙ^J	Ü˜]ÉËÙ^Q]KÈ˜[YNˆ	ÒPPÉË\Úˆ	ÔÒKLM‰ÈK˜[ÙKÉÜÚYÛ‰×JBˆÛÛœİÚYÈH]ØZ]Ü\ËœİXKœÚYÛŠ	ÒPPÉËÙ^K\ÙÑ]JBˆ™]\›ˆ\œ˜^K™œ›ÛJ™]ÈZ[\œ˜^JÚYÊJK›X\
[˜İ[ÛŠŠHÈ™]\›ˆ‹Ôİš[™ÊMŠKœYİ\
‹	Ì	ÊHJKš›Ú[Š	ÉÊBŸB‚˜\Ş[˜È[˜İ[ÛˆXZÙR•Õ
^[ØYÙXÜ™]
HÂˆÛÛœİXY\ˆHÈ[Îˆ	ÒÌM‰Ë\ˆ	Ò•Õ	ÈBˆ˜\ˆ[˜ÈH[˜İ[ÛŠÊHÈ™]\›ˆØJ”ÓÓ‹œİš[™ÚYJÊJKœ™\XÙJÏKÙË	ÉÊHBˆ˜\ˆ]HH[˜ÊXY\ŠH
È	Ë‰È
È[˜Ê^[ØY
Bˆ˜\ˆÚYÈH]ØZ]XXÔÚLMŠ]KÙXÜ™]
Bˆ™]\›ˆ]H
È	Ë‰È
ÈÚYÂŸB‚˜\Ş[˜È[˜İ[Ûˆ™\šYR•Õ
ÚÙ[‹ÙXÜ™]
HÂˆ˜\ˆ\ÈHÚÙ[‹œÜ]
	Ë‰ÊBˆYˆ
\Ë›[™İOOHÊH™]\›ˆ[ˆ˜\ˆ]HH\ÖÌH
È	Ë‰È
È\ÖÌWBˆ˜\ˆÚYÈH]ØZ]XXÔÚLMŠ]KÙXÜ™]
BˆYˆ
ÚYÈOOH\ÖÌ—JH™]\›ˆ[ˆHÈ™]\›ˆ”ÓÓ‹œ\œÙJ]ØŠ\ÖÌWJJHHØ]Ú
JHÈ™]\›ˆ[BŸB‚™[˜İ[ÛˆÙ[™\˜]P\RÙ^J
HÂˆ˜\ˆ]\ÈH™]ÈZ[\œ˜^J
BˆÜ\Ë™Ù]˜[™ÛU˜[Y\Ê]\ÊBˆ™]\›ˆ	ÜÚ×Û]™WÉÈ
È\œ˜^K™œ›ÛJ]\ÊK›X\
[˜İ[ÛŠŠHÈ™]\›ˆ‹Ôİš[™ÊMŠKœYİ\
‹	Ì	ÊHJKš›Ú[Š	ÉÊBŸB‚™[˜İ[ÛˆÙ[™\˜]RY

HÂˆ™]\›ˆ]K››İÊ
KÔİš[™ÊÍŠH
ÈX]œ˜[™ÛJ
KÔİš[™ÊÍŠKœİXœİŠ‹JBŸB‚˜\Ş[˜È[˜İ[Ûˆ\Ú\ÜİÛÜ™
\ÜİÛÜ™Ø[
HÂˆ™]\›ˆ]ØZ]ÚLMŠ\ÜİÛÜ™
ÈØ[
BŸB‚‹ËÈ’ÑŒˆ\ÜİÛÜ™\Ú[™È
LÈ]\˜][ÛœÊB˜\Ş[˜È[˜İ[Ûˆ\Ú\ÜİÛÜ™’ÑŒŠ\ÜİÛÜ™Ø[
HÂˆ˜\ˆ[˜ÈH™]È^[˜ÛÙ\Š
Bˆ˜\ˆÙ^SX]\šX[H]ØZ]Ü\ËœİXKš[\ÜÙ^J	Ü˜]ÉË[˜Ë™[˜ÛÙJ\ÜİÛÜ™
K	Ô’ÑŒ‰Ë˜[ÙKÉÙ\š]™Pš]É×JBˆ˜\ˆ\š]™YH]ØZ]Ü\ËœİXK™\š]™Pš]ÊÈ˜[YNˆ	Ô’ÑŒ‰ËØ[ˆ[˜Ë™[˜ÛÙJØ[
K]\˜][ÛœÎˆL\Úˆ	ÔÒKLM‰ÈKÙ^SX]\šX[MŠBˆ™]\›ˆ	ÜšÙŒŒL‰È
ÈØ[
È	Î‰È
È\œ˜^K™œ›ÛJ™]ÈZ[\œ˜^J\š]™Y
JK›X\
[˜İ[ÛŠŠHÈ™]\›ˆ‹Ôİš[™ÊMŠKœYİ\
‹	Ì	ÊHJKš›Ú[Š	ÉÊBŸB‚‹ËÈ™\šYH\ÜİÛÜ™Hİ\ÜÈ›İ’ÑŒˆ
™]ÊH[™ÒKLMˆ
YØXŞJB˜\Ş[˜È[˜İ[Ûˆ™\šYT\ÜİÛÜ™
\ÜİÛÜ™İÜ™Y\ÚØ[
HÂˆYˆ
İÜ™Y\Ú	‰ˆİÜ™Y\Úš[™^ÙŠ	ÜšÙŒ‰ÊHOOH
HÂˆ˜\ˆ\ÈHİÜ™Y\ÚœÜ]
	Î‰ÊBˆ˜\ˆ]\˜][ÛœÈH\œÙR[
\ÖÌWJBˆ˜\ˆİÜ™YØ[H\ÖÌ—Bˆ˜\ˆİÜ™Y\š]™YH\ÖÌ×Bˆ˜\ˆ[˜ÈH™]È^[˜ÛÙ\Š
Bˆ˜\ˆÙ^SX]\šX[H]ØZ]Ü\ËœİXKš[\ÜÙ^J	Ü˜]ÉË[˜Ë™[˜ÛÙJ\ÜİÛÜ™
K	Ô’ÑŒ‰Ë˜[ÙKÉÙ\š]™Pš]É×JBˆ˜\ˆ\š]™YH]ØZ]Ü\ËœİXK™\š]™Pš]ÊÈ˜[YNˆ	Ô’ÑŒ‰ËØ[ˆ[˜Ë™[˜ÛÙJİÜ™YØ[
K]\˜][ÛœÎˆ]\˜][ÛœË\Úˆ	ÔÒKLM‰ÈKÙ^SX]\šX[MŠBˆ˜\ˆÛÛ\]YH\œ˜^K™œ›ÛJ™]ÈZ[\œ˜^J\š]™Y
JK›X\
[˜İ[ÛŠŠHÈ™]\›ˆ‹Ôİš[™ÊMŠKœYİ\
‹	Ì	ÊHJKš›Ú[Š	ÉÊBˆ™]\›ˆÛÛ\]YOOHİÜ™Y\š]™YˆH[ÙHÂˆ˜\ˆYØXŞR\ÚH]ØZ]ÚLMŠ\ÜİÛÜ™
ÈØ[
Bˆ™]\›ˆYØXŞR\ÚOOHİÜ™Y\ÚˆBŸB‚‹ËÈTHÙ^H\Ú[™È
ÒKLMˆ\Èš[™H›ÜˆYÚY[›ÜHÙ^\ÊB˜\Ş[˜È[˜İ[Ûˆ\Ú\RÙ^J\RÙ^JHÂˆ™]\›ˆ]ØZ]ÚLMŠ\RÙ^JBŸB‚™[˜İ[Ûˆ\RÙ^Q\Ü^J\RÙ^JHÂˆYˆ
X\RÙ^JH™]\›ˆ	ÜÚ×Û]™WË‹‹‰Âˆ™]\›ˆ\RÙ^KœİXœİš[™ÊLŠH
È	Ë‹‹‰È
È\RÙ^KœİXœİš[™Ê\RÙ^K›[™İH
BŸB‚‹ËÈÛÛÚÚYH[\œÂ™[˜İ[ÛˆÙ]]]ÛÛÚÚYJÚÙ[ŠHÂˆ™]\›ˆ	ÜÚİWİÚÙ[IÈ
ÈÚÙ[ˆ
È	ÎÈÛ›NÈÙXİ\™NÈØ[YTÚ]OS^È]KÎÈX^PYÙOMŒÈÛXZ[KœÚİX\Kš[‰ÂŸB‚™[˜İ[ÛˆÛX\]]ÛÛÚÚYJ
HÂˆ™]\›ˆ	ÜÚİWİÚÙ[NÈÛ›NÈÙXİ\™NÈØ[YTÚ]OS^È]KÎÈX^PYÙOLÈÛXZ[KœÚİX\Kš[‰ÂŸB‚™[˜İ[ÛˆÙ]ÛÛÚÚYJ™\]Y\İ˜[YJHÂˆ˜\ˆÛÛÚÚY\ÈH™\]Y\İšXY\œË™Ù]
	ĞÛÛÚÚYIÊH	ÉÂˆ˜\ˆX]ÚHÛÛÚÚY\Ë›X]Ú
™]È™YÑ^
	ÊŸÏ×ÊŠIÈ
È˜[YH
È	ÏJ××JÊIÊJBˆ™]\›ˆX]ÚÈX]ÚÌ—Hˆ[ŸB‚™[˜İ[ÛˆÙ]ÚÙ[‘œ›ÛT™\]Y\İ
™\]Y\İ
HÂˆ˜\ˆÛÛÚÚYUÚÙ[ˆHÙ]ÛÛÚÚYJ™\]Y\İ	ÜÚİWİÚÙ[‰ÊBˆYˆ
ÛÛÚÚYUÚÙ[ŠH™]\›ˆÛÛÚÚYUÚÙ[‚ˆ˜\ˆ]]H™\]Y\İšXY\œË™Ù]
	Ğ]]Üš^˜][Û‰ÊBˆYˆ
]]	‰ˆ]]š[™^ÙŠ	Ğ™X\™\ˆ	ÊHOOH
H™]\›ˆ]]œ™\XÙJ	Ğ™X\™\ˆ	Ë	ÉÊBˆ™]\›ˆ[ŸB‚‹ËÈOOOOOHSPRSOOOOOB˜\Ş[˜È[˜İ[ÛˆÙ[™[XZ[
[‹ËİXš™Xİ[
HÂˆYˆ
Y[‹”‘TÑS‘ĞTWÒÑVJH™]\›ˆÈÚÚ\YˆYHBˆ˜\ˆ™\ÜÛœÙHH]ØZ]™]Ú
	ÚÎ‹ËØ\Kœ™\Ù[™˜ÛÛKÙ[XZ[ÉÈÂˆY]Ùˆ	ÔÔÕ	ËˆXY\œÎˆÈ	Ğ]]Üš^˜][Û‰Îˆ	Ğ™X\™\ˆ	È
È[‹”‘TÑS‘ĞTWÒÑVK	ĞÛÛ[U\IÎˆ	Ø\XØ][Û‹ÚœÛÛ‰ÈKˆ›ÙNˆ”ÓÓ‹œİš[™ÚYJÈœ›ÛNˆ	ÔÚİPTH›Ü™\PÚİX\Kš[‰ËÎˆİ×KİXš™XİˆİXš™Xİ[ˆ[JKˆJBˆ™]\›ˆ]ØZ]™\ÜÛœÙKšœÛÛŠ
BŸB‚˜\Ş[˜È[˜İ[ÛˆÙ[™Ù[ÛÛYQ[XZ[
[‹[XZ[
HÂˆ˜\ˆ[H	Ï]ˆİ[OW™›ÛY˜[Z[N\šX[Ø[œË\Ù\šYÛX^]ÚYMŒÛX\™Ú[Œ]]ÎØ˜XÚÙÜ›İ[™ˆÙ˜Y˜ÎÜY[™ÎŒ×]ˆİ[OW˜˜XÚÙÜ›İ[™ˆÙ™™Ø›Ü™\‹\˜Y]\ÎŒMœÜY[™ÎØ›Ş\ÚYİÎŒMœ™Ø˜JŒŠN×]ˆİ[OW™\Ü^N™›^Ø[YÛ‹Z][\Î˜Ù[\ÙØ\ŒLÛX\™Ú[‹X›İÛNŒÌœ×]ˆİ[OWÚYÚZYÚØ˜XÚÙÜ›İ[™›[™X\‹YÜ˜YY[
LÍYYËÍØÌØYYÌMŒÙXŠNØ›Ü™\‹\˜Y]\ÎŒLÙ\Ü^N™›^Ø[YÛ‹Z][\Î˜Ù[\Ú\İYKXÛÛ[˜Ù[\ØÛÛÜˆÙ™™Ù›Û\Ú^™NŒŒœÙ›Û]ÙZYÚ×”ÏÙ]Ü[ˆİ[OW™›Û\Ú^™NŒŒœÙ›Û]ÙZYÚØÛÛÜˆÌŒMÌ˜N×”ÚİPTOÜÜ[Ù]Hİ[OW™›Û\Ú^™NŒØÛÛÜˆÌŒMÌ˜NÛX\™Ú[ŒMœ×•Ù[ÛÛYHÈÚİPTHOÚOİ[OW™›Û\Ú^™NŒMœØÛÛÜˆÍÍMMNÛ[™KZZYÚŒKÛX\™Ú[ŒŒ×–[İ\ˆXØÛİ[\È™XYHÚ]Œ”‘QHØÜ™Y[œÚİËˆ›ÈÜ™Y]Ø\™™\]Z\™YÜ]ˆİ[OW˜˜XÚÙÜ›İ[™ˆÙŒYYNØ›Ü™\‹\˜Y]\ÎŒLœÜY[™ÎŒŒÛX\™Ú[Œ×ÛÙHİ[OW™›Û\Ú^™NŒMØÛÛÜˆÌMŒÙXİÛÜ™Xœ™XZÎ˜œ™XZËX[×˜İ\›šÎ‹ËØ\KœÚİX\Kš[‹Ø\KÜØÜ™Y[œÚİİ\›ZÎ‹ËÙ^[\K˜ÛÛI˜\WÚÙ^OVSÕT—ĞTWÒÑVWˆ[ÈØÜ™Y[œÚİœ™ÏØÛÙOÙ]H™YWšÎ‹ËÜÚİX\Kš[‹Øš[[™×ˆİ[OW™\Ü^Nš[›[™KX›ØÚÎØ˜XÚÙÜ›İ[™ˆÌMŒÙXØÛÛÜˆÙ™™ÜY[™ÎŒMØ›Ü™\‹\˜Y]\ÎÙ›Û\Ú^™NŒMœÙ›Û]ÙZYÚŒİ^YXÛÜ˜][Û››Û™N×”İ\Ø\\š[™È
œ™YJOØOˆİ[OW˜›Ü™\››Û™NØ›Ü™\‹]ÜŒ\ÛÛYÙL™NŒÛX\™Ú[ŒÌœ×İ[OW™›Û\Ú^™NŒLÜØÛÛÜˆÎMLØÛX\™Ú[Œ×ŠÊHŒˆÚİPTKˆZ[Ú]ÛİY›\™HÛÜšÙ\œËK[™Œ‹ÜÙ]Ù]‰Âˆ™]\›ˆ]ØZ]Ù[™[XZ[
[‹[XZ[	ÕÙ[ÛÛYHÈÚİPTHIË[
BŸB‚˜\Ş[˜È[˜İ[ÛˆÙ[™\ÜİÛÜ™™\Ù][XZ[
[‹[XZ[™\Ù]ÚÙ[ŠHÂˆ˜\ˆ™\Ù]\›H	ÚÎ‹ËÜÚİX\Kš[‹Ü™\Ù]\\ÜİÛÜ™İÚÙ[IÈ
È™\Ù]ÚÙ[‚ˆ˜\ˆ[H	Ï]ˆİ[OW™›ÛY˜[Z[N\šX[Ø[œË\Ù\šYÛX^]ÚYMŒÛX\™Ú[Œ]]ÎØ˜XÚÙÜ›İ[™ˆÙ˜Y˜ÎÜY[™ÎŒ×]ˆİ[OW˜˜XÚÙÜ›İ[™ˆÙ™™Ø›Ü™\‹\˜Y]\ÎŒMœÜY[™ÎØ›Ş\ÚYİÎŒMœ™Ø˜JŒŠN×]ˆİ[OW™\Ü^N™›^Ø[YÛ‹Z][\Î˜Ù[\ÙØ\ŒLÛX\™Ú[‹X›İÛNŒÌœ×]ˆİ[OWÚYÚZYÚØ˜XÚÙÜ›İ[™›[™X\‹YÜ˜YY[
LÍYYËÍØÌØYYÌMŒÙXŠNØ›Ü™\‹\˜Y]\ÎŒLÙ\Ü^N™›^Ø[YÛ‹Z][\Î˜Ù[\Ú\İYKXÛÛ[˜Ù[\ØÛÛÜˆÙ™™Ù›Û\Ú^™NŒŒœÙ›Û]ÙZYÚ×”ÏÙ]Ü[ˆİ[OW™›Û\Ú^™NŒŒœÙ›Û]ÙZYÚØÛÛÜˆÌŒMÌ˜N×”ÚİPTOÜÜ[Ù]Hİ[OW™›Û\Ú^™NŒØÛÛÜˆÌŒMÌ˜NÛX\™Ú[ŒMœ×”™\Ù][İ\ˆ\ÜİÛÜ™ÚOİ[OW™›Û\Ú^™NŒMœØÛÛÜˆÍÍMMNÛ[™KZZYÚŒKÛX\™Ú[Œ×ÛXÚÈH]Ûˆ™[İÈÈÙ]H™]È\ÜİÛÜ™ˆ\È[šÈ^\™\È[ˆHİ\‹ÜH™YW‰È
È™\Ù]\›
È	×ˆİ[OW™\Ü^Nš[›[™KX›ØÚÎØ˜XÚÙÜ›İ[™ˆÌMŒÙXØÛÛÜˆÙ™™ÜY[™ÎŒMØ›Ü™\‹\˜Y]\ÎÙ›Û\Ú^™NŒMœÙ›Û]ÙZYÚŒİ^YXÛÜ˜][Û››Û™N×”™\Ù]\ÜİÛÜ™ØOİ[OW™›Û\Ú^™NŒMØÛÛÜˆÍÍÛX\™Ú[Œ×’Yˆ[İHY›İ™\]Y\İ\Ë[İHØ[ˆØY™[HYÛ›Ü™H\È[XZ[Üˆİ[OW˜›Ü™\››Û™NØ›Ü™\‹]ÜŒ\ÛÛYÙL™NŒÛX\™Ú[ŒÌœ×İ[OW™›Û\Ú^™NŒLÜØÛÛÜˆÎMLØÛX\™Ú[Œ×ŠÊHŒˆÚİPTKÜÙ]Ù]‰Âˆ™]\›ˆ]ØZ]Ù[™[XZ[
[‹[XZ[	Ô™\Ù][İ\ˆÚİPTH\ÜİÛÜ™	Ë[
BŸB‚˜\Ş[˜È[˜İ[ÛˆÙÕ\ØYÙJ[‹\RÙ^K\™Ù]\›
HÂˆ˜\ˆ\ÚYH]ØZ]\Ú\RÙ^J\RÙ^JBˆ]ØZ][‹‘‹œ™\\™J	ÒS”ÑT•S•È\ØYÙH
\WÚÙ^K\›
HSQTÈ
ËÊIÊK˜š[™
\ÚY\™Ù]\›
Kœ[Š
BŸB‚˜\Ş[˜È[˜İ[ÛˆÙ]\Ù\P\RÙ^J[‹\RÙ^JHÂˆ˜\ˆ\ÚYH]ØZ]\Ú\RÙ^J\RÙ^JBˆËÈH\ÚYÛÚİ\š\œİ
™]ÈXØÛİ[ÊBˆ˜\ˆ\Ù\ˆH]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ
ˆ”“ÓH\Ù\œÈÒT‘H\WÚÙ^WÚ\ÚHÉÊK˜š[™
\ÚY
K™š\œİ

BˆYˆ
\Ù\ŠH™]\›ˆ\Ù\‚ˆËÈ˜[˜XÚÈÈZ[^ÛÚİ\
YØXŞHXØÛİ[Ë[[ÈÙ^JBˆ™]\›ˆ]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ
ˆ”“ÓH\Ù\œÈÒT‘H\WÚÙ^HHÉÊK˜š[™
\RÙ^JK™š\œİ

BŸB‚˜\Ş[˜È[˜İ[ÛˆÙ]\ØYÙPÛİ[
[‹\RÙ^JHÂˆËÈH›İ\ÚY[™Z[^›Üˆ˜XÚİØ\™ÛÛ\]ˆ˜\ˆ\ÚYH]ØZ]\Ú\RÙ^J\RÙ^JBˆ˜\ˆ™\İ[H]ØZ][‹‘‹œ™\\™J”ÑSPÕÓÕS•

ŠH\ÈÛİ[”“ÓH\ØYÙHÒT‘H
\WÚÙ^HHÈÔˆ\WÚÙ^HHÊHS‘[Y\İ[\H]][YJ	Û›İÉË	ËLÌ^\ÉÊHŠK˜š[™
\ÚY\RÙ^JK™š\œİ

Bˆ™]\›ˆ
™\İ[	‰ˆ™\İ[˜Ûİ[
HŸB‚‚‹ËÈOOOOOHUHSRUS‘ÈOOOOOB˜\Ş[˜È[˜İ[ÛˆÚXÚÔ˜]S[Z]
[‹\[™Ú[
HÂˆ˜\ˆ™\İ[H]ØZ][‹‘‹œ™\\™Jˆ”ÑSPÕÓÕS•

ŠH\ÈÛİ[”“ÓHÙÚ[—Ø][\ÈÒT‘H\HÈS‘[™Ú[HÈS‘[Y\İ[\H]][YJ	Û›İÉË	ËLMHZ[]\ÉÊH‚ˆ
K˜š[™
\[™Ú[
K™š\œİ

Bˆ™]\›ˆ
™\İ[	‰ˆ™\İ[˜Ûİ[
HŸB‚˜\Ş[˜È[˜İ[ÛˆÙĞ][\
[‹\[™Ú[
HÂˆ]ØZ][‹‘‹œ™\\™J’S”ÑT•S•ÈÙÚ[—Ø][\È
\[™Ú[
HSQTÈ
ËÊHŠK˜š[™
\[™Ú[
Kœ[Š
BŸB‚˜\Ş[˜È[˜İ[ÛˆÛX[\][\Ê[ŠHÂˆ]ØZ][‹‘‹œ™\\™J‘SUH”“ÓHÙÚ[—Ø][\ÈÒT‘H[Y\İ[\]][YJ	Û›İÉË	ËLHİ\‰ÊHŠKœ[Š
BŸB‚™[˜İ[ÛˆÙ]ÛY[T
™\]Y\İ
HÂˆ™]\›ˆ™\]Y\İšXY\œË™Ù]
	ĞÑ‹PÛÛ›™Xİ[™ËRT	ÊH™\]Y\İšXY\œË™Ù]
	ÖQ›ÜØ\™YQ›Ü‰ÊH	İ[šÛ›İÛ‰ÂŸB‚™[˜İ[Ûˆ\ÕšX[^\™Y
\Ù\ŠHÂˆYˆ
\Ù\‹œ[ˆOOH	İšX[	ÊH™]\›ˆ˜[ÙBˆYˆ
]\Ù\‹šX[Üİ\YØ]
H™]\›ˆYBˆ˜\ˆİ\YH™]È]J\Ù\‹šX[Üİ\YØ]
K™Ù][YJ
Bˆ˜\ˆÙ]™[‘^\ÈHÈ
ˆ
ˆŒ
ˆŒ
ˆLˆ™]\›ˆ]K››İÊ
Hˆİ\Y
ÈÙ]™[‘^\ÂŸB‚™[˜İ[Ûˆœ]]XY\Š[ŠHÂˆ™]\›ˆ	Ğ˜\ÚXÈ	È
ÈØJ[‹”–”ÒÑVWÒQ
È	Î‰È
È[‹”–”ÒÑVWÔÑPÔ‘U
BŸB‚™[˜İ[ÛˆÙ]ØÜ™Y[œÚİ\˜[\Ê\›
HÂˆ˜\ˆH\›œÙX\˜Ú\˜[\Âˆ™]\›ˆÂˆ\›ˆ™Ù]
	İ\›	ÊK\WÚÙ^Nˆ™Ù]
	Ø\WÚÙ^IÊKˆ›Ü›X]ˆ™Ù]
	Ù›Ü›X]	ÊH	Ü™ÉËÚYˆ™Ù]
	İÚY	ÊH[ZYÚˆ™Ù]
	ÚZYÚ	ÊH[ˆ[ÜYÙNˆ™Ù]
	Ù[ÜYÙIÊH[[^Nˆ™Ù]
	Ù[^IÊH[ˆØZ]Ù›Ü—ÜÙ[XİÜˆ™Ù]
	İØZ]Ù›Ü—ÜÙ[XİÜ‰ÊH[ØZ]Ù›Ü—Ù]™[ˆ™Ù]
	İØZ]Ù›Ü—Ù]™[	ÊH[ˆÙ[XİÜˆ™Ù]
	ÜÙ[XİÜ‰ÊH[\Ù\—ØYÙ[ˆ™Ù]
	İ\Ù\—ØYÙ[	ÊH[ˆÛÛÚÚY\Îˆ™Ù]
	ØÛÛÚÚY\ÉÊH[YWÙ[[Y[Îˆ™Ù]
	ÚYWÙ[[Y[ÉÊH[ˆœ™\Úˆ™Ù]
	Ùœ™\Ú	ÊH[›ØÚ×ØYÎˆ™Ù]
	Ø›ØÚ×ØYÉÊH™Ù]
	Ø›ØÚ×Ø˜[›™\œÉÊH[ˆÜÜÎˆ™Ù]
	ØÜÜÉÊH[œÎˆ™Ù]
	ÚœÉÊH[ˆİ\İÛWÚ[ˆ™Ù]
	Øİ\İÛWÚ[	ÊH[^˜Xİİ^ˆ™Ù]
	Ù^˜Xİİ^	ÊH[ˆBŸB‚™[˜İ[ÛˆZ[ØXÚRÙ^J\˜[\ÊHÂˆ˜\ˆÙ^TİˆH”ÓÓ‹œİš[™ÚYJÈ\›ˆ\˜[\Ë\››Ü›X]ˆ\˜[\Ë™›Ü›X]ÚYˆ\˜[\ËÚYZYÚˆ\˜[\ËšZYÚ[ÜYÙNˆ\˜[\Ë™[ÜYÙK[^Nˆ\˜[\Ë™[^KØZ]Ù›Ü—ÜÙ[XİÜˆ\˜[\ËØZ]Ù›Ü—ÜÙ[XİÜ‹ØZ]Ù›Ü—Ù]™[ˆ\˜[\ËØZ]Ù›Ü—Ù]™[Ù[XİÜˆ\˜[\ËœÙ[XİÜ‹\Ù\—ØYÙ[ˆ\˜[\Ë\Ù\—ØYÙ[ÛÛÚÚY\Îˆ\˜[\Ë˜ÛÛÚÚY\ËYWÙ[[Y[Îˆ\˜[\ËšYWÙ[[Y[Ë›ØÚ×ØYÎˆ\˜[\Ë˜›ØÚ×ØYËÜÜÎˆ\˜[\Ë˜ÜÜËœÎˆ\˜[\ËšœËİ\İÛWÚ[ˆ\˜[\Ë˜İ\İÛWÚ[^˜Xİİ^ˆ\˜[\Ë™^˜Xİİ^JBˆ˜\ˆ\ÚHˆ›Üˆ
˜\ˆHHÈHÙ^Tİ‹›[™İÈJÊÊHÈ˜\ˆÚ\ˆHÙ^Tİ‹˜Ú\ÛÙP]
JNÈ\ÚH

\ÚJHH\Ú
H
ÈÚ\È\ÚH\Ú	ˆ\ÚBˆ™]\›ˆ	ÜØÜ™Y[œÚİËÉÈ
ÈX]˜XœÊ\Ú
KÔİš[™ÊMŠH
È	×ÉÈ
ÈÙ^Tİ‹›[™İŸB‚™[˜İ[ÛˆZ[Ü˜XÛU\›
[‹\˜[\ÊHÂˆ˜\ˆ˜\ÙU\›H
[‹“ÔPÓWÔÑT•‘T—ÕT“	Ú‹ËÛØØ[ÜİŒÌ	ÊH
È	ËØ\KÜØÜ™Y[œÚİ	Âˆ˜\ˆHH™]ÈT“ÙX\˜Ú\˜[\Ê
BˆYˆ
\˜[\Ë\›
HKœÙ]
	İ\›	Ë\˜[\Ë\›
BˆYˆ
\˜[\Ë™›Ü›X]	‰ˆ\˜[\Ë™›Ü›X]OOH	Ü™ÉÊHKœÙ]
	Ù›Ü›X]	Ë\˜[\Ë™›Ü›X]
BˆYˆ
\˜[\ËÚY
HKœÙ]
	İÚY	Ë\˜[\ËÚY
BˆYˆ
\˜[\ËšZYÚ
HKœÙ]
	ÚZYÚ	Ë\˜[\ËšZYÚ
BˆYˆ
\˜[\Ë™[ÜYÙJHKœÙ]
	Ù[ÜYÙIË\˜[\Ë™[ÜYÙJBˆYˆ
\˜[\Ë™[^JHKœÙ]
	Ù[^IË\˜[\Ë™[^JBˆYˆ
\˜[\ËØZ]Ù›Ü—ÜÙ[XİÜŠHKœÙ]
	İØZ]Ù›Ü—ÜÙ[XİÜ‰Ë\˜[\Ë™[^JBˆYˆ
\˜[\ËØZ]Ù›Ü—Ù]™[
HKœÙ]
	İØZ]Ù›Ü—Ù]™[	Ë\˜[\ËØZ]Ù›Ü—Ù]™[
BˆYˆ
\˜[\ËœÙ[XİÜŠHKœÙ]
	ÜÙ[XİÜ‰Ë\˜[\ËœÙ[XİÜŠBˆYˆ
\˜[\Ë\Ù\—ØYÙ[
HKœÙ]
	İ\Ù\—ØYÙ[	Ë\˜[\Ë\Ù\—ØYÙ[
BˆYˆ
\˜[\Ë˜ÛÛÚÚY\ÊHKœÙ]
	ØÛÛÚÚY\ÉË\˜[\Ë˜ÛÛÚÚY\ÊBˆYˆ
\˜[\ËšYWÙ[[Y[ÊHKœÙ]
	ÚYWÙ[[Y[ÉË\˜[\ËšYWÙ[[Y[ÊBˆYˆ
\˜[\Ë˜›ØÚ×ØYÊHKœÙ]
	Ø›ØÚ×ØYÉË\˜[\Ë˜›ØÚ×ØYÊBˆYˆ
\˜[\Ë˜ÜÜÊHKœÙ]
	ØÜÜÉË\˜[\Ë˜ÜÜÊBˆYˆ
\˜[\ËšœÊHKœÙ]
	ÚœÉË\˜[\ËšœÊBˆYˆ
\˜[\Ë˜İ\İÛWÚ[
HKœÙ]
	Øİ\İÛWÚ[	Ë\˜[\Ë˜İ\İÛWÚ[
BˆYˆ
\˜[\Ë™^˜Xİİ^
HKœÙ]
	Ù^˜Xİİ^	Ë\˜[\Ë™^˜Xİİ^
Bˆ™]\›ˆ˜\ÙU\›
È	ÏÉÈ
ÈKÔİš[™Ê
BŸB‚‹ËÈOOOOOHÑUS‘ÔÈÈPRS•SSÑHOOOOOB˜\Ş[˜È[˜İ[ÛˆÙ]Ù][™Ê[‹Ù^JHÂˆHÂˆ˜\ˆ›İÈH]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ˜[YH”“ÓHÙ][™ÜÈÒT‘HÙ^HHÉÊK˜š[™
Ù^JK™š\œİ

Bˆ™]\›ˆ›İÈÈ›İË˜[YHˆ[ˆHØ]Ú
JHÂˆHÂˆ]ØZ][‹‘‹œ™\\™J	ĞÔ‘PUHP“HQˆ“ÕVTÕÈÙ][™ÜÈ
Ù^HV’SPT–HÑVK˜[YHV
IÊKœ[Š
BˆHØ]Ú
LŠHßBˆ™]\›ˆ[ˆBŸB‚˜\Ş[˜È[˜İ[ÛˆÙ]Ù][™Ê[‹Ù^K˜[YJHÂˆ]ØZ][‹‘‹œ™\\™J	ĞÔ‘PUHP“HQˆ“ÕVTÕÈÙ][™ÜÈ
Ù^HV’SPT–HÑVK˜[YHV
IÊKœ[Š
Bˆ]ØZ][‹‘‹œ™\\™J	ÒS”ÑT•S•ÈÙ][™ÜÈ
Ù^K˜[YJHSQTÈ
ËÊHÓˆÓÓ‘“PÕ
Ù^JHÈTUHÑU˜[YHH^ÛYY˜[YIÊK˜š[™
Ù^K˜[YJKœ[Š
BŸB‚™^ÜY˜][Âˆ\Ş[˜È™]Ú
™\]Y\İ[‹İ
HÂˆ˜\ˆ\›H™]ÈT“
™\]Y\İ\›
Bˆ˜\ˆ]H\›œ]˜[YBˆYˆ
™\]Y\İ›Y]ÙOOH	ÓÔSÓ”ÉÊH™]\›ˆ™]È™\ÜÛœÙJ[ÈXY\œÎˆÛÜœÒXY\œÈJBˆYˆ
]OOH	ËÚX[	ÊH™]\›ˆœÛÛ”™\ÜÛœÙJÈİ]\Îˆ	ÛÚÉË[Y\İ[\ˆ™]È]J
KÒTÓÔİš[™Ê
HJBˆYˆ
]OOH	ËÉÈ]OOH	ËØ\IÊH™]\›ˆœÛÛ”™\ÜÛœÙJÈ˜[YNˆ	ÔÚİPTIË™\œÚ[Ûˆ	ÍŒIËØÜÎˆ	ÚÎ‹ËÜÚİX\Kš[‹ÙØÜÉÈJB‚ˆËÈPRS•SSÑHSÑNˆ]\ÙH]™\][™È^Ù\X[İ]\Ë[™YZ[‹‚ˆËÈHLÈ[ÛÈÛX\œÈHÚİWİÚÙ[ˆÛÛÚÚYHHÙÙÚ[™È]™\H\Ù\ˆİ]‚ˆYˆ
]OOH	ËÚX[	È	‰ˆ]š[™^ÙŠ	ËØ\KØYZ[‰ÊHOOH	‰ˆ]OOH	ËØ\KÛXZ[[˜[˜ÙIÊHÂˆYˆ

]ØZ]Ù]Ù][™Ê[‹	ÛXZ[[˜[˜ÙIÊJHOOH	ÛÛ‰ÊHÂˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈ\œ›Üˆ	ÔÚİPTH\È[™\ˆØÚY[YXZ[[˜[˜ÙKˆX\ÙHÚXÚÈ˜XÚÈÚÜK‰ËXZ[[˜[˜ÙNˆYHKLËÈ	ÔÙ]PÛÛÚÚYIÎˆÛX\]]ÛÛÚÚYJ
HJBˆBˆB‚ˆËÈP“PÎˆPRS•SSÑHÕUTÂˆYˆ
]OOH	ËØ\KÛXZ[[˜[˜ÙIÈ	‰ˆ™\]Y\İ›Y]ÙOOH	ÑÑU	ÊHÂˆ˜\ˆTİ]\ÈH
]ØZ]Ù]Ù][™Ê[‹	ÛXZ[[˜[˜ÙIÊJHOOH	ÛÛ‰Âˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈXZ[[˜[˜ÙNˆTİ]\ÈJBˆB‚ˆËÈUUˆÒQÓ•TˆYˆ
]OOH	ËØ\KØ]]ÜÚYÛ\	È	‰ˆ™\]Y\İ›Y]ÙOOH	ÔÔÕ	ÊHÂˆHÂˆ˜\ˆÛY[THÙ]ÛY[T
™\]Y\İ
Bˆ˜\ˆÚYÛ\][\ÈH]ØZ]ÚXÚÔ˜]S[Z]
[‹ÛY[T	ÜÚYÛ\	ÊBˆYˆ
ÚYÛ\][\ÈHJH™]\›ˆœÛÛ‘\œ›ÜŠK	ÕÛÈX[HÚYÛ\][\ËˆX\ÙHHYØZ[ˆ[ˆMHZ[]\Ë‰ÊBˆİØZ][[
ÛX[\][\Ê[ŠJBˆ˜\ˆ›ÙHH]ØZ]™\]Y\İšœÛÛŠ
BˆYˆ
X›ÙK™[XZ[X›ÙKœ\ÜİÛÜ™
H™]\›ˆœÛÛ‘\œ›ÜŠ	Ñ[XZ[[™\ÜİÛÜ™™\]Z\™Y	ÊBˆYˆ
›ÙKœ\ÜİÛÜ™›[™İŠH™]\›ˆœÛÛ‘\œ›ÜŠ	Ô\ÜİÛÜ™]\İ™H]X\İˆÚ\˜Xİ\œÉÊBˆ˜\ˆ^\İ[™ÈH]ØZ][‹‘‹œ™\\™J	ÔÑSPÕY”“ÓH\Ù\œÈÒT‘H[XZ[HÉÊK˜š[™
›ÙK™[XZ[
K™š\œİ

BˆYˆ
^\İ[™ÊHÈİØZ][[
ÙĞ][\
[‹ÛY[T	ÜÚYÛ\	ÊJNÈ™]\›ˆœÛÛ‘\œ›ÜŠK	Ñ[XZ[[™XYH™YÚ\İ\™Y	ÊHBˆ˜\ˆØ[HÙ[™\˜]RY

Bˆ˜\ˆ\ÚYÈH]ØZ]\Ú\ÜİÛÜ™’ÑŒŠ›ÙKœ\ÜİÛÜ™Ø[
Bˆ˜\ˆ\RÙ^HHÙ[™\˜]P\RÙ^J
Bˆ˜\ˆ\RÙ^R\ÚH]ØZ]\Ú\RÙ^J\RÙ^JBˆ˜\ˆ\RÙ^Q\Ü^U˜[H\RÙ^Q\Ü^J\RÙ^JBˆ˜\ˆ\Ù\’YHÙ[™\˜]RY

Bˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆÚÙ[ˆH]ØZ]XZÙR•Õ
ÈZYˆ\Ù\’Y[XZ[ˆ›ÙK™[XZ[X]ˆ]K››İÊ
HKİÙXÜ™]
Bˆ]ØZ][‹‘‹œ™\\™J	ÒS”ÑT•S•È\Ù\œÈ
Y[XZ[\ÜİÛÜ™Ú\ÚØ[\WÚÙ^K\WÚÙ^WÚ\Ú\WÚÙ^WÙ\Ü^K[‹Ü™X]YØ]
HSQTÈ
ËËËËËËËËÊIÊK˜š[™
\Ù\’Y›ÙK™[XZ[\ÚYËØ[\RÙ^K\RÙ^R\Ú\RÙ^Q\Ü^U˜[	Ùœ™YIË™]È]J
KÒTÓÔİš[™Ê
JKœ[Š
BˆİØZ][[
Ù[™Ù[ÛÛYQ[XZ[
[‹›ÙK™[XZ[
JBˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈÚÙ[ˆÚÙ[‹\WÚÙ^Nˆ\RÙ^K\WÚÙ^WÙ\Ü^Nˆ\RÙ^Q\Ü^U˜[[XZ[ˆ›ÙK™[XZ[KŒÈ	ÔÙ]PÛÛÚÚYIÎˆÙ]]]ÛÛÚÚYJÚÙ[ŠHJBˆHØ]Ú
ÚYÛ\\œŠHÂˆ™]\›ˆœÛÛ‘\œ›ÜŠL	ÔÚYÛ\˜Z[Yˆ	È
È
ÚYÛ\\œˆ	‰ˆÚYÛ\\œ‹›Y\ÜØYÙHÈÚYÛ\\œ‹›Y\ÜØYÙHˆİš[™ÊÚYÛ\\œŠJJBˆBˆB‚ˆËÈUUˆÑÒS‚ˆYˆ
]OOH	ËØ\KØ]]ÛÙÚ[‰È	‰ˆ™\]Y\İ›Y]ÙOOH	ÔÔÕ	ÊHÂˆ˜\ˆÛY[THÙ]ÛY[T
™\]Y\İ
Bˆ˜\ˆ][\ÈH]ØZ]ÚXÚÔ˜]S[Z]
[‹ÛY[T	ÛÙÚ[‰ÊBˆYˆ
][\ÈHL
H™]\›ˆœÛÛ‘\œ›ÜŠK	ÕÛÈX[HÙÚ[ˆ][\ËˆX\ÙHHYØZ[ˆ[ˆMHZ[]\Ë‰ÊBˆİØZ][[
ÛX[\][\Ê[ŠJBˆ˜\ˆ›ÙHH]ØZ]™\]Y\İšœÛÛŠ
BˆYˆ
X›ÙK™[XZ[X›ÙKœ\ÜİÛÜ™
H™]\›ˆœÛÛ‘\œ›ÜŠ	Ñ[XZ[[™\ÜİÛÜ™™\]Z\™Y	ÊBˆ˜\ˆ\Ù\ˆH]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ
ˆ”“ÓH\Ù\œÈÒT‘H[XZ[HÉÊK˜š[™
›ÙK™[XZ[
K™š\œİ

BˆYˆ
]\Ù\ŠHÈİØZ][[
ÙĞ][\
[‹ÛY[T	ÛÙÚ[‰ÊJNÈ™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[Y[XZ[Üˆ\ÜİÛÜ™	ÊHBˆ˜\ˆ\Õ˜[YH]ØZ]™\šYT\ÜİÛÜ™
›ÙKœ\ÜİÛÜ™\Ù\‹œ\ÜİÛÜ™Ú\Ú\Ù\‹œØ[
BˆYˆ
Z\Õ˜[Y
HÈİØZ][[
ÙĞ][\
[‹ÛY[T	ÛÙÚ[‰ÊJNÈ™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[Y[XZ[Üˆ\ÜİÛÜ™	ÊHBˆËÈZYÜ˜]HÛÒKLMˆ\ÚÈ’ÑŒˆÛˆİXØÙ\ÜÙ[ÙÚ[‚ˆYˆ
\Ù\‹œ\ÜİÛÜ™Ú\Ú	‰ˆ\Ù\‹œ\ÜİÛÜ™Ú\Úš[™^ÙŠ	ÜšÙŒ‰ÊHOOH
HÂˆ˜\ˆ™]ÔØ[HÙ[™\˜]RY

Bˆ˜\ˆ™]Ò\ÚH]ØZ]\Ú\ÜİÛÜ™’ÑŒŠ›ÙKœ\ÜİÛÜ™™]ÔØ[
Bˆ]ØZ][‹‘‹œ™\\™J	ÕTUH\Ù\œÈÑU\ÜİÛÜ™Ú\ÚHËØ[HÈÒT‘HYHÉÊK˜š[™
™]Ò\Ú™]ÔØ[\Ù\‹šY
Kœ[Š
BˆBˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆÚÙ[ˆH]ØZ]XZÙR•Õ
ÈZYˆ\Ù\‹šY[XZ[ˆ\Ù\‹™[XZ[X]ˆ]K››İÊ
HKİÙXÜ™]
Bˆ˜\ˆ\Ü^RÙ^HH\Ù\‹˜\WÚÙ^WÙ\Ü^H\RÙ^Q\Ü^J\Ù\‹˜\WÚÙ^JH	ÜÚ×Û]™WË‹‹‰Âˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈÚÙ[ˆÚÙ[‹\WÚÙ^Nˆ
\Ù\‹˜\WÚÙ^H	‰ˆ\Ù\‹˜\WÚÙ^HOOH	Ô‘U“ÒÑQ	ÊHÈ\Ù\‹˜\WÚÙ^Hˆ[\WÚÙ^WÙ\Ü^Nˆ\Ü^RÙ^K[XZ[ˆ\Ù\‹™[XZ[[ˆ\Ù\‹œ[‹šX[Üİ\YØ]ˆ\Ù\‹šX[Üİ\YØ][—Ù^\™\×Ø]ˆ\Ù\‹œ[—Ù^\™\×Ø]KŒÈ	ÔÙ]PÛÛÚÚYIÎˆÙ]]]ÛÛÚÚYJÚÙ[ŠHJBˆB‚ˆËÈUUˆQHˆYˆ
]OOH	ËØ\KØ]]ÛYIÈ	‰ˆ™\]Y\İ›Y]ÙOOH	ÑÑU	ÊHÂˆ˜\ˆÚÙ[ˆHÙ]ÚÙ[‘œ›ÛT™\]Y\İ
™\]Y\İ
BˆYˆ
]ÚÙ[ŠH™]\›ˆœÛÛ‘\œ›ÜŠK	Ó›İ]][XØ]Y	ÊBˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆXÛÙYH]ØZ]™\šYR•Õ
ÚÙ[‹İÙXÜ™]
BˆYˆ
YXÛÙY
H™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[YÚÙ[‰ÊBˆ˜\ˆ\Ù\ˆH]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ
ˆ”“ÓH\Ù\œÈÒT‘HYHÉÊK˜š[™
XÛÙYZY
K™š\œİ

BˆYˆ
]\Ù\ŠH™]\›ˆœÛÛ‘\œ›ÜŠ	Õ\Ù\ˆ›İ›İ[™	ÊBˆ˜\ˆ\Ü^RÙ^HH\Ù\‹˜\WÚÙ^WÙ\Ü^H\RÙ^Q\Ü^J\Ù\‹˜\WÚÙ^JH	ÜÚ×Û]™WË‹‹‰Âˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈYˆ\Ù\‹šY[XZ[ˆ\Ù\‹™[XZ[\WÚÙ^Nˆ
\Ù\‹˜\WÚÙ^H	‰ˆ\Ù\‹˜\WÚÙ^HOOH	Ô‘U“ÒÑQ	ÊHÈ\Ù\‹˜\WÚÙ^Hˆ[\WÚÙ^WÙ\Ü^Nˆ\Ü^RÙ^K[ˆ\Ù\‹œ[‹šX[Ù^\™Yˆ\ÕšX[^\™Y
\Ù\ŠHJBˆB‚ˆËÈUUˆÑÓÕUˆYˆ
]OOH	ËØ\KØ]]ÛÙÛİ]	È	‰ˆ™\]Y\İ›Y]ÙOOH	ÔÔÕ	ÊHÂˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈİXØÙ\ÜÎˆYHKŒÈ	ÔÙ]PÛÛÚÚYIÎˆÛX\]]ÛÛÚÚYJ
HJBˆB‚ˆËÈUUˆ‘QÑS‘TUBˆYˆ
]OOH	ËØ\KØ]]Ü™YÙ[™\˜]IÈ	‰ˆ™\]Y\İ›Y]ÙOOH	ÔÔÕ	ÊHÂˆHÂˆ˜\ˆÚÙ[ˆHÙ]ÚÙ[‘œ›ÛT™\]Y\İ
™\]Y\İ
BˆYˆ
]ÚÙ[ŠH™]\›ˆœÛÛ‘\œ›ÜŠK	Ó›İ]][XØ]Y	ÊBˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆXÛÙYH]ØZ]™\šYR•Õ
ÚÙ[‹İÙXÜ™]
BˆYˆ
YXÛÙY
H™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[YÚÙ[‰ÊBˆ˜\ˆ™]ÒÙ^HHÙ[™\˜]P\RÙ^J
Bˆ˜\ˆ™]Ò\ÚH]ØZ]\Ú\RÙ^J™]ÒÙ^JBˆ˜\ˆ™]Ñ\Ü^HH\RÙ^Q\Ü^J™]ÒÙ^JBˆ]ØZ][‹‘‹œ™\\™J•TUH\Ù\œÈÑU\WÚÙ^HH	Ô‘U“ÒÑQ	Ë\WÚÙ^WÚ\ÚHË\WÚÙ^WÙ\Ü^HHÈÒT‘HYHÈŠK˜š[™
™]Ò\Ú™]Ñ\Ü^KXÛÙYZY
Kœ[Š
Bˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈ\WÚÙ^Nˆ™]ÒÙ^K\WÚÙ^WÙ\Ü^Nˆ™]Ñ\Ü^HKŒÈ	ÔÙ]PÛÛÚÚYIÎˆÙ]]]ÛÛÚÚYJÚÙ[ŠHJBˆHØ]Ú
™YÙ[‘\œŠHÂˆ™]\›ˆœÛÛ‘\œ›ÜŠL	Ô™YÙ[™\˜]H˜Z[Yˆ	È
È
™YÙ[‘\œˆ	‰ˆ™YÙ[‘\œ‹›Y\ÜØYÙHÈ™YÙ[‘\œ‹›Y\ÜØYÙHˆİš[™Ê™YÙ[‘\œŠJJBˆBˆB‚ˆËÈUUˆ“Ô‘ÓÕTÔÕÓÔ‘ˆYˆ
]OOH	ËØ\KØ]]Ù›Ü™Ûİ\\ÜİÛÜ™	È	‰ˆ™\]Y\İ›Y]ÙOOH	ÔÔÕ	ÊHÂˆ˜\ˆ™\Ù]THÙ]ÛY[T
™\]Y\İ
Bˆ˜\ˆ™\Ù]][\ÈH]ØZ]ÚXÚÔ˜]S[Z]
[‹™\Ù]T	Ü™\Ù]	ÊBˆYˆ
™\Ù]][\ÈHJH™]\›ˆœÛÛ‘\œ›ÜŠK	ÕÛÈX[H™\Ù]][\ËˆX\ÙHHYØZ[ˆ[ˆMHZ[]\Ë‰ÊBˆ˜\ˆ›ÙHH]ØZ]™\]Y\İšœÛÛŠ
BˆYˆ
X›ÙK™[XZ[
H™]\›ˆœÛÛ‘\œ›ÜŠ	Ñ[XZ[™\]Z\™Y	ÊBˆ˜\ˆ\Ù\ˆH]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ
ˆ”“ÓH\Ù\œÈÒT‘H[XZ[HÉÊK˜š[™
›ÙK™[XZ[
K™š\œİ

BˆYˆ
]\Ù\ŠH™]\›ˆœÛÛ”™\ÜÛœÙJÈİXØÙ\ÜÎˆYKY\ÜØYÙNˆ	ÒYˆH[XZ[^\İËH™\Ù][šÈ\È™Y[ˆÙ[‰ÈJBˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆ™\Ù]ÚÙ[ˆH]ØZ]XZÙR•Õ
ÈZYˆ\Ù\‹šY[XZ[ˆ\Ù\‹™[XZ[™\Ù]ˆYKX]ˆ]K››İÊ
K^ˆ]K››İÊ
H
ÈÍŒKİÙXÜ™]
Bˆ]ØZ][‹‘‹œ™\\™J	ÕTUH\Ù\œÈÑU™\Ù]İÚÙ[ˆHÈÒT‘HYHÉÊK˜š[™
™\Ù]ÚÙ[‹\Ù\‹šY
Kœ[Š
BˆİØZ][[
Ù[™\ÜİÛÜ™™\Ù][XZ[
[‹›ÙK™[XZ[™\Ù]ÚÙ[ŠJBˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈİXØÙ\ÜÎˆYKY\ÜØYÙNˆ	ÒYˆH[XZ[^\İËH™\Ù][šÈ\È™Y[ˆÙ[‰ÈJBˆB‚ˆËÈUUˆ‘TÑUTÔÕÓÔ‘ˆYˆ
]OOH	ËØ\KØ]]Ü™\Ù]\\ÜİÛÜ™	È	‰ˆ™\]Y\İ›Y]ÙOOH	ÔÔÕ	ÊHÂˆ˜\ˆ›ÙHH]ØZ]™\]Y\İšœÛÛŠ
BˆYˆ
X›ÙKÚÙ[ˆX›ÙKœ\ÜİÛÜ™
H™]\›ˆœÛÛ‘\œ›ÜŠ	ÕÚÙ[ˆ[™™]È\ÜİÛÜ™™\]Z\™Y	ÊBˆYˆ
›ÙKœ\ÜİÛÜ™›[™İŠH™]\›ˆœÛÛ‘\œ›ÜŠ	Ô\ÜİÛÜ™]\İ™H]X\İˆÚ\˜Xİ\œÉÊBˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆXÛÙYH]ØZ]™\šYR•Õ
›ÙKÚÙ[‹İÙXÜ™]
BˆYˆ
YXÛÙYYXÛÙYœ™\Ù]
H™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[YÜˆ^\™Y™\Ù]ÚÙ[‰ÊBˆYˆ
]K››İÊ
HˆXÛÙY™^
H™]\›ˆœÛÛ‘\œ›ÜŠK	Ô™\Ù]ÚÙ[ˆ\È^\™Y™	ÊBˆ˜\ˆ\Ù\ˆH]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ
ˆ”“ÓH\Ù\œÈÒT‘HYHÈS‘™\Ù]İÚÙ[ˆHÉÊK˜š[™
XÛÙYZY›ÙKÚÙ[ŠK™š\œİ

BˆYˆ
]\Ù\ŠH™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[Y™\Ù]ÚÙ[‰ÊBˆ˜\ˆ™]ÔØ[HÙ[™\˜]RY

Bˆ˜\ˆ™]Ò\ÚH]ØZ]\Ú\ÜİÛÜ™’ÑŒŠ›ÙKœ\ÜİÛÜ™™]ÔØ[
Bˆ]ØZ][‹‘‹œ™\\™J	ÕTUH\Ù\œÈÑU\ÜİÛÜ™Ú\ÚHËØ[HË™\Ù]İÚÙ[ˆH•SÒT‘HYHÉÊK˜š[™
™]Ò\Ú™]ÔØ[\Ù\‹šY
Kœ[Š
Bˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈİXØÙ\ÜÎˆYKY\ÜØYÙNˆ	Ô\ÜİÛÜ™™\Ù]İXØÙ\ÜÙ[K‰ÈJBˆB‚ˆËÈTĞQÑBˆYˆ
]OOH	ËØ\Kİ\ØYÙIÈ	‰ˆ™\]Y\İ›Y]ÙOOH	ÑÑU	ÊHÂˆ˜\ˆÚÙ[ˆHÙ]ÚÙ[‘œ›ÛT™\]Y\İ
™\]Y\İ
BˆYˆ
]ÚÙ[ŠH™]\›ˆœÛÛ‘\œ›ÜŠK	Ó›İ]][XØ]Y	ÊBˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆXÛÙYH]ØZ]™\šYR•Õ
ÚÙ[‹İÙXÜ™]
BˆYˆ
YXÛÙY
H™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[YÚÙ[‰ÊBˆ˜\ˆ\Ù\ˆH]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ
ˆ”“ÓH\Ù\œÈÒT‘HYHÉÊK˜š[™
XÛÙYZY
K™š\œİ

BˆYˆ
]\Ù\ŠH™]\›ˆœÛÛ‘\œ›ÜŠ	Õ\Ù\ˆ›İ›İ[™	ÊBˆ˜\ˆ\ÙYH]ØZ]Ù]\ØYÙPÛİ[
[‹\Ù\‹˜\WÚÙ^JBˆ˜\ˆ[Z]H
S”Öİ\Ù\‹œ[—H	‰ˆS”Öİ\Ù\‹œ[—K›[Z]
Hˆ˜\ˆ™XÙ[H]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ\›[Y\İ[\”“ÓH\ØYÙHÒT‘H\WÚÙ^HHÈÔ‘Tˆ–H[Y\İ[\TĞÈSRUL	ÊK˜š[™
\Ù\‹˜\WÚÙ^JK˜[

Bˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈİ]ÎˆÈ\ÙYˆ\ÙY[Z]ˆ[Z][ˆ\Ù\‹œ[‹šX[Ù^\™Yˆ\ÕšX[^\™Y
\Ù\ŠHK™XÙ[ˆ™XÙ[œ™\İ[È×HJBˆB‚ˆËÈ’SS‘ÎˆÔ‘PUHÔ‘TˆÈÕP”ĞÔ’TSÓ‚ˆYˆ
]OOH	ËØ\KØš[[™ËØÜ™X]K[Ü™\‰È	‰ˆ™\]Y\İ›Y]ÙOOH	ÔÔÕ	ÊHÂˆ˜\ˆÚÙ[ˆHÙ]ÚÙ[‘œ›ÛT™\]Y\İ
™\]Y\İ
BˆYˆ
]ÚÙ[ŠH™]\›ˆœÛÛ‘\œ›ÜŠK	Ó›İ]][XØ]Y	ÊBˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆXÛÙYH]ØZ]™\šYR•Õ
ÚÙ[‹İÙXÜ™]
BˆYˆ
YXÛÙY
H™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[YÚÙ[‰ÊBˆ˜\ˆ›ÙHH]ØZ]™\]Y\İšœÛÛŠ
Bˆ˜\ˆ[’Ù^HH›ÙKœ[‚ˆ˜\ˆ[ˆHS”ÖÜ[’Ù^WBˆYˆ
\[ˆ[’Ù^HOOH	Ùœ™YIÈ[’Ù^HOOH	Û›Û™IÊH™]\›ˆœÛÛ‘\œ›ÜŠ	Ò[˜[Y[‰ÊB‚ˆYˆ
Y[‹”–”ÒÑVWÔÑPÔ‘U[‹”–”ÒÑVWÒQš[™^ÙŠ	Üœİ\İÉÊHOOH
HÂˆ˜\ˆ[[Ó›İÈH™]È]J
KÒTÓÔİš[™Ê
BˆYˆ
[‹\HOOH	ÛÛ™Wİ[YIÊHÂˆ]ØZ][‹‘‹œ™\\™J	ÕTUH\Ù\œÈÑU[ˆHËšX[Üİ\YØ]HÈÒT‘HYHÉÊK˜š[™
[’Ù^K[[Ó›İËXÛÙYZY
Kœ[Š
BˆH[ÙHÂˆ˜\ˆ[[Ñ^\™\ÈH™]È]J]K››İÊ
H
ÈÌ
ˆ
ˆŒ
ˆŒ
ˆL
KÒTÓÔİš[™Ê
Bˆ]ØZ][‹‘‹œ™\\™J	ÕTUH\Ù\œÈÑU[ˆHË[—Ù^\™\×Ø]HÈÒT‘HYHÉÊK˜š[™
[’Ù^K[[Ñ^\™\ËXÛÙYZY
Kœ[Š
BˆBˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈ[[ÎˆYK[ˆ[’Ù^K[[İ[ˆ[‹œšXÙH
ˆL\Nˆ[‹\KXİ]˜]YˆYHJBˆB‚ˆYˆ
[‹\HOOH	ÛÛ™Wİ[YIÊHÂˆ˜\ˆ[[İ[H[‹œšXÙH
ˆLˆ˜\ˆœ™\ÜH]ØZ]™]Ú
	ÚÎ‹ËØ\Kœ˜^›Üœ^K˜ÛÛKİŒKÛÜ™\œÉËÂˆY]Ùˆ	ÔÔÕ	ËˆXY\œÎˆÈ	Ğ]]Üš^˜][Û‰Îˆœ]]XY\Š[Š), 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amount, currency: 'INR', receipt: 'shotly_trial_' + decoded.uid + '_' + Date.now(), notes: { plan: planKey, user_id: decoded.uid } }),
        })
        var order = await rzpResp.json()
        return jsonResponse({ key_id: env.RZP_KEY_ID, order_id: order.id, amount: amount, type: 'one_time', plan: planKey })
      }

      var planIdEnvVar = RZP_PLAN_IDS[planKey]
      var razorpayPlanId = env[planIdEnvVar]
      if (!razorpayPlanId) return jsonError(500, 'Subscription plan not configured. Set '+ planIdEnvVar + ' in Worker env vars.')
      var rzpResp2 = await fetch('https://api.razorpay.com/v1/subscriptions', {
        method: 'POST',
        headers: { 'Authorization': rzpAuthHeader(env), 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: razorpayPlanId, customer_notify: 1, quantity: 1, total_count: 12, notes: { plan: planKey, user_id: decoded.uid } }),
      })
      var subscription = await rzpResp2.json()
      if (subscription.error) return jsonError(500, 'Razorpay error: ' + (subscription.error.description || 'Unknown'))
      return jsonResponse({ key_id: env.RZP_KEY_ID, subscription_id: subscription.id, plan: planKey, type: 'subscription', amount: plan.price * 100 })
    }

    // BILLING: VERIFY
    if (path === '/api/billing/verify' && request.method === 'POST') {
      var token = getTokenFromRequest(request)
      if (!token) return jsonError(401, 'Not authenticated')
      var jwtSecret = env.JWT_SECRET
      var decoded = await verifyJWT(token, jwtSecret)
      if (!decoded) return jsonError(401, 'Invalid token')
      var body = await request.json()
      var planKey = body.plan
      var plan = PLANS[planKey]
      if (!plan) return jsonError(400, 'Invalid plan')

      if (!env.RZP_KEY_SECRET || env.RZP_KEY_ID.indexOf('rzp_test_') === 0) {
        var now = new Date().toISOString()
        if (plan.type === 'one_time') {
          await env.DB.prepare('UPDATE users SET plan = ?, trial_started_at = ? WHERE id = ?').bind(planKey, now, decoded.uid).run()
        } else {
          await env.DB.prepare('UPDATE users SET plan = ? WHERE id = ?').bind(planKey, decoded.uid).run()
        }
        return jsonResponse({ success: true, plan: planKey })
      }

      // TRIAL: Verify one-time payment with HMAC-SHA256
      if (plan.type === 'one_time') {
        var body2 = body.razorpay_order_id + '|' + body.razorpay_payment_id
        var expectedSig = await hmacSha256(body2, env.RZP_KEY_SECRET)
        if (expectedSig === body.razorpay_signature) {
          var now2 = new Date().toISOString()
          await env.DB.prepare('UPDATE users SET plan = ?, trial_started_at = ? WHERE id = ?').bind(planKey, now2, decoded.uid).run()
          return jsonResponse({ success: true, plan: planKey, trial_started_at: now2 })
        } else {
          return jsonError(400, 'Payment verification failed')
        }
      }
    

      // MONTHLY: Verify subscription payment with HMAC-SHA256
      var subId = body.razorpay_subscription_id
      var paymentId = body.razorpay_payment_id
      var signature = body.razorpay_signature
      if (!subId || !paymentId || !signature) return jsonError(400, 'Missing subscription payment details')
      var body2b = paymentId + '|' + subId
      var expectedSig2 = await hmacSha256(body2b, env.RZP_KEY_SECRET)
      if (expectedSig2 === signature) {
        var expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        await env.DB.prepare('UPDATE users SET plan = ?, subscription_id = ?, plan_expires_at = ? WHERE id = ?').bind(planKey, subId, expiresAt, decoded.uid).run()
        return jsonResponse({ success: true, plan: planKey, subscription_id: subId })
      } else {
        return jsonError(400, 'Subscription payment verification failed')
      }
    }

    // BILLING: WEBHOOK
    if (path === '/api/billing/webhook' && request.method === 'POST') {
      var body = await request.json()
      var webhookSig = request.headers.get('X-Razorpay-Signature')
      var webhookSecret = env.RZP_WEBHOOK_SECRET
      if (!webhookSecret) return jsonError(500, 'Webhook secret not configured')
      {
        var rawBody = JSON.stringify(body)
        var expectedWhSig = await hmacSha256(rawBody, webhookSecret)
        if (webhookSig !== expectedWhSig) return jsonError(401, 'Invalid webhook signature')
      }
      var event = body.event
      if (event === 'subscription.charged') {
        var subId2 = (body.payload && body.payload.subscription && body.payload.subscription.entity) ? body.payload.subscription.entity.id : null
        if (subId2) {
          var user2 = await env.DB.prepare('SELECT * FROM users WHERE subscription_id = ?').bind(subId2).first()
          if (user2) {
            var expiresAt2 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            await env.DB.prepare('UPDATE users SET plan_expires_at = ? WHERE id = ?').bind(expiresAt2, user2.id).run()
            var subAmt = body.payload.subscription.entity.amount || 0
            ctx.waitUntil(env.DB.prepare('INSERT INTO payments (id, user_id, amount, plan, status, razorpay_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(generateId(), user2.id, subAmt, user2.plan, 'captured', subId2, new Date().toISOString()).run())
          }
        }
      }
      if (event === 'payment.captured') {
        var payEntity = (body.payload && body.payload.payment && body.payload.payment.entity) ? body.payload.payment.entity : null
        if (payEntity && payEntity.amount) {
          var payEmail = payEntity.notes && payEntity.notes.email ? payEntity.notes.email : null
          var payUser = payEmail ? await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(payEmail).first() : null
          if (payUser) {
            ctx.waitUntil(env.DB.prepare('INSERT INTO payments (id, user_id, amount, plan, status, razorpay_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(generateId(), payUser.id, payEntity.amount, 'trial', 'captured', payEntity.id, new Date().toISOString()).run())
          }
        }
      }
      if (event === 'payment.failed') {
        var failEntity = (body.payload && body.payload.payment && body.payload.payment.entity) ? body.payload.payment.entity : null
        if (failEntity) {
          var failEmail = failEntity.notes && failEntity.notes.email ? failEntity.notes.email : null
          var failUser = failEmail ? await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(failEmail).first() : null
          if (failUser) {
            ctx.waitUntil(env.DB.prepare('INSERT INTO payments (id, user_id, amount, plan, status, razorpay_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(generateId(), failUser.id, failEntity.amount || 0, 'trial', 'failed', failEntity.id, new Date().toISOString()).run())
          }
        }
      }
      if (event === 'subscription.cancelled') {
        var subId3 = (body.payload && body.payload.subscription && body.payload.subscription.entity) ? body.payload.subscription.entity.id : null
        if (subId3) {
          var user3 = await env.DB.prepare('SELECT * FROM users WHERE subscription_id = ?').bind(subId3).first()
          if (user3) { await env.DB.prepare('UPDATE users SET plan = ? WHERE id = ?').bind('free', user3.id).run() }
        }
      }
      return jsonResponse({ received: true })
    }

    // BULK SCREENSHOT
    if (path === '/api/screenshot/bulk' && request.method === 'POST') {
      var token = getTokenFromRequest(request)
      if (!token) return jsonError(401, 'Not authenticated')
      var jwtSecret = env.JWT_SECRET
      var decoded = await verifyJWT(token, jwtSecret)
      if (!decoded) return jsonError(401, 'Invalid token')
      var body = await request.json()
      if (!body.api_key) return jsonError(400, 'Missing api_key')
      var user = await getUserByApiKey(env, body.api_key)
      if (!user) return jsonError(401, 'Invalid API key')
      if (user.plan === 'none') return jsonError(403, 'No active plan. Purchase at https://shotlyapi.in/billing')
      if (isTrialExpired(user)) return jsonError(403, 'Trial expired. Upgrade at https://shotlyapi.in/billing')
      var oracleUrl = (env.ORACLE_SERVER_URL || 'http://localhost:3000') + '/api/screenshot/bulk'
      var response = await fetch(oracleUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Server-Secret': env.SERVER_SECRET || '' }, body: JSON.stringify(body), signal: AbortSignal.timeout(120000) })
      if (body.urls && Array.isArray(body.urls)) { for (var i = 0; i < body.urls.length; i++) { await logUsage(env, body.api_key, body.urls[i]) } }
      var data = await response.json()
      return jsonResponse(data)
    }

    // SCREENSHOT
    if (path === '/api/screenshot' && request.method === 'GET') {
      var params = getScreenshotParams(url)
      if (!params.url && !params.custom_html) return jsonError(400, 'Missing required parameter: url or custom_html')
      // Check Authorization header first, fall back to URL param for demo key only
      var headerKey = null
      var authHdr = request.headers.get('Authorization')
      if (authHdr && authHdr.indexOf('Bearer ') === 0) headerKey = authHdr.replace('Bearer ', '')
      var apiKey = headerKey || params.api_key
      if (!apiKey) return jsonError(401, 'Missing required parameter: api_key. Use Authorization header or api_key URL param')
      // If using URL param (not header), only allow the demo key
      if (!headerKey && params.api_key && params.api_key !== 'demo-key-shotly') {
        return jsonError(401, 'For security, API keys must be sent via Authorization header. Example: Authorization: Bearer sk_live_xxx')
      }
      var user = await getUserByApiKey(env, apiKey)
      if (!user) return jsonError(401, 'Invalid API key. Get one at https://shotlyapi.in')
      if (user.plan === 'none') return jsonError(403, 'No active plan. Purchase at https://shotlyapi.in/billing')
      if (isTrialExpired(user)) return jsonError(403, 'Your 7-day Trial has expired. Upgrade at https://shotlyapi.in/billing')
      var used = await getUsageCount(env, apiKey)
      var limit = (PLANS[user.plan] && PLANS[user.plan].limit) || 0
      if (used >= limit) return jsonError(403, 'Usage limit exceeded (' + used + '/' + limit + '). Upgrade at https://shotlyapi.in/billing')

      if (params.extract_text === 'true') {
        var oracleUrl = buildOracleUrl(env, params)
        try {
          var resp = await fetch(oracleUrl, { signal: AbortSignal.timeout(45000), headers: { 'X-Server-Secret': env.SERVER_SECRET || '' } })
          if (!resp.ok) return jsonError(500, 'Text extraction failed.')
          var tdata = await resp.json()
          await logUsage(env, apiKey, params.url || 'custom_html')
          return jsonResponse(tdata)
        } catch (e) { return jsonError(500, 'Could not reach screenshot server.') }
      }

      var cacheKey = buildCacheKey(params)
      if (env.SCREENSHOTS && params.fresh !== 'true') {
        var cached = await env.SCREENSHOTS.get(cacheKey)
        if (cached) {
          await logUsage(env, apiKey, params.url || 'custom_html')
          var ct = params.format === 'pdf' ? 'application/pdf' : 'image/' + params.format
          return new Response(cached, { headers: { 'Content-Type': ct, 'X-Cache': 'HIT', 'Access-Control-Allow-Origin': 'https://shotlyapi.in', 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' } })
        }
      }

      var oracleUrl2 = buildOracleUrl(env, params)
      try {
        var resp2 = await fetch(oracleUrl2, { signal: AbortSignal.timeout(45000), headers: { 'X-Server-Secret': env.SERVER_SECRET || '' } })
        if (!resp2.ok) return jsonError(500, 'Screenshot failed. The URL might not be accessible.')
        var imageBuffer = await resp2.arrayBuffer()
        if (env.SCREENSHOTS) { await env.SCREENSHOTS.put(cacheKey, imageBuffer, { customMetadata: { url: params.url || 'custom_html', created: new Date().toISOString() } }) }
        await logUsage(env, apiKey, params.url || 'custom_html')
        var ct2 = params.format === 'pdf' ? 'application/pdf' : 'image/' + params.format
        return new Response(imageBuffer, { headers: { 'Content-Type': ct2, 'X-Cache': 'MISS', 'Access-Control-Allow-Origin': 'https://shotlyapi.in', 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' } })
      } catch (e) {
        return jsonError(500, 'Could not reach screenshot server. Try again in a few seconds.')
      }
    }

    // ============ ADMIN SECTION - Add before the 404 catch-all ============

// ADMIN: TRACK (public, no auth, rate limited)
    if (path === '/api/admin/track' && request.method === 'POST') {
      try {
        var body = await request.json()
        var page = body.page || '/'
        var referrer = body.referrer || ''
        var device = body.device || 'desktop'
        var sessionId = body.session_id || generateId()
        var today = new Date().toISOString()
        ctx.waitUntil(env.DB.prepare('INSERT INTO page_views (id, page, referrer, device, session_id, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(generateId(), page, referrer, device, sessionId, today).run())
        return new Response(null, { status: 204 })
      } catch(e) {
        return new Response(null, { status: 204 })
      }
    }

// Admin auth helper
    async function requireAdmin(request, env) {
      var cookieToken = getCookie(request, 'shotly_admin')
      if (!cookieToken) return null
      var decoded = await verifyJWT(cookieToken, env.JWT_SECRET)
      if (!decoded || decoded.role !== 'admin') return null
      return decoded
    }

// ADMIN: LOGIN
    if (path === '/api/admin/login' && request.method === 'POST') {
      try {
        var body = await request.json()
        if (!body.email || !body.password) return jsonError(400, 'Email and password required')
        var user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(body.email).first()
        if (!user) return jsonError(401, 'Invalid credentials')
        if (user.plan !== 'admin') return jsonError(403, 'Access denied. Admin only.')
        var isValid = await verifyPassword(body.password, user.password_hash, user.salt)
        if (!isValid) return jsonError(401, 'Invalid credentials')
        var adminToken = await makeJWT({ uid: user.id, email: user.email, role: 'admin', iat: Date.now() }, env.JWT_SECRET)
        return jsonResponse({ success: true, email: user.email }, 200, { 'Set-Cookie': 'shotly_admin=' + adminToken + '; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=14400; Domain=.shotlyapi.in' })
      } catch(e) {
        return jsonError(500, 'Login failed: ' + (e.message || String(e)))
      }
    }

// ADMIN: LOGOUT
    if (path === '/api/admin/logout' && request.method === 'POST') {
      return jsonResponse({ success: true }, 200, { 'Set-Cookie': 'shotly_admin=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0; Domain=.shotlyapi.in' })
    }

// ADMIN: OVERVIEW (KPIs)
    if (path === '/api/admin/overview' && request.method === 'GET') {
      var admin = await requireAdmin(request, env)
      if (!admin) return jsonError(403, 'Admin access required')
      try {
        var totalUsers = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first()
        var totalScreenshots = await env.DB.prepare('SELECT COUNT(*) as count FROM usage').first()
        var todayStart = new Date(); todayStart.setHours(0,0,0,0)
        var screenshotsToday = await env.DB.prepare('SELECT COUNT(*) as count FROM usage WHERE timestamp >= ?').bind(todayStart.toISOString()).first()
        var trialUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE plan = 'trial'").first()
        var starterUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE plan = 'starter'").first()
        var growthUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE plan = 'growth'").first()
        var proUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE plan = 'pro'").first()
        var noneUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE plan = 'none'").first()
        var totalRevenue = await env.DB.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'captured'").first()
        var monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)
        var monthlyRevenue = await env.DB.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'captured' AND created_at >= ?").bind(monthStart.toISOString()).first()
        var failedPayments = await env.DB.prepare("SELECT COUNT(*) as count FROM payments WHERE status = 'failed'").first()
        var pageViewsToday = await env.DB.prepare('SELECT COUNT(*) as count FROM page_views WHERE created_at >= ?').bind(todayStart.toISOString()).first()
        var uniqueVisitorsToday = await env.DB.prepare('SELECT COUNT(DISTINCT session_id) as count FROM page_views WHERE created_at >= ?').bind(todayStart.toISOString()).first()
        var totalPageViews = await env.DB.prepare('SELECT COUNT(*) as count FROM page_views').first()
        var bounceSessions = await env.DB.prepare('SELECT COUNT(*) as count FROM (SELECT session_id, COUNT(*) as c FROM page_views GROUP BY session_id HAVING c = 1)').first()
        var totalSessions = await env.DB.prepare('SELECT COUNT(DISTINCT session_id) as count FROM page_views').first()
        var bounceRate = totalSessions.count > 0 ? Math.round((bounceSessions.count / totalSessions.count) * 100) : 0
        var newUsersThisWeek = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE created_at >= ?").bind(new Date(Date.now() - 7*24*60*60*1000).toISOString()).first()
        return jsonResponse({
          total_users: totalUsers.count,
          total_screenshots: totalScreenshots.count,
          screenshots_today: screenshotsToday.count,
          users_by_plan: { trial: trialUsers.count, starter: starterUsers.count, growth: growthUsers.count, pro: proUsers.count, none: noneUsers.count },
          total_revenue: totalRevenue.total,
          monthly_revenue: monthlyRevenue.total,
          failed_payments: failedPayments.count,
          page_views_today: pageViewsToday.count,
          unique_visitors_today: uniqueVisitorsToday.count,
          total_page_views: totalPageViews.count,
          bounce_rate: bounceRate,
          new_users_this_week: newUsersThisWeek.count
        })
      } catch(e) {
        return jsonError(500, 'Overview failed: ' + (e.message || String(e)))
      }
    }

// ADMIN: USERS LIST
    if (path === '/api/admin/users' && request.method === 'GET') {
      var admin = await requireAdmin(request, env)
      if (!admin) return jsonError(403, 'Admin access required')
      try {
                // Auto-heal: add any missing columns to the users table
        var ucols = await env.DB.prepare('PRAGMA table_info(users)').all()
        var ucolNames = (ucols.results || []).map(function(c) { return c.name })
        var uMissing = {
          api_key_hash: 'TEXT', api_key_display: 'TEXT', trial_started_at: 'TEXT',
          plan_expires_at: 'TEXT', subscription_id: 'TEXT', is_suspended: 'INTEGER DEFAULT 0',
          reset_token: 'TEXT', reset_token_expires: 'TEXT'
        }
        for (var uc in uMissing) {
          if (ucolNames.indexOf(uc) < 0) {
            await env.DB.prepare('ALTER TABLE users ADD COLUMN ' + uc + ' ' + uMissing[uc]).run()
          }
        }
        var planFilter = url.searchParams.get('plan') || ''
        var search = url.searchParams.get('search') || ''
        var page = parseInt(url.searchParams.get('page') || '1')
        var limit = 50
        var offset = (page - 1) * limit
        var query = 'SELECT id, email, plan, api_key_display, created_at, trial_started_at, plan_expires_at, is_suspended FROM users'
        var conditions = []
        var binds = []
        if (planFilter) { conditions.push('plan = ?'); binds.push(planFilter) }
        if (search) { conditions.push('email LIKE ?'); binds.push('%' + search + '%') }
        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ')
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
        binds.push(limit, offset)
        var stmt = env.DB.prepare(query)
        if (binds.length > 0) stmt = stmt.bind.apply(stmt, binds)
        var users = await stmt.all()
        var countQuery = 'SELECT COUNT(*) as count FROM users'
        if (conditions.length > 0) countQuery += ' WHERE ' + conditions.join(' AND ')
        var countStmt = env.DB.prepare(countQuery)
        var countBinds = binds.slice(0, binds.length - 2)
        if (countBinds.length > 0) countStmt = countStmt.bind.apply(countStmt, countBinds)
        var total = await countStmu.first()
        return jsonResponse({ users: users.results || [], total: total.count, page: page, pages: Math.ceil(total.count / limit) })
      } catch(e) {
        return jsonError(500, 'Users query failed: ' + (e.message || String(e)))
      }
    }

// ADMIN: SUSPEND/ACTIVATE USER
    if (path.indexOf('/api/admin/users/') === 0 && path.indexOf('/suspend') >= 0 && request.method === 'POST') {
      var admin = await requireAdmin(request, env)
      if (!admin) return jsonError(403, 'Admin access required')
      try {
        var userId = path.split('/')[4]
        var body = await request.json()
        var suspended = body.suspend ? 1 : 0
        await env.DB.prepare('UPDATE users SET is_suspended = ? WHERE id = ?').bind(suspended, userId).run()
        return jsonResponse({ success: true, suspended: body.suspend })
      } catch(e) {
        return jsonError(500, 'Suspend failed: ' + (e.message || String(e)))
      }
    }

// ADMIN: EXTEND TRIAL
    if (path.indexOf('/api/admin/users/') === 0 && path.indexOf('/extend-trial') >= 0 && request.method === 'POST') {
      var admin = await requireAdmin(request, env)
      if (!admin) return jsonError(403, 'Admin access required')
      try {
        var userId = path.split('/')[4]
        var body = await request.json()
        var days = body.days || 7
        var user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
        if (!user) return jsonError(404, 'User not found')
        var currentExpiry = user.plan_expires_at ? new Date(user.plan_expires_at) : new Date()
        if (currentExpiry < new Date()) currentExpiry = new Date()
        currentExpiry.setDate(currentExpiry.getDate() + days)
        await env.DB.prepare('UPDATE users SET plan_expires_at = ? WHERE id = ?').bind(currentExpiry.toISOString(), userId).run()
        return jsonResponse({ success: true, new_expiry: currentExpiry.toISOString() })
      } catch(e) {
        return jsonError(500, 'Extend trial failed: ' + (e.message || String(e)))
      }
    }

// ADMIN: SALES
    if (path === '/api/admin/sales' && request.method === 'GET') {
      var admin = await requireAdmin(request, env)
      if (!admin) return jsonError(403, 'Admin access required')
      try {
        var dailyRevenue = await env.DB.prepare("SELECT DATE(created_at) as date, SUM(amount) as revenue, COUNT(*) as count FROM payments WHERE status = 'captured' GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30").all()
        var planRevenue = await env.DB.prepare("SELECT plan, SUM(amount) as revenue, COUNT(*) as count FROM payments WHERE status = 'captured' GROUP BY plan").all()
        var trialCount = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE plan = 'trial' OR trial_started_at IS NOT NULL").first()
        var paidCount = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE plan IN ('starter','growth','pro')").first()
        var conversionRate = trialCount.count > 0 ? Math.round((paidCount.count / trialCount.count) * 100) : 0
        return jsonResponse({
          daily: dailyRevenue.results || [],
          by_plan: planRevenue.results || [],
          trial_count: trialCount.count,
          paid_count: paidCount.count,
          conversion_rate: conversionRate
        })
      } catch(e) {
        return jsonError(500, 'Sales query failed: ' + (e.message || String(e)))
      }
    }

// ADMIN: FAILED PAYMENTS
    if (path === '/api/admin/sales/failed' && request.method === 'GET') {
      var admin = await requireAdmin(request, env)
      if (!admin) return jsonError(403, 'Admin access required')
      try {
        var failed = await env.DB.prepare("SELECT p.*, u.email FROM payments p LEFT JOIN users u ON p.user_id = u.id WHERE p.status = 'failed' ORDER BY p.created_at DESC LIMIT 100").all()
        return jsonResponse({ failed_payments: failed.results || [] })
      } catch(e) {
        return jsonError(500, 'Failed payments query failed: ' + (e.message || String(e)))
      }
    }

// ADMIN: TRAFFIC
    if (path === '/api/admin/traffic' && request.method === 'GET') {
      var admin = await requireAdmin(request, env)
      if (!admin) return jsonError(403, 'Admin access required')
      try {
        var dailyViews = await env.DB.prepare("SELECT DATE(created_at) as date, COUNT(*) as views, COUNT(DISTINCT session_id) as visitors FROM page_views GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30").all()
        var topReferrers = await env.DB.prepare("SELECT referrer, COUNT(*) as count FROM page_views WHERE referrer != '' GROUP BY referrer ORDER BY count DESC LIMIT 10").all()
        var deviceBreakdown = await env.DB.prepare("SELECT device, COUNT(*) as count FROM page_views GROUP BY device").all()
        var bounceSessions = await env.DB.prepare("SELECT COUNT(*) as count FROM (SELECT session_id, COUNT(*) as c FROM page_views GROUP BY session_id HAVING c = 1)").first()
        var totalSessions = await env.DB.prepare("SELECT COUNT(DISTINCT session_id) as count FROM page_views").first()
        var bounceRate = totalSessions.count > 0 ? Math.round((bounceSessions.count / totalSessions.count) * 100) : 0
        return jsonResponse({
          daily: dailyViews.results || [],
          referrers: topReferrers.results || [],
          devices: deviceBreakdown.results || [],
          bounce_rate: bounceRate,
          total_sessions: totalSessions.count
        })
      } catch(e) {
        return jsonError(500, 'Traffic query failed: ' + (e.message || String(e)))
      }
    }

// ADMIN: PAGE-WISE TRAFFIC
    if (path === '/api/admin/traffic/pages' && request.method == 'GET') {
      var admin = await requireAdmin(request, env)
      if (!admin) return jsonError(403, 'Admin access required')
      try {
        var pageStats = await env.DB.prepare("SELECT page, COUNT(*) as views, COUNT(DISTINCT session_id) as unique_visitors FROM page_views GROUP BY page ORDER BY views DESC LIMIT 50").all()
        return jsonResponse({ pages: pageStats.results || [] })
      } catch(e) {
        return jsonError(500, 'Page traffic query failed: ' + (e.message || String(e)))
      }
    }

// ADMIN: PLANS
    if (path === '/api/admin/plans' && request.method === 'GET') {
      var admin = await requireAdmin(request, env)
      if (!admin) return jsonError(403, 'Admin access required')
      try {
        var plans = []
        for (var key in PLANS) {
          var planData = PLANS[key]
          var subscriberCount = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE plan = ?").bind(key).first()
          plans.push({ key: key, name: planData.name, price: planData.price, limit: planData.limit, type: planData.type, subscribers: subscriberCount.count, active: planData.active !== false })
        }
        return jsonResponse({ plans: plans })
      } catch(e) {
        return jsonError(500, 'Plans query failed: ' + (e.message || String(e)))
      }
    }

// ADMIN: HEALTH
    if (path === '/api/admin/health' && request.method === 'GET') {
      var admin = await requireAdmin(request, env)
      if (!admin) return jsonError(403, 'Admin access required')
      try {
        var dbSize = await env.DB.prepare("SELECT COUNT(*) as users FROM users").first()
        var usageCount = await env.DB.prepare("SELECT COUNT(*) as count FROM usage").first()
        var viewsCount = await env.DB.prepare("SELECT COUNT(*) as count FROM page_views").first()
        var paymentsCount = await env.DB.prepare("SELECT COUNT(*) as count FROM payments").first()
        var serverStatus = 'unknown'
        try {
          var healthResp = await fetch(env.ORACLE_SERVER_URL + '/health', { headers: { 'X-Server-Secret': env.SERVER_SECRET }, signal: AbortSignal.timeout(5000) })
          serverStatus = healthResp.ok ? 'online' : 'degraded'
        } catch(e2) { serverStatus = 'offline' }
        return jsonResponse({
          database: { users: dbSize.users, usage_records: usageCount.count, page_views: viewsCount.count, payments: paymentsCount.count },
          screenshot_server: serverStatus,
          worker: 'online',
          timestamp: new Date().toISOString()
        })
      } catch(e) {
        return jsonError(500, 'Health check failed: ' + (e.message || String(e)))
      }
    }

    // ADMIN: MAINTENANCE MODE TOGGLE
    if (path === '/api/admin/maintenance' && request.method === 'POST') {
      var mmAdmin = await requireAdmin(request, env)
      if (!mmAdmin) return jsonError(403, 'Admin access required')
      try {
        var mmBody = await request.json()
        await setSetting(env, 'maintenance', mmBody.enabled ? 'on' : 'off')
        var mmOn = (await getSetting(env, 'maintenance')) === 'on'
        return jsonResponse({ maintenance: mmOn, message: mmOn ? 'Maintenance mode ENABLED. All users are being logged out and non-admin API calls are paused.' : 'Maintenance mode DISABLED. Website is back online.' })
      } catch (e) {
        return jsonError(500, 'Failed to toggle maintenance: ' + (e.message || String(e)))
      }
    }

// ============ END ADMIN SECTION ============
    // PUBLIC: FEEDBACK SUBMISSION
    if (path === '/api/feedback' && request.method === 'POST') {
       try {
        await env.DB.prepare(
          "CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, user_id TEXT, email TEXT DEFAULT '', rating INTEGER NOT NULL, category TEXT DEFAULT 'other', message TEXT NOT NULL, ip TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')))"
        ).run()

        var fbIP = getClientIP(request)
        var fbRecent = await env.DB.prepare(
          "SELECT COUNT(*) as count FROM feedback WHERE ip = ? AND created_at >= datetime('now', '-15 minutes')"
        ).bind(fbIP).first()
        if (fbRecent && fbRecent.count >= 5) return jsonError(429, 'Too many submissions. Please try again later.')

        var fbBody = await request.json()
        var fbRating = parseInt(fbBody.rating, 10)
        if (!fbRating || fbRating < 1 || fbRating > 5) return jsonError(400, 'Rating is required (1-5)')
        var fbMessage = String(fbBody.message || '').trim()
        if (!fbMessage) return jsonError(400, 'Message is required')
        if (fbMessage.length > 2000) return jsonError(400, 'Message too long (max 2000 characters)')
        var fbCategory = ['bug', 'feature', 'general', 'pricing', 'docs', 'other'].indexOf(fbBody.category) >= 0 ? fbBody.category : 'other'

        var fbEmail = ''
        var fbUserId = null
        try {
          var fbToken = getTokenFromRequest(request)
          if (fbToken) {
            var fbDecoded = await verifyJWT(fbToken, env.JWT_SECRET)
            if (fbDecoded) {
              fbUserId = fbDecoded.uid
              var fbUser = await env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(fbDecoded.uid).first()
              if (fbUser) fbEmail = fbUser.email
            }
          }
        } catch (e3) {}
        if (!fbEmail && fbBody.email) fbEmail = String(fbBody.email).trim().slice(0, 200)

        await env.DB.prepare(
          'INSERT INTO feedback (id, user_id, email, rating, category, message, ip) VALUES (?, ?, ?, ?, ?, ?, ?)'        )
        .bind(generateId(), fbUserId, fbEmail, fbRating, fbCategory, fbMessage, fbIP).run()

        return jsonResponse({ success: true })
      } catch (e) {
        return jsonError(500, 'Failed to submit feedback. Please try again.')
      }
    }

    // ADMIN: LISF FEEDBACK
    if (path === '/api/admin/feedback' && request.method === 'GET') {
      var admin = await requireAdmin(request, env)
      if (!admin) return jsonError(403, 'Admin access required')
      try {
        var fbList = await env.DB.prepare(
          'SELECT f.id, f.rating, f.category, f.message, f.created_at, COALESCE(f.email, u.email) as email FROM feedback f LEFT JOIN users u ON f.user_id = u.id ORDER BY f.created_at DESC LIMIT 100'
        ).all()
        var fbStats = await env.DB.prepare('SELECT COUNT(*) as total, ROUND(AVG(rating), 2) as avg_rating FROM feedback').first()
        return jsonResponse({
          feedback: fbList.results || [],
          stats: { total: fbStats ? fbStats.total : 0, avg_rating: fbStats ? fbStats.avg_rating : 0 }
        })
      } catch(e) {
        return jsonError(500, 'Failed to load feedback')
      }
    }

    return jsonError(404, 'Not found. Check docs at https://shotlyapi.in/docs')
  },
}
