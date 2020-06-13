# simplex-noise
Fast implementation of [simplex](https://en.wikipedia.org/wiki/Simplex_noise) noise. Based on [source](https://github.com/jwagner/simplex-noise.js) of Jonas Wagner. Added octaves, amplitude, scale, and persistance. Good explanation of these parameters may be found [here](https://www.redblobgames.com/maps/terrain-from-noise). Only 3D version + time is implemented. By default all configs === 1
 
# Configuration:
- scale     [0..1] - zoom coefficient. 0 - max zoom, 1 - min zoom
- amplitude [0..1] - means: take all possible height values (1) or only part of it (< 1)
- distrib   [0..X] - 0..1 - get values from top, 1..X get values from buttom
- octaves   [1..X] - amount of details of a 3D map
- random           - reference to random function, which return values between 0..1