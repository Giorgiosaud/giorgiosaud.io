import { auto } from "@cloudinary/url-gen/actions/resize";
import { Cloudinary } from "@cloudinary/url-gen/index";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from "astro:env/server";
const cld = new Cloudinary({
  cloud: {
    cloudName: "giorgiosaud",
    apiKey: CLOUDINARY_API_KEY,
    apiSecret: CLOUDINARY_API_SECRET,
  },
  url: {
    secure: true, // force https, set to false to force http,
    // secureDistribution: 'www.giorgiosaud.io',
  },
});
export const cloudinarySrc = (src) => {
  let cldSrc = cld.image(src).format("auto").quality("auto");
  cldSrc = cldSrc.resize(auto().gravity(autoGravity()).width(300));
  return cldSrc.toURL();
};
