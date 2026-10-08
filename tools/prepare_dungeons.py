"""Intake supplied dungeon art; preserve sources and reuse established matte removal."""

import argparse
import hashlib
import json
import shutil


from prepare_art import ROOT, ASSETS, MATTE_MINIMUMS, MATTE_SPREADS, prepare_sprite
from matte_regions import BACKGROUND_SEEDS, BACKGROUND_MINIMUMS
from color_matte import remove_color_matte
from prepare_art import supplied_cutout, standardize_sprite
from PIL import Image, ImageDraw
import numpy as np

VOLTAIC_ENEMIES = {
    "Sparkpip": "sparkpip", "Coppercap Gremlin": "coppercap-gremlin",
    "Coilback Scarab": "coilback-scarab", "Stormhorn Faun": "stormhorn-faun",
    "Thunderclaw Raiju": "thunderclaw-raiju", "Tempestwing Roc": "tempestwing-roc",
    "Crowncoil Kirin": "crowncoil-kirin",
    "Sovereign of the Living Storm": "sovereign-of-the-living-storm",
}

LUMINOUS_ENEMIES = {
    "Glimmerkin": "glimmerkin", "Lanterncap Brownie": "lanterncap-brownie",
    "Prismback Tortoise": "prismback-tortoise", "Dawncrest Guardian": "dawncrest-guardian",
    "Opalwing Griffin": "opalwing-griffin", "Sunmirror Oracle": "sunmirror-oracle",
    "Crownray Kirin": "crownray-kirin",
    "Sovereign of the Sevenfold Dawn": "sovereign-of-the-sevenfold-dawn",
}

TECTONIC_ENEMIES = {
    "Pebblekin": "pebblekin", "Claycap Kobold": "claycap-kobold",
    "Flntback Armadiillo": "flintback-armadillo", "Quartzhorn Ram": "quartzhorn-ram",
    "Geode Cyclops": "geode-cyclops", "Pillarwing Gargoyle": "pillarwing-gargoyle",
    "Crownfault Behemoth": "crownfault-behemoth", "Atlas of the Crystal Summit": "atlas-of-the-crystal-summit",
}

CHAOTIC_ENEMIES = {
    "Riftpip": "riftpip", "Shardcap Gremlin": "shardcap-gremlin",
    "Nullshell Scarab": "nullshell-scarab", "Paradox Sentinel": "paradox-sentinel",
    "Fracturecoil Drake": "fracturecoil-drake", "Riftwing Chimera": "riftwing-chimera",
    "Crownvoid Behemoth": "crownvoid-behemoth",
    "Sovereign of the Impossible Ruin": "sovereign-of-the-impossible-ruin",
}

ATMOSPHERIC_ENEMIES = {
    "Puffling": "puffling", "Reedcap Sylph": "reedcap-sylph",
    "Gustfeather Harpy": "gustfeather-harpy", "Cloudhorn Ibex": "cloudhorn-ibex",
    "Zephyrcoil Drake": "zephyrcoil-drake", "Cyclonewing Griffin": "cyclonewing-griffin",
    "Crownwind Roc": "crownwind-roc", "Regent of the Unbroken Sky": "regent-of-the-unbroken-sky",
}

OMINOUS_ENEMIES = {
    "Duskmote": "duskmote", "Veilcap Imp": "veilcap-imp",
    "Gloomtail Cat": "gloomtail-cat", "Hollowmantle Sentinel": "hollowmantle-sentinel",
    "Umbrasilk Weaver": "umbrasilk-weaver", "Moonless Gargoyle": "moonless-gargoyle",
    "Eclipse Antler Regent": "eclipse-antler-regent",
    "Monarch of the Silent Eclipse": "monarch-of-the-silent-eclipse",
}

