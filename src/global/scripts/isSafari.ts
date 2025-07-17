export function isSafari() {
	const ua = navigator.userAgent;

	// Exclude Chrome and Android
	const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

	return isSafari;
}
