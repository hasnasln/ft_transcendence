/**
 * close button 
 */

export function close_Button(button: HTMLElement, side): void{
	button.classList.add(
		'absolute',
		'top-4',
		side === 'left' ? 'left-4' : 'right-4',
		'text-gray-700',
		'hover:text-gray-900',
		'transition-colors',
		'duration-300',
		'cursor-pointer',
		'bg-blue-500',
		'w-10',
		'h-10',
		'rounded-full',
		'shadow-xl',
		'hower:shadow-2xl',
		'hover:bg-blue-600',
		'hover:scale-110',
		'transform',
		'transition-transform',
	);
}

export function game_button(button: HTMLElement): void {
	button.classList.add(
		'w-[80%]',
		'h-[20%]',
		'bg-blue-500',
		'hover:bg-blue-700',
		'hover:text-black',
		'rounded-3xl',
		'text-white',
		'text-xl',
		'z-10',
		'hover:scale-105',
		'transform',
		'transition-all',
	);
}