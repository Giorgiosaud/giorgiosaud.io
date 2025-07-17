import { PUBLIC_CLOUDINARY_CLOUD_NAME } from "astro:env/server";
import { Cloudinary } from "@cloudinary/url-gen";
import * as CloudinaryEffects from "@cloudinary/url-gen/actions/effect";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";

interface CloudinaryProps {
	width?: number;
	height?: number;
	aspectRatio?: string;
	type?: string;
	[key: string]: any;
}
export const cloudinarySrc = (
	src: string,
	{ ...props }: CloudinaryProps = {},
) => {
	const cld = new Cloudinary({
		cloud: {
			cloudName: PUBLIC_CLOUDINARY_CLOUD_NAME,
			// apiKey: CLOUDINARY_API_KEY,
			// apiSecret: CLOUDINARY_API_SECRET,
		},
		url: {
			secure: true, // force https, set to false to force http,
			// secureDistribution: 'www.giorgiosaud.io',
		},
	});
	let cldSrc = cld.image(src).format("auto").quality("auto");
	if (props.type == "portrait") {
		cldSrc = cldSrc
			.resize(auto().width(300).height(400))
			.effect(CloudinaryEffects.removeBackground());
	}
	if (props.width) {
		cldSrc = cldSrc.resize(auto().gravity(autoGravity()).width(props.width));
	}
	if (props.height) {
		cldSrc = cldSrc.resize(auto().gravity(autoGravity()).height(props.height));
	}
	if (props.aspectRatio) {
		cldSrc = cldSrc.resize(
			auto().gravity(autoGravity()).aspectRatio(props.aspectRatio),
		);
	}
	return cldSrc.toURL();
};
