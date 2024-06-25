import { Cloudinary } from "@cloudinary/url-gen/index";
const cld = new Cloudinary({
    cloud: {
      cloudName: 'giorgiosaud',
      apiKey: import.meta.env.CLOUDINARY_API_KEY,
      apiSecret:import.meta.env.CLOUDINARY_API_SECRET
    },
    url: {
      secure: true, // force https, set to false to force http,
     // secureDistribution: 'www.giorgiosaud.io', 
    }
  }); 
export const cloudinarySrc = (src)=>{
    let cldSrc=cld.image(src).format('auto').quality('auto');
    return cldSrc.toURL();
}