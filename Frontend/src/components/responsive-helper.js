export function checkPageWidth() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    // alert(`Width: ${width}, Height: ${height}`);
    const cards = document.querySelectorAll('.profile-card');
    const choicesdiv = document.querySelector('#choicesdiv');
    //! ana ekrandaki kartların görünürlüğü ve butonların konumu düzenlendi
    if (width <= 970 || height <= 701) {
        cards.forEach(card => {
            card.classList.add('hidden');
        });
        choicesdiv?.classList.remove('top-[55%]');
    }
    else if (width > 970 || height > 701) {
        cards.forEach(card => {
            card.classList.remove('hidden');
        });
        choicesdiv?.classList.add('top-[55%]');
    }
    const loading_message = document.querySelector('#loading-message');
    if (loading_message) {
        if (width < 640) {
            loading_message.textContent = 'Lütfen Telefonu Yatay Tutunuz';
        }
        else {
            loading_message.textContent = 'İyi eylenceler';
        }
    }
}