VALLEY_KEYS = {
    "duskmote": {"hue": 144, "background_seeds": [(.771104, .832974), (.140422, .34375), (.118506, .40625), (.950487, .853448)]},
    "veilcap-imp": {"hue": 96, "background_seeds": [(.24513, .498922), (.805195, .336207), (.382305, .539871), (.294643, .523707), (.137987, .741379), (.175325, .821121), (.163961, .774784), (.37987, .857759), (.434253, .475216), (.854708, .75), (.145292, .798491), (.890422, .556034)]},
    "gloomtail-cat": {"hue": 162, "background_seeds": [(.36039, .918103), (.606331, .91056), (.348214, .865302), (.393669, .760776), (.668831, .950431), (.430195, .790948), (.520292, .919181)]},
    "hollowmantle-sentinel": {"hue": 169, "background_seeds": [(.470779, .900862), (.585227, .436422), (.286526, .859914), (.433442, .817888)]},
    "umbrasilk-weaver": {"hue": 165, "background_seeds": [(.279221, .849138), (.548701, .832974), (.779221, .820043), (.126623, .827586), (.140422, .367457), (.907468, .863147), (.130682, .477371), (.233766, .28125), (.484578, .146552), (.510552, .112069), (.568994, .125), (.304383, .619612), (.410714, .759698), (.551948, .112069), (.332792, .614224), (.405032, .610991), (.188312, .46444), (.112825, .52694), (.198864, .244612)]},
    "moonless-gargoyle": {"hue": 165, "background_seeds": [(.140422, .307112), (.474026, .831897), (.316558, .673491), (.908279, .717672), (.3125, .788793), (.239448, .909483), (.274351, .530172), (.121753, .209052), (.468344, .903017), (.318182, .838362)]},
    "eclipse-antler-regent": {"hue": 145, "background_seeds": [(.796266, .351293), (.135552, .424569), (.627435, .909483), (.469968, .881466), (.556818, .446121), (.343344, .890086), (.309253, .270474), (.614448, .34806), (.467532, .372845), (.257305, .235991), (.159903, .33944), (.703734, .524784), (.230519, .309267)]},
    "monarch-of-the-silent-eclipse": {"hue": 155, "background_seeds": [(.133929, .424569), (.224838, .477371), (.292208, .550647)]},
    "ominous-seed": {"hue": 160, "background_seeds": [(.709961, .503906), (.536133, .166016), (.441406, .803711), (.606445, .168945), (.552734, .250977), (.759766, .448242), (.802734, .767578), (.726562, .220703), (.790039, .331055), (.830078, .662109), (.775391, .797852), (.594727, .848633), (.762695, .570312), (.484375, .229492), (.360352, .242188), (.897461, .746094), (.693359, .546875), (.791016, .389648), (.560547, .133789), (.630859, .170898)]},
    "ominous-bloom": {"hue": 152, "saturation_min": .07, "tolerance": 18, "background_seeds": [(.34375, .722656), (.617188, .689453), (.498047, .765625), (.50293, .836914)]},
    "ominous-shard": {"hue": 152, "background_seeds": [(.563477, .19043)]},
    "ominous-crest": {"hue": 162, "background_seeds": [(.714844, .728516), (.305664, .746094), (.550781, .733398), (.380859, .8125), (.660156, .801758), (.494141, .754883), (.408203, .763672), (.435547, .751953), (.524414, .750977), (.223633, .743164), (.794922, .683594), (.791016, .81543), (.826172, .74707)]},
    "ominous-heart": {"hue": 161, "saturation_min": .08, "tolerance": 18, "background_seeds": [(.612305, .260742), (.638672, .733398), (.77832, .393555), (.807617, .542969), (.501953, .186523), (.295898, .796875), (.625977, .148438), (.793945, .671875), (.447266, .816406), (.426758, .790039), (.750977, .349609), (.674805, .356445), (.745117, .251953), (.75293, .321289), (.759766, .661133), (.518555, .821289), (.374023, .705078), (.808594, .420898), (.50293, .282227)]},
    "ominous-soul": {"hue": 167, "background_seeds": [(.448242, .411133), (.729492, .275391), (.279297, .644531), (.482422, .424805), (.323242, .53125)]},
}

SKY_KEYS = {
    "puffling": {"hue": 332, "background_seeds": [(.737013, .216595), (.368506, .164871), (.568994, .145474), (.755682, .144397)]},
    "reedcap-sylph": {"hue": 339, "background_seeds": [(.342532, .31681), (.581981, .520474), (.62987, .671336), (.482955, .342672), (.37013, .43319), (.349838, .538793), (.471591, .549569), (.352273, .470905), (.50974, .424569), (.385552, .553879), (.640422, .821121), (.51461, .479526), (.44237, .719828), (.458604, .491379), (.758929, .469828), (.838474, .459052), (.481331, .577586), (.57224, .567888), (.406656, .554957), (.479708, .422414), (.540584, .506466)]},
    "gustfeather-harpy": {"hue": 337, "background_seeds": [(.698864, .584052), (.88961, .663793), (.521104, .710129), (.729708, .646552), (.556818, .614224), (.584416, .615302)]},
    "cloudhorn-ibex": {"hue": 343, "background_seeds": [(.732955, .320043), (.171266, .226293), (.555195, .591595), (.286526, .172414), (.170455, .494612), (.549513, .428879), (.897727, .392241), (.154221, .559267), (.866883, .490302)]},
    "zephyrcoil-drake": {"hue": 192, "tolerance": 7, "value_min": .65, "foreground_value_min": 235, "background_seeds": [(.760552, .775862), (.668831, .320043), (.315747, .510776), (.238636, .463362), (.331981, .684267)]},
    "cyclonewing-griffin": {"hue": 340, "background_seeds": [(.761364, .613147), (.104708, .529095), (.893669, .455819), (.719968, .49569), (.8125, .72306), (.854708, .523707), (.456169, .864224), (.136364, .607759), (.669643, .480603)]},
    "crownwind-roc": {"hue": 325, "background_seeds": [(.386364, .850216), (.579545, .215517), (.112825, .350216), (.590097, .298491), (.512175, .1875), (.497565, .828664), (.462662, .802802), (.604708, .623922), (.150974, .511853), (.82224, .456897), (.142857, .59375)]},
    "regent-of-the-unbroken-sky": {"hue": 342, "background_seeds": [(.665584, .886853), (.813312, .897629), (.506494, .897629), (.395292, .897629), (.103084, .399784), (.149351, .423491), (.29789, .626078), (.872565, .609914), (.184253, .325431), (.262175, .875)]},
    "atmospheric-seed": {"hue": 192, "tolerance": 23, "value_min": .50, "foreground_value_min": 235, "foreground_channel_min": 180, "background_seeds": [(.2, .63)]},
    "atmospheric-bloom": {"hue": 340, "tolerance": 16, "background_seeds": [(.390625, .165039), (.670898, .213867), (.267578, .333008), (.464844, .655273), (.603516, .152344), (.542969, .664062), (.712891, .572266), (.544922, .804688)]},
    "atmospheric-shard": {"hue": 332, "background_seeds": [(.302734, .74707)]},
    "atmospheric-crest": {"hue": 332, "tolerance": 20, "background_seeds": [(.384766, .239258), (.388672, .5625)]},
    "atmospheric-heart": {"hue": 321, "tolerance": 35, "background_seeds": [(.581055, .175781), (.609375, .716797), (.641602, .579102), (.21875, .232422), (.603516, .837891), (.506836, .818359), (.324219, .168945), (.706055, .334961), (.475586, .875), (.368164, .1875), (.400391, .318359), (.65625, .327148), (.682617, .40918), (.674805, .375977), (.110352, .632812), (.164062, .358398)]},
    "atmospheric-soul": {"hue": 332, "tolerance": 35, "lower_matte": {"hue": 290, "tolerance": 15, "top": .91}, "background_seeds": [(.673828, .821289), (.504883, .850586), (.245117, .640625), (.756836, .396484), (.735352, .736328), (.265625, .560547), (.736328, .486328)]},
}

