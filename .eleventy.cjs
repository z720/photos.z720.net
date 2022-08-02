module.exports = function(eleventyConfig) {
  let today = new Date();
    eleventyConfig.addPassthroughCopy("assets/");
    eleventyConfig.addGlobalData("today", `${today.toLocaleDateString('fr')}`);
    // Return your Object options:
    return {
      jsDataFileSuffix: ".11tydata.cjs"
    }
  };
