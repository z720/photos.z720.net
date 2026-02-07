// import { I18nPlugin, RenderPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import mustachePlugin from "@11ty/eleventy-plugin-mustache";

export default function (eleventyConfig) {
// module.exports = function(eleventyConfig) {
	let today = new Date();
	eleventyConfig.addPlugin(mustachePlugin);
  eleventyConfig.addPassthroughCopy("assets/");
  eleventyConfig.addGlobalData("today", `${today.toLocaleDateString('fr')}`);
  // Return your Object options:
  eleventyConfig.setDataFileSuffixes([".11tydata"]);
  // return {
  //   jsDataFileSuffix: ".11tydata.js"
  // }
};