SKY_FOREGROUND_REGIONS = {
    "atmospheric-seed": [
        [(.338, .306), (.354, .251), (.393, .171), (.439, .12), (.486, .088),
         (.546, .063), (.608, .058), (.67, .065), (.735, .091), (.765, .127),
         (.773, .172), (.76, .215), (.732, .251), (.688, .273), (.619, .281),
         (.657, .239), (.636, .245), (.601, .231), (.584, .219), (.574, .20),
         (.57, .184), (.579, .163), (.603, .129), (.615, .091),
         (.573, .103), (.553, .115), (.516, .137), (.477, .17),
         (.431, .216), (.394, .259), (.371, .309)],
        [(.202, .242), (.195, .3), (.214, .346), (.252, .383), (.32, .424),
         (.37, .463), (.357, .399), (.303, .347), (.263, .31), (.234, .263),
         (.224, .301), (.212, .261)],
        [(.413, .468), (.474, .417), (.52, .389), (.569, .372), (.614, .39),
         (.664, .431), (.69, .479), (.704, .531), (.713, .58), (.708, .63),
         (.681, .662), (.654, .669), (.616, .65), (.56, .616), (.505, .572),
         (.461, .519)],
        [(.313, .189), (.294, .224), (.291, .276), (.311, .332),
         (.347, .374), (.361, .381), (.336, .313), (.319, .253)],
        [(.291, .223), (.28, .247), (.269, .299), (.282, .34), (.318, .373),
         (.337, .385), (.314, .344), (.301, .31)],
        [(.143, .366), (.207, .385), (.274, .388), (.312, .409), (.341, .425),
         (.301, .434), (.253, .425), (.207, .403), (.157, .384)],
        [(.235, .437), (.268, .456), (.323, .456), (.355, .444), (.337, .48),
         (.293, .496), (.244, .508), (.216, .511), (.245, .493), (.271, .484)],
        [(.29, .554), (.216, .581), (.166, .614), (.15, .64), (.151, .669),
         (.186, .691), (.228, .679), (.279, .642), (.329, .582), (.317, .569),
         (.272, .622), (.221, .665), (.177, .683), (.164, .664), (.164, .63),
         (.207, .605), (.263, .589), (.29, .578)],
        [(.317, .589), (.325, .666), (.358, .731), (.41, .777), (.48, .822),
         (.52, .819), (.463, .802), (.407, .757), (.376, .715), (.349, .667)],
        [(.348, .605), (.372, .667), (.412, .696), (.49, .716), (.545, .722),
         (.62, .754), (.651, .746), (.68, .765), (.72, .809), (.735, .845),
         (.733, .885), (.702, .926), (.665, .942), (.628, .935), (.654, .947),
         (.693, .944), (.73, .921), (.754, .89), (.765, .863), (.765, .819),
         (.743, .783), (.706, .75), (.655, .716), (.588, .7), (.533, .687),
         (.446, .658), (.393, .628)],
        [(.317, .647), (.291, .703), (.29, .771), (.303, .825), (.329, .877),
         (.349, .902), (.333, .872), (.315, .812), (.306, .758), (.308, .704)],
        [(.718, .774), (.731, .79), (.746, .819), (.734, .845), (.72, .858),
         (.717, .835), (.70, .823), (.673, .819), (.69, .806), (.699, .794)],
        [(.353, .421), (.375, .345), (.404, .303), (.44, .275), (.486, .263),
         (.51, .272), (.535, .29), (.536, .31), (.507, .29), (.458, .297),
         (.42, .321), (.399, .348), (.432, .321), (.475, .309), (.459, .328),
         (.423, .363), (.445, .351), (.466, .339), (.492, .332), (.507, .343),
         (.479, .34), (.455, .354), (.437, .363), (.477, .365), (.497, .369),
         (.471, .379), (.408, .404),
         (.382, .428)],
    ],
}

