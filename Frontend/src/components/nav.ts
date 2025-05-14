export function renderNav(container: HTMLElement) {
	const nav = document.createElement('nav');
	nav.classList.add(
		'bg-white',					// beyaz arka plan
		'shadow-lg',				// gölge
		'shadow-red-500/50',		// gölge rengi
		'px-4', 'py-4',				// padding
		'sticky',					// yapışkan
		'top-0',					// üstte yapışkan
		'z-50'						//z index
	);

	const cdiv = document.createElement('div');
	cdiv.classList.add(
		'flex',						// flexbox
		'justify-center',			// yatay merkezleme
		'items-center',				// dikey merkezleme
		'flex-row'					// yatay yön
	);
	// Logo
	const logodiv = document.createElement('div');
	logodiv.classList.add(
		'basis-1/4',				// flexbox için
		'flex',					// flexbox
		'justify-center',			// sola yasla
	);
	const logo = document.createElement('a');
	logo.href = '/';
	logo.textContent = 'PONG';
	logo.classList.add(
		'text-2xl',
		'font-bold',
		'text-gray-800',
		'dark:text-white',
		'hover:text-blue-800',
		'dark:hover:text-blue-400',
		'transition-colors',
		'duration-300'
	);

	logodiv.appendChild(logo);

	// Menü
	const uldiv = document.createElement('div');
	uldiv.classList.add(
		'basis-3/4',				// flexbox için
		'flex',						// flexbox
		'justify-center',			// sağa yasla
		'items-center',				// dikey merkezleme
		'flex-row',					// yatay yön
	);
	const ul = document.createElement('ul');
	ul.classList.add(
		'flex',
		'space-x-6',
		'text-lg',
	);

	const links = [
		{ href: '/', text: 'Ana Sayfa' },
		{ href: '/settings', text: 'Ayarlar' },
		{ href: '/profile', text: 'Profil' },
		{ href: '/singin', text: 'Giriş Yap' },
		{ href: '/register', text: 'Kayıt Ol' },
	];

	links.forEach(link => {
		const li = document.createElement('li');
		const a = document.createElement('a');
		a.href = link.href;
		a.setAttribute('data-link', '');	// SPA yönlendirme için
		a.textContent = link.text;
		a.classList.add(
			'relative',					// Alt çizgiyi konumlandırmak için
			'group',					// group-hover için gerekli
			'text-gray-600',
			'hover:text-blue-600',
			'transition-colors',
			'duration-300',
			'font-medium',
			'pb-2'						// Alt çizgiyle arasında boşluk
		);
	
		const span = document.createElement('span');
		span.classList.add(
			'absolute',
			'bottom-0',
			'left-0',
			'w-full',
			'h-0.5',
			'bg-blue-600',
			'transform',
			'scale-x-0',
			'group-hover:scale-x-100',
			'transition-transform',
			'duration-300',
			'ease-in-out'
		);
	
		a.appendChild(span);
		li.appendChild(a);
		ul.appendChild(li);
	});

	uldiv.appendChild(ul);

	cdiv.appendChild(logodiv);
	cdiv.appendChild(uldiv);
	nav.appendChild(cdiv);

	// SPA yönlendirme
	nav.addEventListener('click', (e) => {
		const target = e.target as HTMLElement;
		if (target.matches('a[data-link]')) {
			console.log(target);
			e.preventDefault();
			history.pushState(null, '', target.getAttribute('href')!);
			window.dispatchEvent(new PopStateEvent('popstate'));
		}
	});
	container.appendChild(nav);
}

/*
bir tıklama yapıldığında tıklama yapıln öge target içerisine alınıyor,
sonrasında target matches ile bunun bir a olup data-link e sahip olup olmadığı kontrol ediliyor.
eğer bu koşul sağlanıyorsa e.preventDefault() ile varsayılan davranış engelleniyor.
- a'nın varsayılan davranışı sayfayı yenilemek ve yeni sayfaya gitmektir. -
*/



/*
!history.pushState() Nedir?
history.pushState() metodu, tarayıcı geçmişine yeni bir state (durum) ekler ve bu,
URL'yi değiştirmeye olanak tanır, ancak sayfa yeniden yüklenmez.
Bu yöntem SPA (Single Page Application)'larda, sayfanın yeniden yüklenmeden URL'yi
değiştirmeyi sağlamak için kullanılır.

Genel Söz Dizimi:
history.pushState(state, title, url);
state: Sayfa durumu hakkında herhangi bir veri. Bu, genellikle bir JavaScript nesnesi olabilir.
Burada null kullanıyoruz çünkü bu örnekte sayfa durumuyla ilgili herhangi bir ek bilgiye ihtiyacımız yok.

title: Sayfanın başlığı. Bu, genellikle boş bir string ("") olarak bırakılır
çünkü başlık zaten <title> etiketi ile yönetiliyor.

url: Tarayıcı adres çubuğunda gösterilmesini istediğimiz URL.
Bu, sayfa yenilenmeden, sadece URL'yi değiştirecektir.

*/

//!window.dispatchEvent(new PopStateEvent('popstate')); Burada yapılan sayfa içeriği
//!değiştirip sayfayı yenilemediğimiz için ileri ve geri butunlarnı kullanabilmek için
//! değiştirmişiz gibi durum güncellemesi yapıyoruz.
//! bu fonsiyonların detaylı incelenmesi gerekiyor ???