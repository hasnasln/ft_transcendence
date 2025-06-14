import { gameInstance} from '../pages/play';

export function moveButton(container: HTMLElement): void
{
	const controler_container = document.createElement('div');
	controler_container.classList.add(
		'absolute',
		'bottom-[4%]',
		'left-[10%]',
		'flex',
		'flex-col',
		'items-center',
		'justify-center',
		'w-[100px]',
		'h-[100px]',
		'gap-[1vw]',
		// 'bg-red-200',
	);

	const up_b = document.createElement('div');
	up_b.id = 'move-button-up';
	up_b.textContent = '^';
	up_b.classList.add(
		'px-3',
		'py-1',
		'text-xl',
		'text-white',
		'border-none',
		'rounded-[8px]',
		'cursor-pointer',
		'z-30',
		'bg-red-500',
		'z-[1000]',
		'active:bg-red-700',
		'rounded-full'
	);
	

	up_b.addEventListener('touchstart', () => {
		gameInstance.socket!.emit("player-move", { direction: "up" });
		// console.log('UP button pressed');
	});
	up_b.addEventListener('touchend', () => {
		gameInstance.socket!.emit("player-move", { direction: "stop" });
		// console.log('UP button released');
	});

	const down_b = document.createElement('div');
	down_b.id = 'move-button-down';
	down_b.textContent = 'v';
	down_b.classList.add(
		'px-3',
		'py-1',
		'text-xl',
		'text-white',
		'border-none',
		'rounded-[8px]',
		'cursor-pointer',
		'z-30',
		'bg-blue-500',
		'z-[1000]',
		'active:bg-blue-700',
		'rounded-full'
	);

	down_b.addEventListener('touchstart', () => {
		gameInstance.socket!.emit("player-move", { direction: "down" });
		// console.log('DOWN button pressed');
	});

	down_b.addEventListener('touchend', () => {
		gameInstance.socket!.emit("player-move", { direction: "stop" });
		// console.log('DOWN button released');
	});

	controler_container.appendChild(up_b);
	controler_container.appendChild(down_b);
	container.appendChild(controler_container);
}