CHAOS_KEYS = {
    "riftpip": {"hue": 165, "background_seeds": [(.208604, .360991), (.066558, .584052), (.116883, .481681), (.142857, .378233)]},
    "shardcap-gremlin": {"hue": 97, "background_seeds": [(.508117, .872845), (.191558, .325431), (.422078, .628233), (.245942, .440733), (.359578, .676724)]},
    "nullshell-scarab": {"hue": 167, "background_seeds": [(.732143, .267241), (.206981, .758621), (.417208, .823276), (.816558, .823276), (.640422, .811422), (.531656, .798491), (.846591, .711207), (.280844, .663793)]},
    "paradox-sentinel": {"hue": 168, "background_seeds": [(.551948, .844828), (.23539, .565733), (.245942, .668103)]},
    "fracturecoil-drake": {"hue": 152, "background_seeds": [(.225649, .539871), (.704545, .623922), (.560065, .853448), (.569805, .408405)]},
    "riftwing-chimera": {"hue": 162, "background_seeds": [(.279221, .898707), (.538149, .90194), (.448864, .877155)]},
    "crownvoid-behemoth": {"hue": 160, "background_seeds": [(.489448, .882543), (.794643, .303879), (.13961, .483836), (.36526, .627155), (.875, .409483), (.247565, .639009), (.660714, .588362), (.715097, .366379), (.693994, .253233)]},
    "sovereign-of-the-impossible-ruin": {"hue": 143, "background_seeds": [(.829545, .207974), (.255682, .269397), (.896916, .608836)]},
    "chaotic-seed": {"hue": 165, "background_seeds": []},
    "chaotic-bloom": {"hue": 168, "background_seeds": [(.235352, .334961), (.790039, .673828)]},
    "chaotic-shard": {"hue": 164, "background_seeds": []},
    "chaotic-crest": {"hue": 172, "background_seeds": [(.480469, .193359), (.709961, .256836), (.318359, .772461), (.501953, .80957), (.816406, .529297), (.189453, .469727), (.77832, .424805), (.226562, .560547), (.606445, .737305), (.40918, .748047), (.423828, .355469), (.657227, .428711), (.604492, .238281), (.669922, .53418), (.328125, .53125), (.202148, .626953), (.341797, .445312), (.564453, .338867), (.641602, .583008), (.359375, .46582)]},
    "chaotic-heart": {"hue": 171, "background_seeds": [(.765625, .321289), (.335938, .246094), (.449219, .873047), (.210938, .759766), (.238281, .540039)]},
    "chaotic-soul": {"hue": 164, "background_seeds": [(.294922, .722656), (.736328, .236328)]},
}

PRECIPICE_KEYS = {
    "pebblekin": {"hue": 196, "background_seeds": [(0.30763, .751078), (.523539, .753233), (.521916, .720905), (.75974, .725216)]},
    "claycap-kobold": {"hue": 201, "background_seeds": [(.494318, .851293)]},
    "flintback-armadillo": {"hue": 161, "background_seeds": [(.476461, .876078)]},
    "quartzhorn-ram": {"hue": 188, "background_seeds": [(.534903, .868534), (.75487, .204741), (.67289, .685345)]},
    "geode-cyclops": {"hue": 100, "background_seeds": [(.290584, .786638), (.729708, .538793)]},
    "pillarwing-gargoyle": {"hue": 178, "tolerance": 12, "value_min": .65, "background_seeds": [(.491071, .857759)]},
    "crownfault-behemoth": {"hue": 185, "background_seeds": [(.471591, .877155), (.643669, .167026), (.525162, .859914), (.550325, .875)]},
    "atlas-of-the-crystal-summit": {"hue": 191, "tolerance": 6, "background_seeds": [(.283279, .756466), (.527597, .881466)]},
    "tectonic-seed": {"hue": 189, "background_seeds": []},
    "tectonic-bloom": {"hue": 195, "tolerance": 23, "background_seeds": []},
    "tectonic-shard": {"hue": 210, "saturation_min": .12, "background_seeds": []},
    "tectonic-crest": {"hue": 185, "background_seeds": [(.660156, .335938), (.341797, .335938), (.494141, .134766), (.496094, .060547)]},
    "tectonic-heart": {"hue": 201, "background_seeds": []},
    "tectonic-soul": {"hue": 203, "tolerance": 6, "background_seeds": [(.222656, .419922), (.720703, .686523), (.291992, .705078)]},
}

PRECIPICE_FOREGROUND_REGIONS = {
    "atlas-of-the-crystal-summit": [
        [(.35, .32), (.39, .275), (.39, .26), (.407, .20), (.448, .23), (.449, .17),
         (.484, .077), (.536, .147), (.552, .237), (.608, .195), (.624, .25),
         (.646, .22), (.648, .30), (.585, .365), (.558, .388), (.395, .416)],
    ],
    "tectonic-soul": [
        [(.311, .26), (.336, .14), (.398, .224), (.496, .029), (.576, .186),
         (.596, .239), (.679, .124), (.681, .24), (.663, .284), (.673, .346),
         (.69, .33), (.695, .39), (.62, .448), (.347, .449), (.303, .336)],
    ],
}

LUSTROUS_KEYS = {
    "glimmerkin": {"hue": 164, "background_seeds": []},
    "lanterncap-brownie": {"hue": 161, "foreground_value_min": 205, "background_seeds": [(0.498377, 0.889009)]},
    "prismback-tortoise": {"hue": 96, "background_seeds": [(0.614448, 0.835129), (0.336851, 0.84375), (0.17289, 0.493534), (0.122565, 0.75)]},
    "dawncrest-guardian": {"hue": 171, "background_seeds": [(0.282468, 0.8125), (0.548701, 0.83944), (0.798701, 0.268319), (0.323864, 0.577586), (0.219156, 0.636853)]},
    "opalwing-griffin": {"hue": 174, "background_seeds": [(0.469968, 0.154095), (0.731331, 0.550647), (0.357955, 0.831897), (0.129058, 0.681034), (0.602273, 0.851293), (0.782468, 0.43319), (0.546266, 0.351293), (0.794643, 0.296336), (0.211039, 0.46875), (0.577922, 0.485991)]},
    "sunmirror-oracle": {"hue": 169, "background_seeds": [(0.855519, 0.567888), (0.175325, 0.543103), (0.767045, 0.762931)]},
    "crownray-kirin": {"hue": 162, "background_seeds": [(0.76461, 0.324353), (0.152597, 0.702586), (0.762175, 0.767241), (0.502435, 0.801724), (0.62013, 0.823276), (0.397727, 0.829741)]},
    "sovereign-of-the-sevenfold-dawn": {"hue": 174, "background_seeds": [(0.652597, 0.538793), (0.157468, 0.544181), (0.814123, 0.904095), (0.588474, 0.733836), (0.702922, 0.835129)]},
    "luminous-seed": {"hue": 154, "background_seeds": [(0.641602, 0.226562), (0.375977, 0.160156)]},
    "luminous-bloom": {"hue": 66, "background_seeds": [(0.292969, 0.723633), (0.254883, 0.572266), (0.317383, 0.629883), (0.441406, 0.691406), (0.308594, 0.674805), (0.283203, 0.594727), (0.324219, 0.769531), (0.401367, 0.716797), (0.34375, 0.740234)]},
    "luminous-shard": {"hue": 161, "background_seeds": [(0.201172, 0.630859), (0.326172, 0.790039), (0.796875, 0.68457)]},
    "luminous-crest": {"hue": 168, "background_seeds": [(0.171875, 0.373047), (0.858398, 0.385742), (0.182617, 0.489258)]},
    "luminous-heart": {"hue": 155, "background_seeds": [(0.605469, 0.857422), (0.424805, 0.170898), (0.399414, 0.816406), (0.577148, 0.166016), (0.691406, 0.776367), (0.310547, 0.827148), (0.816406, 0.28125), (0.677734, 0.249023), (0.795898, 0.52832), (0.313477, 0.192383), (0.354492, 0.768555), (0.740234, 0.706055)]},
    "luminous-soul": {"hue": 158, "background_seeds": [(0.280273, 0.754883), (0.736328, 0.741211), (0.204102, 0.541992), (0.80957, 0.529297)]},
}

