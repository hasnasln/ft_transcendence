export function loading(container: HTMLElement){
	const div1 = document.createElement('div');
	div1.id = 'loading';
	div1.className = "flex-col gap-4 w-full flex items-center justify-center"

	const div11 = document.createElement('div');
	div11.className = "w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full"
	
	const div111 = document.createElement('div');
	div111.className = "w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full";

	div11.appendChild(div111);
	div1.appendChild(div11);
	container.appendChild(div1);
}

export function loadingWithMessage(container: HTMLElement, message: string){
	const div1 = document.createElement('div');
	loading(div1);
	const div2 = document.createElement('div');
	div2.id = 'loading-message';
	div2.className = "text-red-300 text-lg mt-4";
	if (window.innerWidth < 640) {
		div2.textContent = message;
	}
	container.appendChild(div1);
	container.appendChild(div2);
}

