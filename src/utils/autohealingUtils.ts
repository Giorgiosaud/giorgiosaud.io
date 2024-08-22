import slugify from "slugify";

export const getIdFromSlug = (slug: string) => slug.split("-").pop();
export const getPostSlug = (post: Post) => {
  return `${titleToSlug(post.title)}-${post.id}`;
};

/**
 * Converts input to a URL-safe slug
 * @param {string} title - the title of the post
 * @returns {string} a URL-safe slug based on the post's title
 */
const titleToSlug = (title: string): string => {
  const uriSlug = slugify(title, {
    lower: true, // convert everything to lower case
    trim: true, // remove leading and trailing spaces
  });
  // encode special characters like spaces and quotes to be URL-safe
  return encodeURI(uriSlug);
};