GALVANIC_COLOR_MATTES = {
    "sparkpip": 171, "coppercap-gremlin": 163, "coilback-scarab": 157,
    "stormhorn-faun": 158, "thunderclaw-raiju": 135, "tempestwing-roc": 157,
    "crowncoil-kirin": 108, "sovereign-of-the-living-storm": 156,
    "voltaic-seed": 165, "voltaic-bloom": 111, "voltaic-shard": 166,
    "voltaic-crest": 158, "voltaic-heart": 127, "voltaic-soul": 156,
}

GALVANIC_KEY_OPTIONS = {
    "voltaic-bloom": {"hue": 100, "tolerance": 27},
    "voltaic-seed": {"hue": 145, "tolerance": 36},
    "voltaic-soul": {"hue": 132, "tolerance": 44},
}

GALVANIC_FOREGROUND_REGIONS = {
    "voltaic-seed": [
        [(.45, .256), (.65, .246), (.71, .255), (.69, .266), (.53, .274), (.45, .268)],
        [(.185, .596), (.243, .594), (.305, .704), (.313, .767),
         (.282, .751), (.23, .711), (.198, .643)],
        [(.428, .357), (.482, .349), (.510, .362), (.499, .377), (.470, .385)],
        [(.504, .42), (.587, .415), (.618, .435), (.584, .464), (.542, .451)],
    ],
    "voltaic-soul": [
        [(.05, .03), (.39, .43), (.28, .46), (.17, .25)],
        [(.08, .33), (.31, .39), (.44, .52), (.30, .48)],
        [(.20, .57), (.32, .56), (.43, .66), (.28, .65)],
        [(.27, .74), (.35, .64), (.46, .75), (.36, .81)],
    ],
}

TRANQUILITIC_ENEMIES = {
    "Hushbud": "hushbud", "Bellcap Keeper": "bellcap-keeper",
    "Lotusback Tortoise": "lotusback-tortoise", "Porcelain Crane": "porcelain-crane",
    "Concord Lion": "concord-lion", "Stillbell Oracle": "stillbell-oracle",
    "Harmonywing Kirin": "harmonywing-kirin",
    "Sovereign of the Unbroken Accord": "sovereign-of-the-unbroken-accord",
}

CITY_COLOR_MATTES = {
    "hushbud": 330, "bellcap-keeper": 328, "lotusback-tortoise": 324,
    "porcelain-crane": 328, "concord-lion": 330, "stillbell-oracle": 330,
    "harmonywing-kirin": 339, "sovereign-of-the-unbroken-accord": 338,
    "tranquilitic-seed": 339, "tranquilitic-bloom": 334, "tranquilitic-shard": 348,
    "tranquilitic-heart": 337, "tranquilitic-soul": 331,
}

AQUATIC_ENEMIES = {
    "Pebblefin Sprig": "pebblefin-sprig",
    "Shellcap Kappa": "shellcap-kappa",
    "Brineclaw Sentinel": "brineclaw-sentinel",
    "Coralcrest Nereid": "coralcrest-nereid",
    "Glasswake Kelpie": "glasswake-kelpie",
    "Abyssbell Oracle": "abyssbell-oracle",
    "Pearlscale Leviathan": "pearlscale-leviathan",
    "Sovereign of the Endless Tide": "sovereign-of-the-endless-tide",
}
EFFLORESCENT_ENEMIES = {
    "Budling": "budling",
    "Mosscap Brownie": "mosscap-brownie",
    "Thornshell Beetle": "thornshell-beetle",
    "Petalhorn Satyr": "petalhorn-satyr",
    "Orchid Mantis": "orchid-mantis",
    "Moonbloom Dryad": "moonbloom-dryad",
    "Verdant Antler Regent": "verdant-antler-regent",
    "Empress of the Thousand Blooms": "empress-of-the-thousand-blooms",
}
LANDSCAPES = {
    "Valley of Solitude Banner.png": ("banners", "valley-of-solitude"),
    "Valley of Solitude Arena.png": ("backgrounds", "valley-of-solitude"),
    "Sky-bound Rift Banner.png": ("banners", "sky-bound-rift"),
    "Sky-bound RIft Arena.png": ("backgrounds", "sky-bound-rift"),
    "Ruins of Chaos Banner.png": ("banners", "ruins-of-chaos"),
    "Ruins of Chaos Arena.png": ("backgrounds", "ruins-of-chaos"),
    "Precipice of the Earth Banner.png": ("banners", "precipice-of-the-earth"),
    "Precipice of the Earth Arena.png": ("backgrounds", "precipice-of-the-earth"),
    "Lustrous River Banner.png": ("banners", "lustrous-river"),
    "Lustrous River Battle Arena.png": ("backgrounds", "lustrous-river"),
    "Galvanic Field Banner.png": ("banners", "galvanic-field"),
    "Galvanic Field Arena.png": ("backgrounds", "galvanic-field"),
    "City of Heaven Banner.png": ("banners", "city-of-heaven"),
    "City of Heaven Arena.png": ("backgrounds", "city-of-heaven"),
    "Flaming Depths Banner.png": ("banners", "flaming-depths"),
    "Flaming Depths Battlefield.png": ("backgrounds", "flaming-depths"),
    "Oceanic Valley Banner.png": ("banners", "oceanic-valley"),
    "Oceanic Valley Arena.png": ("backgrounds", "oceanic-valley"),
    "Garden of Beauty Banner.png": ("banners", "garden-of-beauty"),
    "Garden of Beauty Arena.png": ("backgrounds", "garden-of-beauty"),
}


