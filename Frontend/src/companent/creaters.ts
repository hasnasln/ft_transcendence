
export function creaters(container: HTMLElement, top: string, left: string, range: number, name:string): void {
	
	const img = document.createElement('img');
	img.src = `/creaters/${name}.png`;
	
	const createrDiv = document.createElement('div');
	createrDiv.id = 'creater_div';
	createrDiv.classList.add(
		'w-[400px]',
		'h-[300px]',
		'rounded-full',
		'bg-gray-500',
		'absolute',
		`${left}`,
		`${top}`,
		'overflow-hidden',
	);


	createrDiv.appendChild(img);
	container.appendChild(createrDiv);

	let y = 0;
	let direction = -1;
	const speed = 0.3;
	const baseY = 50;

	function jump()
	{
		y += direction * speed;

		if (y <= -range || y >= range) {
			direction *= -1; // Yön değiştir
		}

		createrDiv.style.transform = `translateY(${baseY + y}px)`;
		requestAnimationFrame(jump);
	}
	jump();
}