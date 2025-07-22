interface TournamentMatch {
    player1: string;
    player2: string;
    winner?: string;
    status: 'pending' | 'playing' | 'finished';
    matchId?: string;
    score?: {
        player1: number;
        player2: number;
    };
}

interface TournamentRound {
    matches: TournamentMatch[];
    round: number;
    name: string;
}

interface TournamentData {
    matches: any[];
    participants: string[];
    currentRound: number;
    status: string;
}

export function getTournamentTree(container: HTMLElement, participants: string[], tournamentData?: TournamentData): void {
    const bracketData = tournamentData ? 
        generateTournamentBracketFromData(tournamentData) : 
        generateTournamentBracket(participants);
    container.innerHTML = renderTournamentTree(bracketData);
}
function generateTournamentBracketFromData(tournamentData: TournamentData): TournamentRound[] {
    const rounds: TournamentRound[] = [];
    const participants = tournamentData.participants;
    let currentParticipants = [...participants];
    let roundNumber = 1;
    if (currentParticipants.length % 2 !== 0) {
        currentParticipants.push("BYE");
    }
    
    while (currentParticipants.length > 1) {
        const matches: TournamentMatch[] = [];
        const nextRoundParticipants: string[] = [];
        
        for (let i = 0; i < currentParticipants.length; i += 2) {
            const player1 = currentParticipants[i];
            const player2 = currentParticipants[i + 1];
            
            const realMatch = tournamentData.matches.find(m => {
                const match1 = m.participant1?.username === player1 && m.participant2?.username === player2;
                const match2 = m.participant1?.username === player2 && m.participant2?.username === player1;
                return match1 || match2 || 
                       (m.player1 === player1 && m.player2 === player2) || 
                       (m.player1 === player2 && m.player2 === player1);
            });
            
            let status: 'pending' | 'playing' | 'finished' = 'pending';
            let winner: string | undefined = undefined;
            
            if (realMatch) {
                if (realMatch.status === 'completed' || realMatch.status === 'finished') {
                    status = 'finished';
                } else if (realMatch.status === 'in_progress' || realMatch.status === 'playing') {
                    status = 'playing';
                } else {
                    status = 'pending';
                }
                
                if (realMatch.winner) {
                    winner = realMatch.winner;
                } else if (realMatch.winner_username) {
                    winner = realMatch.winner_username;
                } else if (realMatch.matchWinner) {
                    winner = realMatch.matchWinner === 'leftPlayer' ? 
                        (realMatch.participant1?.username || realMatch.player1) : 
                        (realMatch.participant2?.username || realMatch.player2);
                }
                
                console.log(`Match ${player1} vs ${player2}: status=${status}, winner=${winner}`);
            }
            
            matches.push({
                player1,
                player2,
                winner,
                status,
                matchId: realMatch?.id || realMatch?.match_id,
                score: realMatch?.score || realMatch?.final_score
            });
            
            if (winner) {
                nextRoundParticipants.push(winner);
            } else {
                nextRoundParticipants.push("TBD");
            }
        }
        
        let roundName = '';
        const participantCount = currentParticipants.length;
        
        if (participantCount === 2) {
            roundName = 'FİNAL';
        } else if (participantCount === 4) {
            roundName = 'YARI FİNAL';
        } else if (participantCount === 8) {
            roundName = 'ÇEYREK FİNAL';
        } else if (participantCount === 16) {
            roundName = 'SON 16';
        } else {
            roundName = `${roundNumber}. TUR`;
        }
        
        rounds.push({
            matches,
            round: roundNumber,
            name: roundName
        });
        
        currentParticipants = nextRoundParticipants;
        roundNumber++;
    }
    
    return rounds;
}