def source_file(filename, category, move):
    source = ROOT / "Art" / "source" / category / filename
    incoming = ROOT / filename
    if move and incoming.exists():
        if source.exists():
            if hashlib.sha256(source.read_bytes()).digest() != hashlib.sha256(incoming.read_bytes()).digest():
                raise FileExistsError(f"Different source already exists: {source}")
            archive = ROOT / "Art" / "source" / "intake-duplicates" / filename
            if archive.exists():
                raise FileExistsError(archive)
            archive.parent.mkdir(parents=True, exist_ok=True)
            incoming.rename(archive)
            print(f"Archived identical intake: {archive.relative_to(ROOT)}")
        else:
            source.parent.mkdir(parents=True, exist_ok=True)
            incoming.rename(source)
    if not source.is_file():
        raise FileNotFoundError(source)
    return source


def has_color_matte(asset_id):
    return asset_id in CITY_COLOR_MATTES or asset_id == "tranquilitic-crest" or asset_id in GALVANIC_COLOR_MATTES or asset_id in LUSTROUS_KEYS or asset_id in PRECIPICE_KEYS or asset_id in CHAOS_KEYS or asset_id in SKY_KEYS or asset_id in VALLEY_KEYS


def lustrous_key_options(asset_id):
    return {"tolerance": 12, "saturation_min": .25, "border_only": True,
            **{key: value for key, value in LUSTROUS_KEYS[asset_id].items() if key != "foreground_value_min"}}


def prepare_lustrous_cutout(image, asset_id):
    threshold = LUSTROUS_KEYS[asset_id].get("foreground_value_min")
    mask = None
    if threshold is not None:
        pixels = np.asarray(image.convert("RGB"))
        mask = Image.fromarray(np.where(pixels.max(axis=2) >= threshold, 255, 0).astype(np.uint8))
    return remove_color_matte(image, foreground_mask=mask, **lustrous_key_options(asset_id))

def precipice_key_options(asset_id):
    return {"tolerance": 12, "saturation_min": .15, "border_only": True, **PRECIPICE_KEYS[asset_id]}


def prepare_precipice_cutout(image, asset_id):
    mask = None
    if asset_id in PRECIPICE_FOREGROUND_REGIONS:
        mask = Image.new("L", image.size)
        draw = ImageDraw.Draw(mask)
        for points in PRECIPICE_FOREGROUND_REGIONS[asset_id]:
            draw.polygon([(round(x * image.width), round(y * image.height)) for x, y in points], fill=255)
    return remove_color_matte(image, foreground_mask=mask, **precipice_key_options(asset_id))


def prepare_dungeon_sprite(source, asset_id, size, content):
    if asset_id in VALLEY_KEYS and not supplied_cutout(asset_id):
        with Image.open(source) as image:
            return standardize_sprite(prepare_valley_cutout(image, asset_id), size, content)
    if asset_id in SKY_KEYS and not supplied_cutout(asset_id):
        with Image.open(source) as image:
            return standardize_sprite(prepare_sky_cutout(image, asset_id), size, content)
    if asset_id in CHAOS_KEYS and not supplied_cutout(asset_id):
        with Image.open(source) as image:
            return standardize_sprite(prepare_chaos_cutout(image, asset_id), size, content)
    if asset_id in PRECIPICE_KEYS and not supplied_cutout(asset_id):
        with Image.open(source) as image:
            return standardize_sprite(prepare_precipice_cutout(image, asset_id), size, content)
    if asset_id in LUSTROUS_KEYS and not supplied_cutout(asset_id):
        with Image.open(source) as image:
            return standardize_sprite(prepare_lustrous_cutout(image, asset_id), size, content)
    if asset_id in GALVANIC_COLOR_MATTES and not supplied_cutout(asset_id):
        with Image.open(source) as image:
            mask = None
            if asset_id in GALVANIC_FOREGROUND_REGIONS:
                mask = Image.new("L", image.size)
                draw = ImageDraw.Draw(mask)
                for points in GALVANIC_FOREGROUND_REGIONS[asset_id]:
                    draw.polygon([(round(x * image.width), round(y * image.height)) for x, y in points], fill=255)
            options = {"hue": GALVANIC_COLOR_MATTES[asset_id], "tolerance": 9,
                       "saturation_min": .12 if asset_id == "voltaic-heart" else .25}
            options.update(GALVANIC_KEY_OPTIONS.get(asset_id, {}))
            return standardize_sprite(remove_color_matte(
                image, foreground_mask=mask, **options), size, content)
    if (asset_id in CITY_COLOR_MATTES or asset_id == "tranquilitic-crest") and not supplied_cutout(asset_id):
        with Image.open(source) as image:
            options = {"hue": CITY_COLOR_MATTES.get(asset_id, 30)}
            if asset_id == "tranquilitic-crest":
                options.update(tolerance=6, saturation_min=.50, value_min=.86, border_only=True)
            elif asset_id == "tranquilitic-shard":
                options.update(tolerance=5, saturation_min=.45, value_min=.85)
            elif asset_id == "tranquilitic-seed":
                options.update(tolerance=30, saturation_min=.05)
            return standardize_sprite(remove_color_matte(image, **options), size, content)
    return prepare_sprite(source, asset_id, size, content,
                          matte_minimum=MATTE_MINIMUMS.get(asset_id, 230),
                          matte_spread=MATTE_SPREADS.get(asset_id, 20),
                          background_seeds=BACKGROUND_SEEDS.get(asset_id, ()),
                          background_minimum=BACKGROUND_MINIMUMS.get(asset_id, 230))


