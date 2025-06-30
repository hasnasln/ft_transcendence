function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        const r = parseInt(result[1], 16) / 255;
        const g = parseInt(result[2], 16) / 255;
        const b = parseInt(result[3], 16) / 255;
        return [r, g, b];
    }
    return [0.7, 0.7, 0.7];
}

export function activeBallColor(): [number, number, number]
{
	const settings = localStorage.getItem('settings');
	if (settings) {
		try {
			const parsedSettings = JSON.parse(settings);
			if (parsedSettings.ball_color && parsedSettings.ball_color.startsWith('#')) {
				return hexToRgb(parsedSettings.ball_color);
			}
		} catch (e) {
			console.warn('Settings parse error:', e);
		}
	}

	const color = localStorage.getItem('ballColor');
	if (color && color.startsWith('#')) {
		return hexToRgb(color);
	}

	return [0.23, 0.51, 0.96]; 
}