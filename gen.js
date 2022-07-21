import Eleventy from "@11ty/eleventy";

(async function() {
  let elev = new Eleventy( ".", "_site", {
    // --quiet
    //quietMode: true,

    // --config
    //configPath: ".eleventy.js",

    config: function(eleventyConfig) {
      // Do some custom Configuration API stuff
      // Works great with eleventyConfig.addGlobalData
      eleventyConfig.addPassthroughCopy("styles/");
    },
  });

  // Use `write` or `toJSON` or `toNDJSON`
  elev.write();
})();