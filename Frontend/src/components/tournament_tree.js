function aa(name_one, name_two) {
    const container = document.createElement('div');
    container.classList.add('bg-red-100');
    const div01 = document.createElement('div');
    div01.textContent = name_one;
    container.appendChild(div01);
    if (name_two) {
        const div02 = document.createElement('div');
        div02.textContent = name_two;
        container.appendChild(div02);
    }
    return container;
}
function rount(container) {
    const container01 = document.createElement('div');
    container01.classList.add();
    const x01 = document.createElement('div');
    const matchone = aa('ali', 'ahmet');
    const matchtwo = aa('veli', 'mehmet');
    const x02 = document.createElement('div');
    x02.classList.add();
    const matchthree = aa('ahmet', 'mehmet');
    x01.appendChild(matchone);
    x01.appendChild(matchtwo);
    x02.appendChild(matchthree);
    container01.appendChild(x01);
    container01.appendChild(x02);
    container.appendChild(container01);
}
function rount2(container) {
    const container01 = document.createElement('div');
    container01.classList.add('flex', 'flex-row', 'justify-between', 'items-center', 'gap-4', 'bg-gray-200', 'p-4', 'rounded-lg', 'border', 'border-gray-300', 'shadow-md');
    const x01 = document.createElement('div');
    x01.classList.add('flex', 'flex-col', 'justify-between', 'items-center', 'gap-4', 'bg-gray-100', 'p-4', 'rounded-lg', 'border', 'border-gray-300', 'shadow-sm');
    const matchone = aa('ali', 'ahmet');
    const matchtwo = aa('veli', 'mehmet');
    const matchthree = aa('can', 'osman');
    const x02 = document.createElement('div');
    x02.classList.add('flex', 'flex-col', 'justify-between', 'items-center', 'gap-4', 'bg-gray-100', 'p-4', 'rounded-lg', 'border', 'border-gray-300', 'shadow-sm');
    const x02matchone = aa('ali', 'ahmet');
    const x02matchtwo = aa('veli', 'mehmet');
    const x03 = document.createElement('div');
    x03.classList.add('flex', 'flex-col', 'justify-between', 'items-center', 'gap-4', 'bg-gray-100', 'p-4', 'rounded-lg', 'border', 'border-gray-300', 'shadow-sm');
    const x03matchone = aa('can', 'osman');
    x01.appendChild(matchone);
    x01.appendChild(matchtwo);
    x01.appendChild(matchthree);
    x02.appendChild(x02matchone);
    x02.appendChild(x02matchtwo);
    x03.appendChild(x03matchone);
    container01.appendChild(x01);
    container01.appendChild(x02);
    container01.appendChild(x03);
    container.appendChild(container01);
}
export function getTournamentTree(container, count) {
    container.innerHTML = hcoskun_tree_view([["ahmet", "ali"], ["mehmet", "veli"], ["can", "osman"], ["ayşe", "fatma"], ["zeynep", "elif"], ["murat", "emre"], ["deniz", "selin"], ["burak", "cenk"]]);
    /*
    switch (count) {
        case 3:
        case 4:
            rount(container);
            break;
        case 5:
        case 6:
            rount2(container);
            break;
        case 7:
        case 8:
            rount3(container);
            break;
        case 9:
        case 10:
            rount4(container);
            break;
    }*/
}
function hcoskun_tree_view(participants) {
    let result = "";
    let count = participants.length;
    while (count >= 1) {
        result += hcoskun_round_tree(participants.slice(0, count));
        count /= 2;
    }
    return `
    <div class="flex flex-row justify-between items-center gap-4 bg-gray-200 p-4 rounded-lg border border-gray-300 shadow-md flex">
        <div class="flex flex justify-between items-center gap-4 bg-gray-100 p-4 rounded-lg border border-gray-300 shadow-sm">
            ${result}
        </div>
    </div>
    `;
}
;
function hcoskun_round_tree(participants) {
    return `
        <div class="flex flex-col justify-between items-center gap-4 bg-gray-100 p-4 rounded-lg border border-gray-300 shadow-sm">
            ${hcoskun_round_list(participants)}
        </div>
    `;
}
function hcoskun_round_list(participants) {
    return participants
        .map((p) => `
        <div class = "flex flex-row bg-red-100">
            <div class="bg-red-100 p-2 rounded-lg">${p[0]}</div>
            <div class="bg-red-100 p-2 rounded-lg">${p[1]}</div>
        </div>
        `)
        .join('\n');
}
