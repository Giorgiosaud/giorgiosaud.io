import * as Badges from "content/badges/config";
import * as Collections from "content/collections/config";
import * as Notes from "content/notes/config";
import * as Pages from "content/pages/config";
import * as Portfolio from "content/portfolio/config";
import * as Team from "content/team/config";
import { technologies } from "content/technologies/config";

export const collections = {
	technologies,
	...Badges,
	...Pages,
	...Notes,
	...Collections,
	...Team,
	...Portfolio,
};