function generateTournamentBracket(participants: string[]): TournamentRound[] {
    const rounds: TournamentRound[] = [];
    let currentParticipants = [...participants];
    let roundNumber = 1;
    
    if (currentParticipants.length % 2 !== 0) {
        currentParticipants.push("BYE");
    }
    
    while (currentParticipants.length > 1) {
        const matches: TournamentMatch[] = [];
        const nextRoundParticipants: string[] = [];
        
        for (let i = 0; i < currentParticipants.length; i += 2) {
            const player1 = currentParticipants[i];
            const player2 = currentParticipants[i + 1];
            
            const status: 'pending' | 'playing' | 'finished' = 'pending';
            
            matches.push({
                player1,
                player2,
                winner: undefined,
                status
            });
            
            nextRoundParticipants.push("TBD");
        }
        
        let roundName = '';
        const participantCount = currentParticipants.length;
        
        if (participantCount === 2) {
            roundName = 'FİNAL';
        } else if (participantCount === 4) {
            roundName = 'YARI FİNAL';
        } else if (participantCount === 8) {
            roundName = 'ÇEYREK FİNAL';
        } else if (participantCount === 16) {
            roundName = 'SON 16';
        } else {
            roundName = `${roundNumber}. TUR`;
        }
        
        rounds.push({
            matches,
            round: roundNumber,
            name: roundName
        });
        
        currentParticipants = nextRoundParticipants;
        roundNumber++;
    }
    
    return rounds;
}

