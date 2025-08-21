function joinOrCreate(id: string, key: string, title_key: string, placeholder_key: string): string {
    const position = id === 'createPanel' ? 'right-0' : 'left-0';
    const dataAction = key === 'create' ? 'create-tournament' : 'join-room';
    return `
        <div id="${id}" class="absolute top-0 w-1/2 h-full z-[1] flex items-center justify-center ${position}">
            <form class="bg-white flex flex-col items-center justify-center h-full w-full px-4 sm:px-6 lg:px-10 text-center">
                <h1
                data-langm-key=${title_key}
                class="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-gray-800"></h1> 
                <input 
                data-langm-key=${placeholder_key}
                type="text" id="${key}Input" class="bg-gray-200 text-sm sm:text-base p-2 sm:p-3 rounded w-full mt-2 outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                <div id="${key}_error_message" class="flex justify-center items-center text-red-500 text-xs sm:text-sm font-bold mt-2 w-full sm:w-[80%] lg:w-[60%] bg-red-100 border border-red-300 rounded" style="height: 1.5rem; visibility: hidden;" >
                </div>
                <button 
                data-langm-key=${title_key}
                type="button" id="${key}Btn" data-action="${dataAction}" class="bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold uppercase tracking-wide py-2 sm:py-3 px-8 sm:px-12 rounded mt-3 sm:mt-4 transition-all duration-300 transform hover:scale-105">
                </button>
            </form>
        </div>
    `;
}
function toggleWithJoin():string {
    return `
        <div id="joinSection" class="z-[100] w-full flex flex-col items-center justify-center gap-4 text-center px-6 text-white">
            <h1
            data-langm-key="tournament-first-page.m-title-for-showcreate"
            class="text-2xl sm:text-3xl font-bold"></h1>
            <button
            data-langm-key="tournament-first-page.m-join-button"
            id="showCreate" data-action="show-create" class="bg-transparent border border-white text-white text-xs font-semibold uppercase tracking-wide py-2 px-12 rounded hover:bg-white/10 transition-all duration-300"></button>
        </div>
    `
}
function toggleWithCreate():string {
    return `
        <div id="createSection" class="z-[100] w-full hidden flex-col items-center justify-center gap-4 text-center px-6 text-white">
            <h1
            data-langm-key="tournament-first-page.m-title-for-showjoin"
            class="text-2xl sm:text-3xl font-bold"></h1>
            <button
            data-langm-key="tournament-first-page.m-create-button"
            id="showJoin" data-action="show-join" class="bg-transparent border border-white text-white text-xs font-semibold uppercase tracking-wide py-2 px-12 rounded hover:bg-white/10 transition-all duration-300"></button>
        </div>
    `
}
function createToggleSection(): string {
    return `
        <div id="toggleContainer" class="absolute top-0 w-1/2 h-full z-[10]">
            <div id="fatma" class="bg-gradient-to-r from-indigo-600 to-teal-500 h-full w-[100%] relative flex items-center justify-center">
                ${toggleWithJoin()}
                ${toggleWithCreate()}
            </div>
        </div>
    `;
}

export function t_first_section(container: HTMLElement) {
    container.className = "flex flex-col items-center justify-center min-h-screen w-full absolute top-0 left-0 z-0";
    container.style.background = `
        linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1e3a8a 75%, #1e40af 100%)
    `;
    container.innerHTML = `
        <div class="absolute inset-0 overflow-hidden">
            <div class="absolute inset-0 opacity-5">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="smallGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#smallGrid)" />
                </svg>
            </div>
        </div>
        <button id="homeButton" data-action="go-home" class="absolute top-6 left-6 z-20 group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 hover:border-white/50 rounded-xl p-3 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25">
            <svg class="w-6 h-6 text-white group-hover:text-blue-200 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
        </button>
        
        <div id="tournament-container" class="relative rounded-[30px] shadow-2xl border border-white/20 w-full max-w-2xl min-h-[480px] overflow-hidden backdrop-blur-sm bg-white/10 transition-all-ease font-montserrat z-10">
            <div class="absolute inset-0 overflow-hidden pointer-events-none">
                <div class="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div class="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl"></div>
            </div>
            ${createToggleSection()}
            ${joinOrCreate('createPanel', 'create','tournament-first-page.create-title','tournament-first-page.create-placeholder')}
            ${joinOrCreate('joinPanel', 'join','tournament-first-page.join-title','tournament-first-page.join-placeholder')}
        </div>
    `;
}