def export_sprite(filename, category, asset_id, move, size, content):
    source = source_file(filename, category, move)
    result = prepare_dungeon_sprite(source, asset_id, size, content)
    output = ROOT / "public" / "assets" / category / f"{asset_id}.png"
    output.parent.mkdir(parents=True, exist_ok=True)
    result.save(output, optimize=True)
    print(f"{output.relative_to(ROOT)}: {size}px RGBA")

def chaos_key_options(asset_id):
    return {"tolerance": 12, "saturation_min": .20, "border_only": True, **CHAOS_KEYS[asset_id]}


def prepare_chaos_cutout(image, asset_id):
    return remove_color_matte(image, **chaos_key_options(asset_id))

def valley_key_options(asset_id):
    return {"tolerance": 12, "saturation_min": .20, "border_only": True, **VALLEY_KEYS[asset_id]}


def prepare_valley_cutout(image, asset_id):
    return remove_color_matte(image, **valley_key_options(asset_id))

def sky_key_options(asset_id):
    return {"tolerance": 12, "saturation_min": .20, "border_only": True,
            **{key: value for key, value in SKY_KEYS[asset_id].items() if key not in ("foreground_value_min", "foreground_channel_min", "lower_matte")}}


def prepare_sky_cutout(image, asset_id):
    mask = Image.new("L", image.size)
    if "foreground_value_min" in SKY_KEYS[asset_id]:
        pixels = np.asarray(image.convert("RGB"))
        mask = Image.fromarray(((pixels.max(axis=2) >= SKY_KEYS[asset_id]["foreground_value_min"]) &
                               (pixels.min(axis=2) >= SKY_KEYS[asset_id].get("foreground_channel_min", 110))).astype(np.uint8) * 255)
    draw = ImageDraw.Draw(mask)
    for points in SKY_FOREGROUND_REGIONS.get(asset_id, []):
        draw.polygon([(round(x * image.width), round(y * image.height)) for x, y in points], fill=255)
    result = remove_color_matte(image, foreground_mask=mask, **sky_key_options(asset_id))
    if "lower_matte" in SKY_KEYS[asset_id]:
        options = SKY_KEYS[asset_id]["lower_matte"]
        protection = Image.new("L", image.size)
        ImageDraw.Draw(protection).rectangle((0, 0, image.width, round(options["top"] * image.height)), fill=255)
        lower = remove_color_matte(image, hue=options["hue"], tolerance=options["tolerance"], foreground_mask=protection)
        pixels = np.array(result)
        pixels[np.asarray(lower)[:, :, 3] == 0] = 0
        result = Image.fromarray(pixels)
    return result