function renderTournamentTree(rounds: TournamentRound[]): string {
    if (!document.getElementById("tournament-tree-styles")) {
        const style = document.createElement("style");
        style.id = "tournament-tree-styles";
        style.textContent = `
            .tournament-container {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                overflow-x: auto;
                overflow-y: hidden;
                max-width: 100%;
                min-height: 600px;
                position: relative;
            }
            
            .tournament-bracket {
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-items: center;
                gap: 80px;
                min-width: max-content;
                height: 100%;
                padding: 20px;
            }
            
            .tournament-round {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                position: relative;
                min-width: 250px;
            }
            
            .round-title {
                color: #f1c40f;
                font-size: 20px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 25px;
                padding: 12px 25px;
                background: rgba(241, 196, 15, 0.15);
                border-radius: 20px;
                border: 2px solid #f1c40f;
                text-shadow: 0 0 15px rgba(241, 196, 15, 0.8);
                box-shadow: 0 8px 20px rgba(241, 196, 15, 0.3);
                backdrop-filter: blur(10px);
            }
            
            .matches-container {
                display: flex;
                flex-direction: column;
                gap: 30px;
                align-items: center;
                justify-content: center;
                flex: 1;
            }
            
            .tournament-round:first-child .matches-container {
                gap: 25px;
            }
            
            .tournament-round:nth-child(2) .matches-container {
                gap: 50px;
            }
            
            .tournament-round:last-child .matches-container {
                gap: 80px;
            }
            
            .match-card {
                background: linear-gradient(145deg, #2c3e50 0%, #34495e 50%, #3498db 100%);
                border-radius: 18px;
                padding: 20px;
                min-width: 220px;
                max-width: 250px;
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
                border: 2px solid rgba(255, 255, 255, 0.1);
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                overflow: hidden;
            }
            
            .match-card:hover {
                transform: translateY(-8px) scale(1.05);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                border-color: #f1c40f;
            }
            
            .match-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                transition: left 0.6s ease;
            }
            
            .match-card:hover::before {
                left: 100%;
            }
            
            .player {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 15px;
                margin: 6px 0;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: white;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.3s ease;
                backdrop-filter: blur(5px);
            }
            
            .player:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateX(5px);
            }
            
            .player.winner {
                background: linear-gradient(45deg, #27ae60, #2ecc71) !important;
                color: white !important;
                font-weight: bold !important;
                box-shadow: 0 0 20px rgba(46, 204, 113, 0.8) !important;
                border: 2px solid #27ae60 !important;
                animation: winnerGlow 2s ease-in-out infinite alternate !important;
                transform: translateX(0) !important;
            }
            
            .player.winner:hover {
                background: linear-gradient(45deg, #2ecc71, #27ae60) !important;
                transform: translateX(0) !important;
            }
            
            .player.loser {
                background: rgba(231, 76, 60, 0.3) !important;
                color: #bdc3c7 !important;
                opacity: 0.6 !important;
                border: 1px solid rgba(231, 76, 60, 0.5) !important;
            }
            
            .player.tbd {
                background: rgba(155, 155, 155, 0.2) !important;
                color: #888 !important;
                font-style: italic !important;
                font-weight: normal !important;
                opacity: 0.7 !important;
                border: 1px dashed rgba(155, 155, 155, 0.5) !important;
            }
            
            .player.tbd:hover {
                background: rgba(155, 155, 155, 0.3) !important;
                transform: translateX(0) !important;
            }
            
            .player .score {
                background: rgba(52, 152, 219, 0.8);
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: bold;
                margin-left: 8px;
            }
            
            .player-status {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .player .trophy {
                font-size: 16px;
                animation: bounce 2s infinite;
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-5px);
                }
                60% {
                    transform: translateY(-3px);
                }
            }
            
            .vs-divider {
                text-align: center;
                color: #f1c40f;
                font-weight: bold;
                font-size: 16px;
                margin: 8px 0;
                text-shadow: 0 0 10px rgba(241, 196, 15, 0.8);
                position: relative;
            }
            
            .vs-divider::before,
            .vs-divider::after {
                content: '';
                position: absolute;
                top: 50%;
                width: 30px;
                height: 1px;
                background: linear-gradient(90deg, transparent, #f1c40f, transparent);
            }
            
            .vs-divider::before {
                left: -40px;
            }
            
            .vs-divider::after {
                right: -40px;
            }
            
            .match-status {
                position: absolute;
                top: -12px;
                right: -12px;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                border: 2px solid white;
            }
            
            .status-pending {
                background: #f39c12;
                color: white;
            }
            
            .status-playing {
                background: #e74c3c;
                color: white;
                animation: pulse 2s infinite;
            }
            
            .status-finished {
                background: #27ae60;
                color: white;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
                70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
                100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
            }
            
            @keyframes winnerGlow {
                from { box-shadow: 0 0 20px rgba(46, 204, 113, 0.6); }
                to { box-shadow: 0 0 30px rgba(46, 204, 113, 0.9), 0 0 40px rgba(46, 204, 113, 0.4); }
            }
            
            .final-trophy {
                position: absolute;
                top: -40px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 32px;
                color: #f1c40f;
                text-shadow: 0 0 20px rgba(241, 196, 15, 1);
                animation: trophyGlow 3s ease-in-out infinite alternate;
            }
            
            @keyframes trophyGlow {
                from { 
                    text-shadow: 0 0 20px rgba(241, 196, 15, 1);
                    transform: translateX(-50%) scale(1);
                }
                to { 
                    text-shadow: 0 0 30px rgba(241, 196, 15, 1), 0 0 40px rgba(241, 196, 15, 0.8);
                    transform: translateX(-50%) scale(1.1);
                }
            }
            
            .connection-line {
                position: absolute;
                background: linear-gradient(90deg, #3498db, #f1c40f);
                height: 2px;
                z-index: 1;
            }
        `;
        document.head.appendChild(style);
    }
    
    const roundsHtml = rounds.map((round, index) => `
        <div class="tournament-round">
            <div class="round-title">
                ${round.name}
                ${round.name === 'FİNAL' ? '<div class="final-trophy">🏆</div>' : ''}
            </div>
            <div class="matches-container">
                ${round.matches.map(match => `
                    <div class="match-card">
                        <div class="match-status status-${match.status}">
                            ${match.status === 'pending' ? '⏱' : match.status === 'playing' ? '🎮' : '✓'}
                        </div>
                        <div class="player ${
                            match.player1 === 'TBD' ? 'tbd' : 
                            match.winner === match.player1 ? 'winner' : 
                            match.winner && match.winner !== match.player1 ? 'loser' : ''
                        }" 
                             data-player="${match.player1}" data-winner="${match.winner || ''}">
                            <span>${match.player1 === 'TBD' ? 'Maç Sonucu Bekleniyor' : match.player1}</span>
                            <div class="player-status">
                                ${match.winner === match.player1 ? '<span class="trophy">🏆</span>' : ''}
                                ${match.score ? `<span class="score">${match.score.player1 || 0}</span>` : ''}
                            </div>
                        </div>
                        <div class="vs-divider">${match.player1 === 'TBD' || match.player2 === 'TBD' ? '—' : 'VS'}</div>
                        <div class="player ${
                            match.player2 === 'TBD' ? 'tbd' : 
                            match.winner === match.player2 ? 'winner' : 
                            match.winner && match.winner !== match.player2 ? 'loser' : ''
                        }"
                             data-player="${match.player2}" data-winner="${match.winner || ''}">
                            <span>${match.player2 === 'TBD' ? 'Maç Sonucu Bekleniyor' : match.player2}</span>
                            <div class="player-status">
                                ${match.winner === match.player2 ? '<span class="trophy">🏆</span>' : ''}
                                ${match.score ? `<span class="score">${match.score.player2 || 0}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    return `
        <div class="tournament-container">
            <div class="tournament-bracket">
                ${roundsHtml}
            </div>
        </div>
    `;
}