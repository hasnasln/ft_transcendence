// Oyna tuşuna basıldıktan sonra bıraktığım sayfa 

export class PlayPage {
	render (container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}
		const paly_div = document.createElement('div');
		paly_div.id = 'play_div';
		paly_div.classList.add(
			'bg-cyan-400',
			'w-full',
			'h-full',
		);
		container.appendChild(paly_div);
	}
}