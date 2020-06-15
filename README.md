# simplex-noise
Fast implementation of [simplex](https://en.wikipedia.org/wiki/Simplex_noise) noise using ES6. Based on [source](https://github.com/jwagner/simplex-noise.js) of Jonas Wagner. Added octaves, amplitude, scale, and distribution. Good explanation of these parameters may be found [here](https://www.redblobgames.com/maps/terrain-from-noise). Only 3D version + time is implemented. By default all configs === `1`.
Simplex noise may be used for generationg terrains, clouds, fog and different visualisations. It's
used in game development and computer graphics. The idea behind is very simple. You just need to
create an instance of `Simplex` class and call `noise()` function. It returns height (or z coordinate),
which may be used to create 3D or 2D terrain. Playing with colors and parameters, which are described
below you may generate diffent realistic world.
 
# Configuration:
- `scale     [0..1]` - zoom coefficient. `0` - max zoom, `1` - min zoom
- `amplitude [0..1]` - similar to amplitude in waves. Means a range of returning function values 
- `distrib   [0..X]` - `0..1` - noise function will return top values, `1..X` noise function will return buttom values
- `octaves   [1..X]` - amount of details of a 3D map. Less value, means less details.
- `random`           - reference to random function, which return values between `0..1`. `Math.random()` - by default

# Example
```javascript
let simplex = new Simplex({distrib: 2, scale: .009, octaves: 8, amplitude: .005});
for (let x = 0; x < 128; x++) {
  for (let y = 0; y < 128; y++) {
    const z = simplex.noise(x, y);
    // draw x,y,z point
  }
}
```

# How to run
Just put any html file into Chrome browser

# Screenshots
![simplex noise](https://github.com/tmptrash/simplex-noise/raw/master/screenshot.png)