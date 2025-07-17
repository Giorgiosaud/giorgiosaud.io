export interface MenuItemsInterface {
	title: string;
	path: string;
	children?: MenuItemsInterface[];
	badge?: boolean;
}
