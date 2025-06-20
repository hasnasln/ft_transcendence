const COLORS = {
    blue:    '#0000ff',
    green:   '#00ff00',
    cyan:    '#00ffff',
    lime:    '#ffff00',
    red:     '#ff0000',
    pink:    '#ff00ff',
    purple:  '#6b21a8',
	rose: 	 '#881337',
	orange:  '#ea580c',
};

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
	else if (color == COLORS.purple) {
		return [0.42, 0.13, 0.66]; // Purple color
	} else if (color == COLORS.rose) {
		return [0.53, 0.08, 0.21]; // Rose color
	} else if (color == COLORS.orange) {
		return [0.92, 0.34, 0.05]; // Orange color
	} else if (color === COLORS.lime) {
		return [0.75, 0.75, 0]; // Lime color
	} else if (color === COLORS.pink) {
		return [1, 0.41, 0.71]; // Pink color
	} else if (color === COLORS.cyan) {
		return [0, 1, 1]; // Cyan color
	} else {
		return [0.7, 0.7, 0.7]; // Default color if not set
	}
}