def record_dungeon_intake(pack, element, slug, options, manifest_name, foreground_regions=None):
    entries = []
    files = [(f"{name}.png", "enemies", asset) for name, asset in pack.items()]
    files += [(f"{name} of {element.capitalize()}.png", "materials", f"{element}-{name.lower()}") for name in ("Seed", "Bloom", "Shard", "Crest", "Heart", "Soul")]
    files += [(name, category, asset) for name, (category, asset) in LANDSCAPES.items() if asset == slug]
    for name, category, asset in files:
        source = ROOT / "Art" / "source" / category / name
        runtime = ROOT / "public" / "assets" / category / f"{asset}.png"
        entries.append({"asset": asset, "incoming": name, "source": str(source.relative_to(ROOT)),
                        "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
                        "runtime": str(runtime.relative_to(ROOT)),
                        "runtime_sha256": hashlib.sha256(runtime.read_bytes()).hexdigest(),
                        "processing": {"method": "reviewed border key and enclosed seeds", **options(asset),
                                       **({"foreground_regions": foreground_regions.get(asset, [])} if foreground_regions else {})}
                        if asset != slug else {"method": "unchanged scenery bytes"}})
    (ROOT / "Art" / manifest_name).write_text(json.dumps({"asset_count": len(entries), "assets": entries}, indent=2) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--move-sources", action="store_true")
    parser.add_argument("--elements", nargs="+", choices=["infernic", "aquatic", "efflorescent", "tranquilitic", "voltaic", "luminous", "tectonic", "chaotic", "atmospheric", "ominous"],
                        default=["infernic", "aquatic", "efflorescent", "tranquilitic", "voltaic", "luminous", "tectonic", "chaotic", "atmospheric", "ominous"])
    args = parser.parse_args()
    # Existing Infernic exports remain unchanged; archive duplicate intake only.
    if "infernic" in args.elements:
        for filename, (category, _) in ASSETS.items():
            if (ROOT / filename).is_file() and category == "enemies":
                source_file(filename, category, args.move_sources)
    for element, pack in (("aquatic", AQUATIC_ENEMIES), ("efflorescent", EFFLORESCENT_ENEMIES),
                          ("tranquilitic", TRANQUILITIC_ENEMIES), ("voltaic", VOLTAIC_ENEMIES), ("luminous", LUMINOUS_ENEMIES), ("tectonic", TECTONIC_ENEMIES), ("chaotic", CHAOTIC_ENEMIES), ("atmospheric", ATMOSPHERIC_ENEMIES), ("ominous", OMINOUS_ENEMIES)):
        if element in args.elements:
            for name, asset_id in pack.items():
                export_sprite(f"{name}.png", "enemies", asset_id, args.move_sources, 960, 864)
    for element_id in args.elements:
        element = element_id.capitalize()
        for name in ("Seed", "Bloom", "Shard", "Crest", "Heart", "Soul"):
            export_sprite(f"{name} of {element}.png", "materials",
                          f"{element.lower()}-{name.lower()}", args.move_sources, 256, 224)
    for filename, (category, asset_id) in LANDSCAPES.items():
        element = {"flaming-depths": "infernic", "oceanic-valley": "aquatic",
                   "garden-of-beauty": "efflorescent", "city-of-heaven": "tranquilitic",
                   "galvanic-field": "voltaic", "lustrous-river": "luminous", "precipice-of-the-earth": "tectonic",
                   "ruins-of-chaos": "chaotic", "sky-bound-rift": "atmospheric", "valley-of-solitude": "ominous"}[asset_id]
        if element not in args.elements:
            continue
        source = source_file(filename, category, args.move_sources)
        output = ROOT / "public" / "assets" / category / f"{asset_id}.png"
        output.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, output)
        print(f"{output.relative_to(ROOT)}: original landscape bytes preserved")
    if "chaotic" in args.elements:
        record_dungeon_intake(CHAOTIC_ENEMIES, "chaotic", "ruins-of-chaos",
                              chaos_key_options, "ruins-chaos-intake.json")
    if "ominous" in args.elements:
        record_dungeon_intake(OMINOUS_ENEMIES, "ominous", "valley-of-solitude",
                              valley_key_options, "valley-solitude-intake.json")
    if "atmospheric" in args.elements:
        record_dungeon_intake(ATMOSPHERIC_ENEMIES, "atmospheric", "sky-bound-rift",
                              lambda asset: {**sky_key_options(asset), **{key: SKY_KEYS[asset][key] for key in ("foreground_value_min", "foreground_channel_min", "lower_matte") if key in SKY_KEYS[asset]}},
                              "sky-bound-rift-intake.json", SKY_FOREGROUND_REGIONS)
    if "tectonic" in args.elements:
        entries = []
        files = [(f"{name}.png", "enemies", asset) for name, asset in TECTONIC_ENEMIES.items()]
        files += [(f"{name} of Tectonic.png", "materials", f"tectonic-{name.lower()}") for name in ("Seed", "Bloom", "Shard", "Crest", "Heart", "Soul")]
        files += [(name, category, asset) for name, (category, asset) in LANDSCAPES.items() if asset == "precipice-of-the-earth"]
        for name, category, asset in files:
            source = ROOT / "Art" / "source" / category / name
            runtime = ROOT / "public" / "assets" / category / f"{asset}.png"
            entries.append({"asset": asset, "incoming": name, "source": str(source.relative_to(ROOT)),
                            "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
                            "runtime": str(runtime.relative_to(ROOT)),
                            "runtime_sha256": hashlib.sha256(runtime.read_bytes()).hexdigest(),
                            "processing": {"method": "reviewed border key, enclosed seeds and foreground protection",
                                           **precipice_key_options(asset),
                                           "foreground_regions": PRECIPICE_FOREGROUND_REGIONS.get(asset, [])}
                            if asset in PRECIPICE_KEYS else {"method": "unchanged scenery bytes"}})
        (ROOT / "Art" / "precipice-earth-intake.json").write_text(json.dumps({"asset_count": len(entries), "assets": entries}, indent=2) + "\n", encoding="utf-8")
    if "luminous" in args.elements:
        entries = []
        files = [(f"{name}.png", "enemies", asset) for name, asset in LUMINOUS_ENEMIES.items()]
        files += [(f"{name} of Luminous.png", "materials", f"luminous-{name.lower()}") for name in ("Seed", "Bloom", "Shard", "Crest", "Heart", "Soul")]
        files += [(name, category, asset) for name, (category, asset) in LANDSCAPES.items() if asset == "lustrous-river"]
        for name, category, asset in files:
            source = ROOT / "Art" / "source" / category / name
            runtime = ROOT / "public" / "assets" / category / f"{asset}.png"
            entries.append({"asset": asset, "incoming": name, "source": str(source.relative_to(ROOT)),
                            "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
                            "runtime": str(runtime.relative_to(ROOT)),
                            "runtime_sha256": hashlib.sha256(runtime.read_bytes()).hexdigest(),
                            "processing": {"method": "border-connected color key with reviewed enclosed seeds",
                                           **lustrous_key_options(asset),
                                           **({"foreground_value_min": LUSTROUS_KEYS[asset]["foreground_value_min"]}
                                              if "foreground_value_min" in LUSTROUS_KEYS[asset] else {})}
                            if asset in LUSTROUS_KEYS else {"method": "unchanged scenery bytes"}})
        (ROOT / "Art" / "lustrous-river-intake.json").write_text(json.dumps({"asset_count": len(entries), "assets": entries}, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
