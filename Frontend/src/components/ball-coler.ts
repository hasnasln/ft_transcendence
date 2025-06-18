const COLORS = {
	red: '#ff0000',
	green: '#00ff00',
	blue: '#0000ff',
	yellow: '#ffff00',
	magenta: '#ff00ff',
	cyan: '#00ffff',
	black: '#000000'
}

export function activeBallColor(): [number, number, number]
{
	const color = localStorage.getItem('ballColor');

	if (color === COLORS.red) {
		return [1, 0, 0]; // Default color if not set
	} else if (color === COLORS.green) {
		return [0, 1, 0]; // Default color if not set
	} else if (color === COLORS.blue) {
		return [0, 0, 1]; // Default color if not set
	}
	else if (color === COLORS.yellow) {
		return [1, 1, 0]; // Default color if not set
	} else if (color === COLORS.magenta) {
		return [1, 0, 1]; // Default color if not set
	} else if (color === COLORS.cyan) {
		return [0, 1, 1]; // Default color if not set
	} else if (color === COLORS.black) {
		return [0, 0, 0]; // Default color if not set
	} else {
		return [0.7, 0.7, 0.7]; // Default color if not set
	}
}